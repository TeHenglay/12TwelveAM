'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Calendar, User, Mail, Phone, MapPin, Package, DollarSign } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  total: number;
  createdAt: string;
  paymentProofUrl?: string;
  items: OrderItem[];
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: Props) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [resolvedParams.id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        console.error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!order || !confirm('Approve this order?')) return;
    
    setIsApproving(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
      
      if (response.ok) {
        fetchOrderDetails(); // Refresh order details
        alert('Order approved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to approve order'}`);
      }
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Error approving order');
    } finally {
      setIsApproving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">The requested order could not be found.</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">
              Order #{order.orderNumber}
            </h1>
          </div>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details Card */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Customer Information */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="font-medium text-foreground w-16">Name:</span>
                    <span className="text-muted-foreground">{order.customerName}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-foreground w-16">Phone:</span>
                    <span className="text-muted-foreground">{order.customerPhone}</span>
                  </div>
                  {order.customerEmail && (
                    <div className="flex items-start">
                      <span className="font-medium text-foreground w-16">Email:</span>
                      <span className="text-muted-foreground">{order.customerEmail}</span>
                    </div>
                  )}
                  <div className="flex items-start">
                    <span className="font-medium text-foreground w-16">Address:</span>
                    <span className="text-muted-foreground">{order.shippingAddress}</span>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'PENDING' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : order.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Date:</span>
                    <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Total:</span>
                    <span className="text-lg font-bold text-foreground">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                {order.status === 'PENDING' && (
                  <div className="mt-6">
                    <h3 className="font-medium text-foreground mb-3">Actions:</h3>
                    <button
                      onClick={handleApprove}
                      disabled={isApproving}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApproving ? 'Approving...' : 'Approve Order'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Items</h2>
              <div className="bg-muted/30 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-foreground">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{item.size}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Proof */}
            {order.paymentProofUrl && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Payment Proof</h2>
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={order.paymentProofUrl}
                      alt="Payment Proof"
                      className="max-w-md w-full h-auto rounded-lg border border-border"
                    />
                    <div className="mt-4 text-center">
                      <a
                        href={order.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        View Full Image
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
