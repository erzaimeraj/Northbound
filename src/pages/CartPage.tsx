import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 7500;
const STANDARD_SHIPPING = 795;

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotalCents, totalItems } = useCart();

  if (totalItems === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="mx-auto h-12 w-12 text-stone-300" />
        <h1 className="mt-4 text-2xl font-bold text-stone-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-stone-500">
          Looks like you haven't added anything yet.
        </p>
        <Link to="/shop" className="btn-primary mt-6">
          Browse Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const shippingCents =
    subtotalCents >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const totalCents = subtotalCents + shippingCents;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotalCents;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-stone-900">Your Cart</h1>
      <p className="mt-1 text-sm text-stone-500">
        {totalItems} {totalItems === 1 ? 'item' : 'items'}
      </p>

      {/* Free shipping progress */}
      {remaining > 0 ? (
        <div className="mt-4 rounded-lg bg-forest/5 px-4 py-3 text-sm text-forest-dark">
          You're {formatPrice(remaining)} away from free shipping.
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          You've unlocked free shipping.
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-stone-200 rounded-xl bg-white shadow-sm ring-1 ring-stone-200/60">
            {items.map((item) => (
              <li
                key={`${item.product_id}-${item.variant ?? 'default'}`}
                className="flex gap-4 p-4"
              >
                <Link
                  to={`/product/${item.slug}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-stone-100"
                >
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        to={`/product/${item.slug}`}
                        className="text-sm font-semibold text-stone-900 hover:text-forest"
                      >
                        {item.product_name}
                      </Link>
                      {item.variant && (
                        <p className="mt-0.5 text-xs text-stone-500">
                          Size: {item.variant}
                        </p>
                      )}
                      <p className="mt-0.5 text-sm font-medium text-stone-700">
                        {formatPrice(item.unit_price_cents)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id, item.variant)}
                      className="text-stone-400 transition-colors hover:text-red-500"
                      aria-label={`Remove ${item.product_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="inline-flex items-center rounded-lg border border-stone-300">
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.variant, item.quantity - 1)
                        }
                        className="flex h-8 w-8 items-center justify-center text-stone-600 transition-colors hover:text-forest"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.variant, item.quantity + 1)
                        }
                        className="flex h-8 w-8 items-center justify-center text-stone-600 transition-colors hover:text-forest"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-stone-900">
                      {formatPrice(item.unit_price_cents * item.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/shop"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-forest"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="text-lg font-bold text-stone-900">Order Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Subtotal</dt>
                <dd className="font-medium text-stone-900">
                  {formatPrice(subtotalCents)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Shipping</dt>
                <dd className="font-medium text-stone-900">
                  {shippingCents === 0 ? 'Free' : formatPrice(shippingCents)}
                </dd>
              </div>
              <div className="border-t border-stone-200 pt-3">
                <div className="flex justify-between">
                  <dt className="text-base font-bold text-stone-900">Total</dt>
                  <dd className="text-base font-bold text-stone-900">
                    {formatPrice(totalCents)}
                  </dd>
                </div>
              </div>
            </dl>

            <Link to="/checkout" className="btn-primary mt-6 w-full">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-3 text-center text-xs text-stone-400">
              Secure checkout · Test mode — no real payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
