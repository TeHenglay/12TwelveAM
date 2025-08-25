'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Check, X, Package } from 'lucide-react';

interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  total: number;
  status: string;
  createdAt: string;
  address: string;
  orderItems: Array<{
    id: string;
    product: {
      name: string;
    };
    productSize: {
      size: string;
    };
    quantity: number;
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        // Handle both possible response formats
        const ordersData = data.orders || data.value || data || [];
        
        // Transform orders to match the expected interface
        const transformedOrders = ordersData.map((order: any) => ({
          id: order.id,
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
          address: order.shippingAddress,
          orderItems: order.items?.map((item: any) => ({
            id: item.id,
            product: { name: item.name },
            productSize: { size: item.size },
            quantity: item.quantity
          })) || []
        }));
        
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    if (!confirm('Approve this order?')) return;
    
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
      
      if (response.ok) {
        fetchOrders(); // Refresh the list
        alert('Order approved successfully!');
      }
    } catch (error) {
      console.error('Error approving order:', error);
    }
  };

  const handleReject = async (orderId: string) => {
    if (!confirm('Reject this order?')) return;
    
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      
      if (response.ok) {
        fetchOrders(); // Refresh the list
        alert('Order rejected successfully!');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'SHIPPED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">All Orders ({orders.length})</h2>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground">No orders found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Items</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">#{order.id.slice(-8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{order.name}</div>
                        <div className="text-sm text-muted-foreground">{order.email}</div>
                        <div className="text-sm text-muted-foreground">{order.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">
                        {order.orderItems.map((item, idx) => (
                          <div key={item.id}>
                            {item.product.name} ({item.productSize.size}) x{item.quantity}
                            {idx < order.orderItems.length - 1 && ', '}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      ${parseFloat(order.total.toString()).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {order.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(order.id)}
                              className="p-2 hover:bg-muted rounded-md transition-colors text-green-600"
                              title="Approve order"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(order.id)}
                              className="p-2 hover:bg-muted rounded-md transition-colors text-red-600"
                              title="Reject order"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}