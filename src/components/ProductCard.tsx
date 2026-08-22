import { Link } from 'react-router-dom';
import { Star, Plus } from 'lucide-react';
import type { ProductWithImages } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface ProductCardProps {
  product: ProductWithImages;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleAdd = () => {
    addItem(product, 1, null);
    showToast(`${product.name} added to cart`);
  };

  const badgeColor = (badge: string | null) => {
    if (!badge) return null;
    if (badge === 'New') return 'bg-burnt text-white';
    if (badge === 'Bestseller') return 'bg-forest text-cream';
    return 'bg-stone-700 text-white';
  };

  return (
    <div className="product-card group">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
          <img
            src={product.images[0]?.url}
            alt={product.images[0]?.alt ?? product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.badge && (
            <span className={`badge absolute left-3 top-3 ${badgeColor(product.badge)}`}>
              {product.badge}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <Star className="h-3.5 w-3.5 fill-burnt text-burnt" />
          <span className="font-medium text-stone-500">{product.rating.toFixed(1)}</span>
          <span className="text-stone-300">·</span>
          <span>{product.category}</span>
        </div>

        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-1.5 text-sm font-semibold text-stone-900 transition-colors hover:text-forest">
            {product.name}
          </h3>
        </Link>

        {product.tagline && (
          <p className="mt-0.5 text-xs text-stone-500 line-clamp-1">{product.tagline}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold text-stone-900">
            {formatPrice(product.price_cents)}
          </span>
          <button
            onClick={handleAdd}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-700 transition-all duration-200 hover:bg-forest hover:text-cream active:scale-90"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
