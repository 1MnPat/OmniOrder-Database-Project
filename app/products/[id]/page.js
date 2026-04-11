'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';

function formatMoney(n) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(n) || 0);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { isCustomer } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((body) => {
        if (!cancelled && body.success) setProduct(body.data);
        else if (!cancelled) setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    if (!isCustomer) {
      router.push(`/login?next=/products/${id}`);
      return;
    }
    if (product.stock_quantity <= 0) {
      setMsg('Out of stock.');
      return;
    }
    addItem(product, qty);
    setMsg(`Added ${qty} to cart.`);
    setTimeout(() => setMsg(''), 3000);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20">
        <div className="h-[480px] animate-pulse rounded-card bg-surface-container" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/products" className="mt-6 inline-block text-primary">
          ← Back to catalog
        </Link>
      </div>
    );
  }

  const max = Number(product.stock_quantity) || 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <Link
        href="/products"
        className="text-sm font-medium text-primary hover:underline"
      >
        ← Catalog
      </Link>

      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="relative min-h-[320px] overflow-hidden rounded-card bg-gradient-to-br from-surface-container-low via-white to-surface-container shadow-ambient lg:min-h-[420px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[120px] font-black tracking-tighter text-primary/10">
              GPU
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {product.category_name || 'Graphics'}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-on-surface sm:text-5xl">
            {product.product_name}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
            {product.description || 'Engineered for demanding workloads.'}
          </p>

          <div className="mt-10 rounded-card bg-surface-container-low p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-on-surface-variant">Price</p>
                <p className="text-4xl font-bold tracking-tight">
                  {formatMoney(product.price)}
                </p>
              </div>
              <div className="text-right text-sm text-on-surface-variant">
                {max > 0 ? `${max} in stock` : 'Out of stock'}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-3">
                <span className="text-sm font-medium text-on-surface-variant">
                  Qty
                </span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, max)}
                  className="input-field w-24 py-2"
                  value={qty}
                  onChange={(e) =>
                    setQty(
                      Math.max(
                        1,
                        Math.min(max, parseInt(e.target.value, 10) || 1)
                      )
                    )
                  }
                />
              </label>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={max <= 0}
                className="btn-primary disabled:opacity-50"
              >
                Add to cart
              </button>
              <Link href="/cart" className="text-sm font-semibold text-primary">
                View cart
              </Link>
            </div>
            {msg && (
              <p className="mt-4 text-sm font-medium text-tertiary" role="status">
                {msg}
              </p>
            )}
            {!isCustomer && (
              <p className="mt-4 text-sm text-on-surface-variant">
                Sign in as a customer to add items to your cart.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
