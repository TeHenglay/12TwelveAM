'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    console.log('Success page loaded, orderNumber:', orderNumber);
    
    if (!orderNumber) {
      console.error('No order number provided in URL');
      setError('No order number provided');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        console.log('Fetching order with number:', orderNumber);
        const response = await fetch(`/api/orders/lookup?orderNumber=${orderNumber}`);
        console.log('Order lookup response status:', response.status);
        
        if (response.ok) {
          const orderData = await response.json();
          console.log('Order data received:', orderData);
          setOrder(orderData);
        } else {
          const errorData = await response.json();
          console.error('Order lookup failed:', errorData);
          setError(`Order not found: ${errorData.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(`Failed to load order details: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/" 
            className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 text-green-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. We'll process your order shortly.</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Order Header */}
          <div className="bg-rose-50 px-6 py-4 border-b border-rose-100">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Order #{order.orderNumber}</h2>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-rose-600">${parseFloat(order.total.toString()).toFixed(2)}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === 'PENDING' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-800">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-800">{order.customerPhone}</p>
              </div>
              {order.customerEmail && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-800">{order.customerEmail}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Shipping Address</p>
                <p className="font-medium text-gray-800">{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">${parseFloat(item.price.toString()).toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">What happens next?</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• We'll review your order and payment proof</li>
            <li>• You'll receive a confirmation once your order is approved</li>
            <li>• Your items will be prepared and shipped to your address</li>
            <li>• Keep your order number for reference: <strong>{order.orderNumber}</strong></li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/products" 
            className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors text-center"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/" 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
