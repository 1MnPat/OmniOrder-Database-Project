'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/products?limit=6')
      .then((r) => r.json())
      .then((body) => {
        if (!cancelled && body.success && body.data?.data) {
          setProducts(body.data.data);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-20 sm:px-8 lg:flex-row lg:items-center lg:py-28">
          <div className="max-w-xl flex-1">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              The Silicon Gallery
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight text-on-surface sm:text-6xl">
              Power,
              <br />
              reimagined.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
              Editorial layouts meet real inventory. Browse our GPU catalog —
              asymmetry, space, and hardware that reads like industrial art.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary inline-block text-center">
                Shop catalog
              </Link>
              <Link
                href="/register"
                className="btn-secondary inline-block text-center"
              >
                Create account
              </Link>
            </div>
          </div>
          <div className="relative flex flex-1 justify-end lg:min-h-[360px]">
            <div className="relative h-72 w-full max-w-lg rounded-card bg-gradient-to-br from-primary/10 via-surface-container to-surface-container-low shadow-ambient lg:h-96">
              <div className="absolute -right-8 bottom-8 left-8 top-8 rounded-card bg-surface-container-lowest/80 shadow-ambient backdrop-blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <span className="text-8xl font-black tracking-tighter text-primary/15">
                  RTX
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-on-surface">
                Featured hardware
              </h2>
              <p className="mt-2 text-on-surface-variant">
                Pulled live from your Nexus Commerce API.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-card bg-surface-container"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="rounded-card bg-surface-container-lowest p-12 text-center text-on-surface-variant shadow-ambient">
              No products yet. Seed your database or add stock as an admin.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
