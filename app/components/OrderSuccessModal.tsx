'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OrderSuccessModalProps {
  isOpen: boolean;
  orderNumber: string;
  onClose: () => void;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  customerName: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrderSuccessModal({ isOpen, orderNumber, onClose }: OrderSuccessModalProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && orderNumber) {
      const fetchOrder = async () => {
        try {
          const response = await fetch(`/api/orders/lookup?orderNumber=${orderNumber}`);
          if (response.ok) {
            const orderData = await response.json();
            // Convert Prisma Decimal to number
            const processedOrder = {
              ...orderData,
              total: parseFloat(orderData.total.toString()),
              items: orderData.items.map((item: any) => ({
                ...item,
                price: parseFloat(item.price.toString())
              }))
            };
            setOrder(processedOrder);
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [isOpen, orderNumber]);

  const handleContinueShopping = () => {
    onClose();
    router.push('/products');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-50 px-6 py-4 rounded-t-lg border-b border-green-100">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-green-800 text-center">Payment Successful!</h2>
          <p className="text-green-600 text-center text-sm mt-1">Your order has been placed successfully</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          ) : order ? (
            <div className="space-y-4">
              {/* Order Number */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-mono text-lg font-semibold text-gray-800">{order.orderNumber}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span className="text-green-600">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <span className="text-sm text-yellow-800 font-medium">Status: {order.status}</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  We'll review your payment and send a confirmation soon.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Order details not available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t">
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleContinueShopping}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Continue Shopping
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
