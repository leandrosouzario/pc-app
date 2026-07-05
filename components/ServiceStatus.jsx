import { SERVICE_STATUS } from '@/lib/modules'

export default function ServiceStatus() {
  return (
    <section id="status" className="py-8 sm:py-10 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          Status dos Serviços
        </h2>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          {SERVICE_STATUS.map((service) => (
            <div
              key={service.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-sm"
            >
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                aria-hidden="true"
              />
              <span className="text-slate-700 font-medium">{service.name}</span>
              <span className="text-emerald-600 text-xs font-medium">Online</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
