import { supabase } from '@/lib/supabase';
import type {
  Product,
  ProductImage,
  ProductWithImages,
  Order,
  OrderResult,
  OrderWithItems,
} from '@/types';

export async function fetchProducts(): Promise<ProductWithImages[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load products: ${error.message}`);
  if (!products || products.length === 0) return [];

  const { data: images, error: imgError } = await supabase
    .from('product_images')
    .select('*')
    .order('position', { ascending: true });

  if (imgError) throw new Error(`Failed to load images: ${imgError.message}`);

  const imageList: ProductImage[] = images ?? [];
  return (products as Product[]).map((p) => ({
    ...p,
    images: imageList.filter((img) => img.product_id === p.id),
  }));
}

export async function fetchProductBySlug(
  slug: string,
): Promise<ProductWithImages | null> {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load product: ${error.message}`);
  if (!product) return null;

  const { data: images, error: imgError } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', product.id)
    .order('position', { ascending: true });

  if (imgError) throw new Error(`Failed to load images: ${imgError.message}`);

  return {
    ...(product as Product),
    images: (images ?? []) as ProductImage[],
  };
}

export async function fetchFeaturedProducts(): Promise<ProductWithImages[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .order('rating', { ascending: false })
    .limit(6);

  if (error) throw new Error(`Failed to load featured: ${error.message}`);
  if (!products || products.length === 0) return [];

  const productIds = (products as Product[]).map((p) => p.id);
  const { data: images, error: imgError } = await supabase
    .from('product_images')
    .select('*')
    .in('product_id', productIds)
    .order('position', { ascending: true });

  if (imgError) throw new Error(`Failed to load images: ${imgError.message}`);

  const imageList: ProductImage[] = images ?? [];
  return (products as Product[]).map((p) => ({
    ...p,
    images: imageList.filter((img) => img.product_id === p.id),
  }));
}

export interface PlaceOrderPayload {
  customer_name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  items: {
    product_id: string;
    product_name: string;
    unit_price_cents: number;
    quantity: number;
    variant?: string;
  }[];
}

export async function placeOrder(
  payload: PlaceOrderPayload,
): Promise<OrderResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const url = `${supabaseUrl}/functions/v1/place-order`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Order failed (${res.status})`);
  }

  return data as OrderResult;
}

export async function fetchOrderByNumber(
  orderNumber: string,
): Promise<OrderWithItems | null> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (error) throw new Error(`Failed to load order: ${error.message}`);
  if (!order) return null;

  const { data: items, error: itemsErr } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', (order as Order).id)
    .order('id', { ascending: true });

  if (itemsErr) throw new Error(`Failed to load order items: ${itemsErr.message}`);

  return {
    ...(order as Order),
    order_items: (items ?? []) as OrderWithItems['order_items'],
  };
}

export async function subscribeEmail(email: string): Promise<void> {
  const { error } = await supabase
    .from('subscribers')
    .insert({ email: email.trim().toLowerCase() });

  if (error) {
    if (error.code === '23505') {
      throw new Error('You are already subscribed.');
    }
    throw new Error('Could not subscribe. Please try again.');
  }
}
