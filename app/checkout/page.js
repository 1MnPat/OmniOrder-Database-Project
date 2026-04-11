'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { api, ApiError } from '@/lib/api-client';

function formatMoney(n) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(n) || 0);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isCustomer, ready } = useAuth();
  const { items, subtotal, clear } = useCart();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function placeOrder() {
    if (items.length === 0) return;
    setError('');
    setLoading(true);
    try {
      const payload = {
        items: items.map((x) => ({
          product_id: x.product_id,
          quantity: x.quantity,
        })),
      };
      const data = await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      clear();
      router.push(`/orders/${data.order_id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not place order.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <div className="h-40 animate-pulse rounded-card bg-surface-container" />
      </div>
    );
  }

  if (!isCustomer) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-4 text-on-surface-variant">
          Customer sign-in required to place orders.
        </p>
        <Link href="/login?next=/checkout" className="btn-primary mt-8 inline-block">
          Sign in
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-4 text-on-surface-variant">Your cart is empty.</p>
        <Link href="/products" className="btn-primary mt-8 inline-block">
          Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-2 text-on-surface-variant">
        One order per checkout (API places each line via{' '}
        <code className="rounded bg-surface-container px-1 text-xs">
          sp_place_order
        </code>
        ).
      </p>

      <div className="mt-10 rounded-card bg-surface-container-low p-8 shadow-ambient">
        <ul className="space-y-4">
          {items.map((x) => (
            <li
              key={x.product_id}
              className="flex justify-between text-sm"
            >
              <span>
                {x.product_name} × {x.quantity}
              </span>
              <span>{formatMoney(x.unit_price * x.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-between border-t border-surface-container pt-6 text-lg font-bold">
          <span>Total</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
      </div>

      {error && (
        <div
          className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={placeOrder}
        className="btn-primary mt-8 w-full disabled:opacity-60"
      >
        {loading ? 'Placing order…' : 'Place order'}
      </button>
    </div>
  );
}
