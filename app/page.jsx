import Header from '@/components/Header'
import ModulePortal from '@/components/ModulePortal'
import ServiceStatus from '@/components/ServiceStatus'
import Roadmap from '@/components/Roadmap'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Header />
      <ModulePortal />
      <ServiceStatus />
      <Roadmap />
      <Footer />
    </main>
  )
}
