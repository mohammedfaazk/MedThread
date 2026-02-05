'use client'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">M</span>
          </div>
          <h1 className="text-xl font-bold">MedThread</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/" className="text-gray-700 hover:text-orange-500 transition">Home</a>
          <a href="/doctors" className="text-gray-700 hover:text-orange-500 transition">Doctors</a>
          <a href="/about" className="text-gray-700 hover:text-orange-500 transition">About</a>
        </nav>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 hover:text-orange-500 transition">
            Sign In
          </button>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
            Get Started
          </button>
        </div>
      </div>
    </header>
  )
}
