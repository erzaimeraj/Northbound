import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import type { ProductWithImages } from '@/types';
import { fetchProductBySlug, fetchProducts } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/ProductCard';

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const BOOT_SIZES = ['7', '8', '9', '10', '11', '12'];

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [related, setRelated] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [variantError, setVariantError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setActiveImage(0);
        setQuantity(1);
        setSelectedVariant(null);
        setVariantError(false);

        const prod = await fetchProductBySlug(slug);
        if (cancelled) return;
        setProduct(prod);

        if (prod) {
          const all = await fetchProducts();
          if (cancelled) return;
          setRelated(
            all.filter((p) => p.id !== prod.id && p.category === prod.category).slice(0, 4),
          );
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-stone-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-stone-200" />
            <div className="h-6 w-1/4 animate-pulse rounded bg-stone-200" />
            <div className="h-24 w-full animate-pulse rounded bg-stone-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-lg text-red-600">{error}</p>
        <Link to="/shop" className="mt-4 inline-block text-sm font-semibold text-forest hover:text-forest-light">
          Back to Shop
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-lg text-stone-500">Product not found.</p>
        <Link to="/shop" className="mt-4 inline-block text-sm font-semibold text-forest hover:text-forest-light">
          Back to Shop
        </Link>
      </div>
    );
  }

  const variants =
    product.category === 'Apparel'
      ? APPAREL_SIZES
      : product.category === 'Footwear'
        ? BOOT_SIZES
        : null;

  const handleAddToCart = () => {
    if (variants && !selectedVariant) {
      setVariantError(true);
      return;
    }
    addItem(product, quantity, selectedVariant);
    showToast(`${product.name} added to cart`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-stone-100">
            <img
              src={product.images[activeImage]?.url}
              alt={product.images[activeImage]?.alt ?? product.name}
              className="h-full w-full object-cover fade-in"
              key={activeImage}
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-20 w-20 overflow-hidden rounded-lg ring-2 transition-all duration-200 ${
                    activeImage === idx
                      ? 'ring-forest'
                      : 'ring-transparent hover:ring-stone-300'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="h-full w-full object-cover"
                  />
                  {activeImage === idx && (
                    <div className="absolute inset-0 flex items-center justify-center bg-forest/10">
                      <Check className="h-4 w-4 text-forest" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm text-stone-400">
            <Star className="h-4 w-4 fill-burnt text-burnt" />
            <span className="font-medium text-stone-600">{product.rating.toFixed(1)}</span>
            <span>·</span>
            <span>{product.category}</span>
            {product.badge && (
              <span className="badge bg-forest/10 text-forest">{product.badge}</span>
            )}
          </div>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">{product.name}</h1>
          {product.tagline && (
            <p className="mt-1 text-lg text-stone-500">{product.tagline}</p>
          )}

          <p className="mt-4 text-2xl font-bold text-stone-900">
            {formatPrice(product.price_cents)}
          </p>

          <p className="mt-5 text-sm leading-relaxed text-stone-600">
            {product.description}
          </p>

          {/* Variant selector */}
          {variants && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-stone-900">
                  {product.category === 'Footwear' ? 'Size' : 'Size'}
                </label>
                {variantError && (
                  <span className="text-xs font-medium text-red-500">
                    Please select a size
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {variants.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedVariant(size);
                      setVariantError(false);
                    }}
                    className={`min-w-[44px] rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      selectedVariant === size
                        ? 'border-forest bg-forest text-cream'
                        : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="mt-6">
            <label className="text-sm font-semibold text-stone-900">Quantity</label>
            <div className="mt-2 inline-flex items-center rounded-lg border border-stone-300 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-stone-600 transition-colors hover:text-forest disabled:opacity-30"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-semibold text-stone-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="flex h-10 w-10 items-center justify-center text-stone-600 transition-colors hover:text-forest disabled:opacity-30"
                disabled={quantity >= 99}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <div className="mt-8 flex gap-3">
            <button onClick={handleAddToCart} className="btn-primary flex-1">
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </button>
          </div>

          {/* Shipping note */}
          <div className="mt-6 rounded-lg bg-stone-100 px-4 py-3 text-xs text-stone-500">
            Free shipping on orders over $75 · 30-day returns · Ships in 1-2 business days
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-stone-900">You might also like</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
