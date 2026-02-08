'use client'

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-charcoal to-charcoal-light rounded-2xl flex items-center justify-center shadow-soft">
            <span className="text-white text-xl font-bold"><img src="apps\web\src\public\medthread-logo-1.jpeg" /></span>
          </div>
          <h1 className="text-xl font-bold text-charcoal">MedThread</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/" className="text-gray-700 hover:text-yellow-200 transition">Home</a>
          <a href="/doctors" className="text-gray-700 hover:text-yellow-200 transition">Doctors</a>
          <a href="/about" className="text-gray-700 hover:text-yellow-200 transition">About</a>
        </nav>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 hover:text-yellow-200 transition">
            Sign In
          </button>
          <button className="px-4 py-2 bg-charcoal text-white rounded-full hover:bg-charcoal-light transition shadow-soft">
            Get Started
          </button>
        </div>
      </div>
    </header>
  )
}
