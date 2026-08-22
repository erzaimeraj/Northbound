import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-stone-200 bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-lg font-bold text-stone-900">
              <span className="text-forest">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 20h18M5 20L12 4l7 16M9 14h6" />
                </svg>
              </span>
              Northbound Goods
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-500">
              Outdoor and lifestyle gear built to last. Designed in the Pacific
              Northwest, tested on the trail, made for the long way around.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Shop
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/shop" className="text-sm text-stone-600 hover:text-forest">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Backpacks" className="text-sm text-stone-600 hover:text-forest">
                  Backpacks
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Apparel" className="text-sm text-stone-600 hover:text-forest">
                  Apparel
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Accessories" className="text-sm text-stone-600 hover:text-forest">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Company
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-stone-600">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-stone-400" />
                hello@northboundgoods.co
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-stone-400" />
                Portland, Oregon
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-stone-400" />
                @northboundgoods
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-stone-200 pt-6">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} Northbound Goods. A portfolio case study project. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
