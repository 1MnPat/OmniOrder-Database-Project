'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';

function formatMoney(n) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(n) || 0);
}

export default function CartPage() {
  const router = useRouter();
  const { isCustomer } = useAuth();
  const { items, subtotal, setQty, removeItem } = useCart();

  if (!isCustomer) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart</h1>
        <p className="mt-4 text-on-surface-variant">
          Sign in as a customer to use the cart and checkout.
        </p>
        <Link href="/login?next=/cart" className="btn-primary mt-8 inline-block">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Cart</h1>
      <p className="mt-2 text-on-surface-variant">
        Review lines before placing your order.
      </p>

      {items.length === 0 ? (
        <div className="mt-12 rounded-card bg-surface-container-low p-12 text-center shadow-ambient">
          <p className="text-on-surface-variant">Your cart is empty.</p>
          <Link
            href="/products"
            className="btn-primary mt-6 inline-block"
          >
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          {items.map((line) => (
            <div
              key={line.product_id}
              className="flex flex-col gap-4 rounded-card bg-surface-container-lowest p-6 shadow-ambient sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/products/${line.product_id}`}
                  className="text-lg font-semibold text-on-surface hover:text-primary"
                >
                  {line.product_name}
                </Link>
                <p className="text-sm text-on-surface-variant">
                  {formatMoney(line.unit_price)} each
                </p>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={1}
                  max={line.stock_quantity}
                  className="input-field w-24 py-2"
                  value={line.quantity}
                  onChange={(e) =>
                    setQty(line.product_id, parseInt(e.target.value, 10) || 1)
                  }
                />
                <span className="min-w-[100px] text-right font-semibold">
                  {formatMoney(line.unit_price * line.quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(line.product_id)}
                  className="text-sm text-error hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-col items-end gap-4 border-t border-transparent pt-8">
            <p className="text-xl font-bold">
              Subtotal {formatMoney(subtotal)}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => router.push('/checkout')}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
