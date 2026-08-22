export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  price_cents: number;
  category: string;
  badge: string | null;
  featured: boolean;
  rating: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  position: number;
}

export interface ProductWithImages extends Product {
  images: ProductImage[];
}

export interface CartItem {
  product_id: string;
  product_name: string;
  slug: string;
  unit_price_cents: number;
  quantity: number;
  variant: string | null;
  image_url: string;
}

export interface OrderResult {
  order_id: string;
  order_number: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  variant: string | null;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}
