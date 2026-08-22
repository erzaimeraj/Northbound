import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Truck, RotateCcw, Mail } from 'lucide-react';
import type { ProductWithImages } from '@/types';
import { fetchFeaturedProducts, fetchProducts, subscribeEmail } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [featured, setFeatured] = useState<ProductWithImages[]>([]);
  const [allProducts, setAllProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subMessage, setSubMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [feat, all] = await Promise.all([
          fetchFeaturedProducts(),
          fetchProducts(),
        ]);
        if (cancelled) return;
        setFeatured(feat);
        setAllProducts(all);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubStatus('loading');
    try {
      await subscribeEmail(email);
      setSubStatus('success');
      setSubMessage('You are on the list. Welcome to Northbound.');
      setEmail('');
    } catch (err) {
      setSubStatus('error');
      setSubMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  const heroProduct = featured[0];
  const editorialProducts = featured.slice(1, 3);
  const gridProducts = allProducts.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-forest text-cream">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3334048/pexels-photo-3334048.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Hiker overlooking a foggy forest by a lake"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-dark via-forest-dark/80 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-burnt-light">
              Built for the long way around
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Gear that goes the distance
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-cream/80">
              Outdoor and lifestyle equipment designed in the Pacific Northwest.
              Durable, sustainable, and made to be used—not replaced.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop" className="btn-burnt">
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop?category=Backpacks"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-cream/30 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
              >
                Explore Backpacks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-stone-200 bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: Leaf, title: 'Sustainably Made', desc: 'Recycled materials and responsible sourcing across our entire line.' },
              { icon: Truck, title: 'Free Shipping Over $75', desc: 'Fast, carbon-neutral shipping on every order over $75.' },
              { icon: RotateCcw, title: '30-Day Returns', desc: 'Not the right fit? Send it back within 30 days, no questions asked.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-forest">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-burnt">
              Featured
            </p>
            <h2 className="mt-2 text-3xl font-bold text-stone-900">
              Our most-loved gear
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden items-center gap-1 text-sm font-semibold text-forest hover:text-forest-light sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-stone-200" />
            ))}
          </div>
        ) : error ? (
          <p className="mt-8 text-sm text-red-600">{error}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {gridProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Editorial featured section — unconventional layout */}
      {heroProduct && editorialProducts.length > 0 && (
        <section className="bg-cream">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Large editorial card */}
              <Link
                to={`/product/${heroProduct.slug}`}
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-stone-900"
                style={{ minHeight: '480px' }}
              >
                <img
                  src={heroProduct.images[0]?.url}
                  alt={heroProduct.images[0]?.alt ?? heroProduct.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
                <div className="relative p-8">
                  <span className="badge bg-burnt text-white">Editor's Pick</span>
                  <h3 className="mt-3 text-2xl font-bold text-white">{heroProduct.name}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
                    {heroProduct.description}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-lg font-bold text-white">
                      {formatPrice(heroProduct.price_cents)}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-burnt-light">
                      Discover <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Two stacked editorial cards */}
              <div className="flex flex-col gap-8">
                {editorialProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}`}
                    className="group relative flex flex-1 items-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60 transition-all duration-300 hover:shadow-lg"
                    style={{ minHeight: '226px' }}
                  >
                    <div className="relative h-full w-2/5 overflow-hidden">
                      <img
                        src={product.images[0]?.url}
                        alt={product.images[0]?.alt ?? product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
                        {product.category}
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-stone-900">{product.name}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-stone-500 line-clamp-2">
                        {product.tagline}
                      </p>
                      <span className="mt-3 text-base font-bold text-stone-900">
                        {formatPrice(product.price_cents)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="bg-forest text-cream">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Mail className="mx-auto h-8 w-8 text-burnt-light" />
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
            Join the Northbound newsletter
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-cream/70">
            New drops, trail stories, and members-only deals. No spam—just the good stuff.
          </p>

          <form onSubmit={handleSubscribe} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="flex-1 rounded-md border border-cream/20 bg-forest-dark/50 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-burnt focus:outline-none focus:ring-2 focus:ring-burnt/30"
            />
            <button
              type="submit"
              disabled={subStatus === 'loading'}
              className="btn-burnt shrink-0"
            >
              {subStatus === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>

          {subStatus === 'success' && (
            <p className="mt-3 text-sm font-medium text-burnt-light">{subMessage}</p>
          )}
          {subStatus === 'error' && (
            <p className="mt-3 text-sm font-medium text-red-300">{subMessage}</p>
          )}
        </div>
      </section>
    </div>
  );
}
