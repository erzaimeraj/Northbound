import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { CATEGORIES } from '@/lib/utils';

export default function Header() {
  const { totalItems } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isShop = location.pathname.startsWith('/shop');
  const isCart = location.pathname === '/cart';

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          className="md:hidden -ml-2 p-2 text-stone-700 hover:text-forest"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-stone-900"
        >
          <span className="text-forest">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 20h18M5 20L12 4l7 16M9 14h6" />
            </svg>
          </span>
          <span className="hidden sm:inline">Northbound Goods</span>
          <span className="sm:hidden">Northbound</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${isHome ? 'text-forest' : 'text-stone-600 hover:text-forest'}`}
          >
            Home
          </Link>
          <Link
            to="/shop"
            className={`text-sm font-medium transition-colors ${isShop ? 'text-forest' : 'text-stone-600 hover:text-forest'}`}
          >
            Shop
          </Link>
          {CATEGORIES.slice(1).map((cat) => (
            <Link
              key={cat}
              to={`/shop?category=${encodeURIComponent(cat)}`}
              className="text-sm font-medium text-stone-600 transition-colors hover:text-forest"
            >
              {cat}
            </Link>
          ))}
        </nav>

        {/* Cart */}
        <Link
          to="/cart"
          className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isCart ? 'text-forest' : 'text-stone-700 hover:text-forest'}`}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="hidden sm:inline">Cart</span>
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-burnt px-1 text-xs font-bold text-white">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-stone-200 bg-cream md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              to="/"
              className="block rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-forest"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="block rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-forest"
              onClick={() => setMobileOpen(false)}
            >
              Shop All
            </Link>
            {CATEGORIES.slice(1).map((cat) => (
              <Link
                key={cat}
                to={`/shop?category=${encodeURIComponent(cat)}`}
                className="block rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-forest"
                onClick={() => setMobileOpen(false)}
              >
                {cat}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
