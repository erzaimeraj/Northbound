import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Loader2 } from 'lucide-react';
import type { OrderWithItems } from '@/types';
import { fetchOrderByNumber } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchOrderByNumber(orderNumber);
        if (cancelled) return;
        setOrder(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-stone-900">Order not found</h1>
        <p className="mt-2 text-sm text-stone-500">
          {error ?? 'We could not find this order.'}
        </p>
        <Link to="/shop" className="btn-primary mt-6">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-stone-900">Order Confirmed</h1>
        <p className="mt-2 text-sm text-stone-500">
          Thank you, {order.customer_name.split(' ')[0]}. Your order has been placed
          and saved to our system.
        </p>
      </div>

      {/* Order details card */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Order Number
            </p>
            <p className="mt-1 text-lg font-bold text-stone-900">
              {order.order_number}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Status
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              <Package className="h-3.5 w-3.5" />
              {order.status}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-stone-900">Items</h2>
          <ul className="mt-3 space-y-3">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-stone-900">
                    {item.product_name}
                  </span>
                  <span className="text-stone-400">
                    {'  '}× {item.quantity}
                    {item.variant ? ` (${item.variant})` : ''}
                  </span>
                </div>
                <span className="font-medium text-stone-700">
                  {formatPrice(item.unit_price_cents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Totals */}
        <dl className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">Subtotal</dt>
            <dd className="font-medium text-stone-900">
              {formatPrice(order.subtotal_cents)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">Shipping</dt>
            <dd className="font-medium text-stone-900">
              {order.shipping_cents === 0 ? 'Free' : formatPrice(order.shipping_cents)}
            </dd>
          </div>
          <div className="border-t border-stone-200 pt-2">
            <div className="flex justify-between">
              <dt className="text-base font-bold text-stone-900">Total</dt>
              <dd className="text-base font-bold text-stone-900">
                {formatPrice(order.total_cents)}
              </dd>
            </div>
          </div>
        </dl>

        {/* Shipping address */}
        <div className="mt-5 border-t border-stone-200 pt-4">
          <h2 className="text-sm font-semibold text-stone-900">Shipping To</h2>
          <p className="mt-2 text-sm text-stone-600">
            {order.customer_name}<br />
            {order.address}<br />
            {order.city}, {order.postal_code}<br />
            {order.country}
          </p>
          <p className="mt-2 text-sm text-stone-500">
            A confirmation email has been sent to{' '}
            <span className="font-medium text-stone-700">{order.email}</span>.
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/shop" className="btn-primary">
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
