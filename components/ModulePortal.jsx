import { MODULES } from '@/lib/modules'
import ModuleCard from '@/components/ModuleCard'

export default function ModulePortal() {
  const featured = MODULES.find((module) => module.featured)
  const others = MODULES.filter((module) => !module.featured)

  return (
    <section
      id="modules"
      className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 px-4 sm:px-6 lg:px-8 pt-5 pb-6 sm:pt-6"
    >
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="mb-4 sm:mb-5 shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Painel Corporativo
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ambiente centralizado para acesso a sistemas e módulos internos.
          </p>
        </div>

        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 content-start">
          {featured && (
            <div className="col-span-2 lg:col-span-2">
              <ModuleCard module={featured} featured />
            </div>
          )}

          {others.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </div>
    </section>
  )
}
