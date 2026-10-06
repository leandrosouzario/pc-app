import os from 'os'
import http from 'http'
import fs from 'fs/promises'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const CPU_THERMAL_TYPES = ['x86_pkg_temp', 'cpu-thermal', 'coretemp', 'k10temp']
const HOST_ROOT = '/host'

function dockerRequest(path) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        socketPath: '/var/run/docker.sock',
        path,
        method: 'GET',
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch {
            resolve([])
          }
        })
      }
    )
    req.on('error', () => resolve(null))
    req.end()
  })
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const parts = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  parts.push(`${m}m`)
  return parts.join(' ')
}

async function readMemInfoExtra() {
  try {
    const text = await fs.readFile('/proc/meminfo', 'utf8')
    const kb = (key) => {
      const line = text.match(new RegExp(`^${key}:\\s+(\\d+)`, 'm'))
      return line ? parseInt(line[1], 10) * 1024 : 0
    }
    const swapTotal = kb('SwapTotal')
    const swapFree = kb('SwapFree')
    return {
      available: kb('MemAvailable') || null,
      swapTotal,
      swapUsed: swapTotal > 0 ? swapTotal - swapFree : 0,
    }
  } catch {
    return { available: null, swapTotal: 0, swapUsed: 0 }
  }
}

async function readThermal() {
  const empty = { cpuC: null, nvmeC: null, maxC: null }
  try {
    const dir = '/sys/class/thermal'
    const entries = await fs.readdir(dir)
    const readings = []

    for (const entry of entries) {
      if (!entry.startsWith('thermal_zone')) continue
      const base = `${dir}/${entry}`
      const [typeRaw, tempRaw] = await Promise.all([
        fs.readFile(`${base}/type`, 'utf8').catch(() => ''),
        fs.readFile(`${base}/temp`, 'utf8').catch(() => ''),
      ])
      const type = typeRaw.trim()
      const match = tempRaw.match(/(\d+)/)
      if (!match) continue
      const celsius = parseInt(match[1], 10) / 1000
      if (celsius <= 0 || celsius > 150) continue
      readings.push({ type, celsius })
    }

    if (readings.length === 0) return empty

    let cpuC = null
    for (const name of CPU_THERMAL_TYPES) {
      const hit = readings.find((r) => r.type === name || r.type.includes(name))
      if (hit) {
        cpuC = Math.round(hit.celsius)
        break
      }
    }

    const nvmeHit = readings.find((r) => r.type.includes('nvme'))
    const nvmeC = nvmeHit ? Math.round(nvmeHit.celsius) : null
    const maxC = Math.round(Math.max(...readings.map((r) => r.celsius)))

    return { cpuC, nvmeC, maxC }
  } catch {
    return empty
  }
}

async function readHostDisk() {
  try {
    const st = await fs.statfs(HOST_ROOT)
    const total = Number(st.blocks) * Number(st.bsize)
    const free = Number(st.bavail) * Number(st.bsize)
    const used = total - free
    return {
      total,
      used,
      free,
      percent: total > 0 ? Math.round((used / total) * 100) : 0,
    }
  } catch {
    return null
  }
}

function parseContainerMemory(stats) {
  if (!stats?.memory_stats?.usage) return null
  const usage = stats.memory_stats.usage
  let limit = stats.memory_stats.limit ?? 0
  const unlimited = limit > 1e15 || limit === 0
  if (unlimited) {
    return { usage, limit: null, percent: null }
  }
  return {
    usage,
    limit,
    percent: Math.min(100, Math.round((usage / limit) * 100)),
  }
}

async function mapContainer(c) {
  const item = {
    id: c.Id?.slice(0, 12) ?? '',
    name: (c.Names?.[0] ?? '').replace(/^\//, ''),
    image: c.Image ?? '',
    state: c.State ?? 'unknown',
    status: c.Status ?? '',
  }
  if (c.State === 'running' && c.Id) {
    const stats = await dockerRequest(`/containers/${c.Id}/stats?stream=false`)
    const memory = parseContainerMemory(stats)
    if (memory) item.memory = memory
  }
  return item
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const [load1, load5, load15] = os.loadavg()
  const cpuCount = os.cpus().length
  const loadPercent = Math.min(100, Math.round((load1 / cpuCount) * 100))

  const [memExtra, thermal, disk, containers] = await Promise.all([
    readMemInfoExtra(),
    readThermal(),
    readHostDisk(),
    dockerRequest('/containers/json?all=true'),
  ])

  const swapPercent =
    memExtra.swapTotal > 0
      ? Math.round((memExtra.swapUsed / memExtra.swapTotal) * 100)
      : null

  const containerList = Array.isArray(containers)
    ? await Promise.all(containers.map(mapContainer))
    : null

  return NextResponse.json({
    cpu: {
      load1: load1.toFixed(2),
      load5: load5.toFixed(2),
      load15: load15.toFixed(2),
      count: cpuCount,
      percent: loadPercent,
    },
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      percent: Math.round((usedMem / totalMem) * 100),
      available: memExtra.available,
      swapTotal: memExtra.swapTotal,
      swapUsed: memExtra.swapUsed,
      swapPercent,
    },
    thermal,
    disk,
    server: {
      hostname: os.hostname(),
      uptime: formatUptime(os.uptime()),
      platform: os.platform(),
      arch: os.arch(),
    },
    containers: containerList,
  })
}
