'use client';

import Link from 'next/link';
import { useCart } from '@/app/store/useCart';
import { useAdmin } from '@/app/hooks/useAdmin';

export default function Header() {
  const { items } = useCart();
  const { isAdmin } = useAdmin();
  
  // Calculate total items in cart
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
        <Link href="/" className="flex items-center">
    <img
      src="/images/logo_black.png"   // path inside /public/images
      alt="E-Shop Logo"
      className="h-10 w-auto"     // adjust size
    />
  </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link href="/products" className="text-gray-600 hover:text-gray-900">
              Products
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin
              </Link>
            )}
          </div>

          {/* Right Side - Cart and User */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 flex items-center">
              <div className="relative">
                <svg className="w-6 h-6" fill={cartItemCount > 0 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L6 3H4m0 0l3 16h14m-3-6v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2m12-4H7" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
              {cartItemCount > 0 && (
                <span className="ml-2 text-sm font-medium hidden sm:inline">Cart ({cartItemCount})</span>
              )}
              {cartItemCount === 0 && (
                <span className="ml-2 text-sm font-medium hidden sm:inline">Cart</span>
              )}
            </Link>

            {/* Admin Access */}
            {isAdmin && (
              <Link href="/admin" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
