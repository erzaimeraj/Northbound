import type { Product, ProductImage, ProductWithImages } from '@/types';

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function buildProductWithImages(
  product: Product,
  images: ProductImage[],
): ProductWithImages {
  return {
    ...product,
    images: images
      .filter((img) => img.product_id === product.id)
      .sort((a, b) => a.position - b.position),
  };
}

export const CATEGORIES = [
  'All',
  'backpacks',
  'apparel',
  'accessories',
  'footwear',
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
] as const;
