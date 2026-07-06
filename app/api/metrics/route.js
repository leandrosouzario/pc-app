import os from 'os'
import http from 'http'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function dockerRequest(path) {
  return new Promise((resolve, reject) => {
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

  const containers = await dockerRequest('/containers/json?all=true')

  const containerList = Array.isArray(containers)
    ? containers.map((c) => ({
        id: c.Id?.slice(0, 12) ?? '',
        name: (c.Names?.[0] ?? '').replace(/^\//, ''),
        image: c.Image ?? '',
        state: c.State ?? 'unknown',
        status: c.Status ?? '',
      }))
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
    },
    server: {
      hostname: os.hostname(),
      uptime: formatUptime(os.uptime()),
      platform: os.platform(),
      arch: os.arch(),
    },
    containers: containerList,
  })
}
