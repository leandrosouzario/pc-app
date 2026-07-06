'use client'

import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/Header'

const INTERVALS = {
  system: 5000,
  containers: 10000,
}

function pct(value) {
  if (value < 60) return 'text-emerald-400'
  if (value < 85) return 'text-amber-400'
  return 'text-red-400'
}

function barColor(value) {
  if (value < 60) return 'bg-emerald-500'
  if (value < 85) return 'bg-amber-500'
  return 'bg-red-500'
}

function stateBadge(state) {
  const map = {
    running: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    exited: 'bg-slate-700/60 text-slate-400 border-slate-600/30',
    paused: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    restarting: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dead: 'bg-red-500/15 text-red-400 border-red-500/30',
  }
  return map[state] ?? 'bg-slate-700/60 text-slate-400 border-slate-600/30'
}

function formatBytes(bytes) {
  const gb = bytes / (1024 ** 3)
  if (gb >= 1) return `${gb.toFixed(1)} GB`
  return `${(bytes / (1024 ** 2)).toFixed(0)} MB`
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor(value)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900 p-5 ${className}`}>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Skeleton() {
  return <div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/metrics')
      if (!res.ok) throw new Error('Falha ao carregar métricas')
      const data = await res.json()
      setMetrics(data)
      setLastUpdate(new Date())
      setError('')
    } catch {
      setError('Não foi possível carregar as métricas. Verifique a conexão.')
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
    const systemTimer = setInterval(fetchMetrics, INTERVALS.system)
    return () => clearInterval(systemTimer)
  }, [fetchMetrics])

  const cpu = metrics?.cpu
  const mem = metrics?.memory
  const server = metrics?.server
  const containers = metrics?.containers

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Painel de Controle</h1>
            <p className="text-sm text-slate-500">
              {lastUpdate
                ? `Atualizado às ${lastUpdate.toLocaleTimeString('pt-BR')}`
                : 'Carregando...'}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchMetrics}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-colors"
          >
            Atualizar
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* CPU */}
          <Card title="CPU">
            {!cpu ? (
              <div className="space-y-3">
                <Skeleton />
                <Skeleton />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className={`text-4xl font-bold tabular-nums ${pct(cpu.percent)}`}>
                    {cpu.percent}%
                  </span>
                  <span className="text-sm text-slate-500">{cpu.count} vCPUs</span>
                </div>
                <ProgressBar value={cpu.percent} />
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[['1 min', cpu.load1], ['5 min', cpu.load5], ['15 min', cpu.load15]].map(([label, val]) => (
                    <div key={label} className="text-center">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-sm font-semibold text-slate-200">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Memória */}
          <Card title="Memória">
            {!mem ? (
              <div className="space-y-3">
                <Skeleton />
                <Skeleton />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className={`text-4xl font-bold tabular-nums ${pct(mem.percent)}`}>
                    {mem.percent}%
                  </span>
                  <span className="text-sm text-slate-500">{formatBytes(mem.total)} total</span>
                </div>
                <ProgressBar value={mem.percent} />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <p className="text-xs text-slate-500">Usado</p>
                    <p className="text-sm font-semibold text-slate-200">{formatBytes(mem.used)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Livre</p>
                    <p className="text-sm font-semibold text-slate-200">{formatBytes(mem.free)}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Servidor */}
          <Card title="Servidor">
            {!server ? (
              <div className="space-y-3">
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  ['Hostname', server.hostname],
                  ['Uptime', server.uptime],
                  ['Plataforma', `${server.platform} (${server.arch})`],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-medium text-slate-200">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Containers */}
          <Card title="Containers Docker">
            {containers === undefined ? (
              <div className="space-y-3">
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </div>
            ) : containers === null ? (
              <p className="text-sm text-slate-500">
                Socket Docker não disponível. Monte <code className="text-xs text-slate-400">/var/run/docker.sock</code> no container.
              </p>
            ) : containers.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum container encontrado.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {containers.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-800/50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">{c.name}</p>
                      <p className="truncate text-xs text-slate-500">{c.status}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${stateBadge(c.state)}`}
                    >
                      {c.state}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
