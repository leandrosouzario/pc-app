export default function Footer() {
  return (
    <footer id="footer" className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm text-slate-500">
          Painel Corporativo &middot; Ambiente interno
        </p>
        <p className="text-xs text-slate-400 mt-2">
          &copy; {new Date().getFullYear()} Leandro Souza
        </p>
      </div>
    </footer>
  )
}
