'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';

export function SiteHeader() {
  const { isAuthenticated, isAdmin, isCustomer, name, logout, ready } =
    useAuth();
  const { count } = useCart();

  return (
    <header className="glass-nav fixed top-0 z-50 w-full shadow-nav">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-on-surface"
        >
          Nexus Commerce
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link
            href="/products"
            className="text-on-surface-variant transition hover:text-primary"
          >
            Catalog
          </Link>
          {isAuthenticated && isCustomer && (
            <>
              <Link
                href="/orders"
                className="text-on-surface-variant transition hover:text-primary"
              >
                Orders
              </Link>
              <Link
                href="/account"
                className="text-on-surface-variant transition hover:text-primary"
              >
                Account
              </Link>
            </>
          )}
          {isAuthenticated && isAdmin && (
            <Link
              href="/admin"
              className="text-on-surface-variant transition hover:text-primary"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative flex items-center text-on-surface"
          >
            <span className="material-symbols-outlined text-[26px]">
              shopping_cart
            </span>
            {count > 0 && (
              <span className="absolute -right-2 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          {!ready ? (
            <span className="h-9 w-16 animate-pulse rounded-lg bg-surface-container" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-[140px] truncate text-sm text-on-surface-variant sm:inline">
                {name}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-surface-container-low"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-low"
              >
                Sign in
              </Link>
              <Link href="/register" className="btn-primary py-2 text-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
