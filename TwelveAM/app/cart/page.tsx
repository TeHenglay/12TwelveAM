'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ChangeEvent } from 'react';
import { useCart } from '@/app/store/useCart';
import { useSearchParams } from 'next/navigation';

function CartContent() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [purchaseLimit, setPurchaseLimit] = useState<any>(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check for purchase limit errors
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'purchase_limit_exceeded') {
      setShowLimitWarning(true);
    }

    // Check current purchase limits
    const checkLimits = async () => {
      try {
        const response = await fetch('/api/purchase-limit/check');
        if (response.ok) {
          const data = await response.json();
          setPurchaseLimit(data);
        }
      } catch (error) {
        console.error('Error checking purchase limits:', error);
      }
    };

    checkLimits();
  }, [searchParams]);

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const subtotal = isHydrated ? total() : 0;
  const orderTotal = subtotal;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>
      
      {/* Purchase Limit Warning */}
      {showLimitWarning && purchaseLimit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold">Purchase Limit Reached</h3>
              <p className="text-red-700 text-sm">
                You have reached the maximum of {purchaseLimit.limit} purchases. 
                {purchaseLimit.timeoutFormatted && (
                  <> Please wait {purchaseLimit.timeoutFormatted} before placing another order.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Purchase Limit Info */}
      {purchaseLimit && !showLimitWarning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-blue-800 font-semibold">Purchase Tracking</h3>
              <p className="text-blue-700 text-sm">
                You have made {purchaseLimit.currentPurchases} of {purchaseLimit.limit} allowed purchases.
                {!purchaseLimit.allowed && purchaseLimit.timeoutFormatted && (
                  <> Next purchase available in {purchaseLimit.timeoutFormatted}.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!isHydrated || items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Cart Empty</h2>
          <p className="text-gray-600 mb-6">Your shopping cart is currently empty</p>
          <Link 
            href="/products"
            className="bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-black"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-gray-600">${item.price.toFixed(2)}</p>
                      {item.variant?.size && (
                        <p className="text-sm text-gray-500">Size: {item.variant.size}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700">
                  Promo Code
                </label>
                <input
                  id="promoCode"
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPromoCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-400 focus:border-gray-400"
                />
              </div>
              
              <div className="pt-4">
                {purchaseLimit && !purchaseLimit.allowed ? (
                  <button 
                    disabled
                    className="w-full bg-gray-400 text-white py-3 px-4 rounded-md cursor-not-allowed text-center block"
                  >
                    Purchase Limit Reached
                  </button>
                ) : (
                  <Link 
                    href="/checkout"
                    className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-black text-center block"
                  >
                    Proceed to Checkout
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading cart...</div>}>
      <CartContent />
    </Suspense>
  );
}
