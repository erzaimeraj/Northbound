import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import type { ProductWithImages } from '@/types';
import { fetchProducts } from '@/lib/api';
import { CATEGORIES, SORT_OPTIONS } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? 'All';
  const sort = (searchParams.get('sort') as SortValue) ?? 'newest';

  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (category !== 'All') {
      result = result.filter((p) => p.category === category);
    }
    const sorted = [...result];
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price_cents - b.price_cents);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price_cents - a.price_cents);
        break;
      case 'newest':
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
    }
    return sorted;
  }, [products, category, sort]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'All' || value === 'newest') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
          {category === 'All' ? 'All Products' : category}
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          {loading
            ? 'Loading products…'
            : `${filtered.length} ${filtered.length === 1 ? 'item' : 'items'}`}
        </p>
      </div>

      {/* Filters + sort bar */}
      <div className="mb-8 flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                category === cat
                  ? 'bg-forest text-cream'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-stone-400" />
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-stone-200" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-stone-500">
            No products found in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
