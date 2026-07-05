import './globals.css'

export const metadata = {
  title: 'Painel Corporativo — Portal Interno',
  description:
    'Ambiente centralizado para acesso a sistemas e módulos corporativos internos.',
  keywords: 'painel corporativo, portal interno, módulos, dashboard',
  authors: [{ name: 'Leandro Souza' }],
  openGraph: {
    title: 'Painel Corporativo',
    description:
      'Portal corporativo privado para acesso a sistemas e módulos internos.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}
