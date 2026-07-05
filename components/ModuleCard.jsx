import Link from 'next/link'

function StatusBadge({ status, label }) {
  const styles = {
    active: 'bg-blue-50 text-blue-700 border-blue-200',
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    coming_soon: 'bg-slate-100 text-slate-500 border-slate-200',
  }

  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {label}
    </span>
  )
}

function CardAction({ module }) {
  if (module.href) {
    return (
      <span className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white group-hover:bg-blue-700 transition-colors">
        Acessar
      </span>
    )
  }

  if (module.status === 'active') {
    return (
      <span className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
        Ambiente atual
      </span>
    )
  }

  return (
    <span className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 text-slate-500 cursor-not-allowed">
      Em breve
    </span>
  )
}

export default function ModuleCard({ module, featured = false }) {
  const isClickable = Boolean(module.href)

  const cardClasses = module.featured
    ? 'border-2 border-blue-600 bg-blue-50/40 shadow-md hover:shadow-lg'
    : isClickable
      ? 'border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300'
      : 'border border-slate-200 bg-slate-50/80'

  const sizeClasses = featured
    ? 'p-5 sm:p-6'
    : 'p-4 sm:p-5'

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`${featured ? 'text-3xl' : 'text-2xl'}`} aria-hidden="true">
          {module.icon}
        </span>
        <div className="flex flex-wrap gap-1 justify-end">
          {module.featured && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white">
              Principal
            </span>
          )}
          <StatusBadge status={module.status} label={module.statusLabel} />
        </div>
      </div>

      <h3 className={`font-semibold text-slate-900 mb-1.5 ${featured ? 'text-lg sm:text-xl' : 'text-base'}`}>
        {module.name}
      </h3>

      <p className={`text-slate-600 leading-snug flex-1 ${featured ? 'text-sm' : 'text-xs sm:text-sm'}`}>
        {module.shortDescription}
      </p>

      <div className="mt-4">
        <CardAction module={module} />
      </div>
    </>
  )

  if (isClickable) {
    return (
      <Link
        href={module.href}
        className={`group flex flex-col h-full rounded-xl transition-all duration-200 ${cardClasses} ${sizeClasses}`}
      >
        {inner}
      </Link>
    )
  }

  return (
    <div className={`flex flex-col h-full rounded-xl ${cardClasses} ${sizeClasses}`} aria-disabled={!module.href}>
      {inner}
    </div>
  )
}
