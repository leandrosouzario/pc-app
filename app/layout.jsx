import './globals.css'

export const metadata = {
  title: 'Painel de Controle',
  description: 'Monitoramento e administração do ecossistema leandrosouza.info.',
  authors: [{ name: 'Leandro Souza' }],
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  )
}
