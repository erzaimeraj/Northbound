import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { placeOrder } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { OrderResult } from '@/types';

const FREE_SHIPPING_THRESHOLD = 7500;
const STANDARD_SHIPPING = 795;

interface FormData {
  customer_name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

interface FormErrors {
  customer_name?: string;
  email?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.customer_name.trim() || data.customer_name.trim().length < 2) {
    errors.customer_name = 'Please enter your full name.';
  }
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!data.address.trim() || data.address.trim().length < 5) {
    errors.address = 'Please enter your street address.';
  }
  if (!data.city.trim() || data.city.trim().length < 2) {
    errors.city = 'Please enter your city.';
  }
  if (!data.postal_code.trim() || data.postal_code.trim().length < 3) {
    errors.postal_code = 'Please enter your postal code.';
  }
  return errors;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotalCents, clearCart } = useCart();

  const [formData, setFormData] = useState<FormData>({
    customer_name: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'United States',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const shippingCents =
    subtotalCents >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const totalCents = subtotalCents + shippingCents;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-stone-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-stone-500">
          Add some items before checking out.
        </p>
        <Link to="/shop" className="btn-primary mt-6">
          Browse Products
        </Link>
      </div>
    );
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result: OrderResult = await placeOrder({
        ...formData,
        items: items.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          unit_price_cents: i.unit_price_cents,
          quantity: i.quantity,
          variant: i.variant ?? undefined,
        })),
      });
      clearCart();
      navigate(`/order/${result.order_number}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-stone-900">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Shipping form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="text-lg font-bold text-stone-900">Shipping Information</h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-stone-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                  className={`input-field mt-1.5 ${errors.customer_name ? 'input-error' : ''}`}
                  placeholder="Jane Doe"
                />
                {errors.customer_name && (
                  <p className="mt-1 text-xs text-red-500">{errors.customer_name}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-stone-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`input-field mt-1.5 ${errors.email ? 'input-error' : ''}`}
                  placeholder="jane@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-stone-700">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={`input-field mt-1.5 ${errors.address ? 'input-error' : ''}`}
                  placeholder="123 Trailhead Lane"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={`input-field mt-1.5 ${errors.city ? 'input-error' : ''}`}
                  placeholder="Portland"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  className={`input-field mt-1.5 ${errors.postal_code ? 'input-error' : ''}`}
                  placeholder="97201"
                />
                {errors.postal_code && (
                  <p className="mt-1 text-xs text-red-500">{errors.postal_code}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-stone-700">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="input-field mt-1.5"
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Test payment notice */}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-3 text-xs text-stone-500">
            <Lock className="h-3.5 w-3.5" />
            Test mode checkout — no real payment is processed. Your order will be
            saved to the database with a confirmation number.
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="text-lg font-bold text-stone-900">Order Summary</h2>

            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li
                  key={`${item.product_id}-${item.variant ?? 'default'}`}
                  className="flex gap-3"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center text-sm">
                    <span className="font-medium text-stone-900">
                      {item.product_name}
                    </span>
                    <span className="text-xs text-stone-500">
                      Qty {item.quantity}
                      {item.variant ? ` · ${item.variant}` : ''}
                    </span>
                  </div>
                  <span className="self-center text-sm font-medium text-stone-900">
                    {formatPrice(item.unit_price_cents * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
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
              <div className="border-t border-stone-200 pt-2">
                <div className="flex justify-between">
                  <dt className="text-base font-bold text-stone-900">Total</dt>
                  <dd className="text-base font-bold text-stone-900">
                    {formatPrice(totalCents)}
                  </dd>
                </div>
              </div>
            </dl>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-6 w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing Order…
                </>
              ) : (
                <>
                  Place Order
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {submitError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {submitError}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
