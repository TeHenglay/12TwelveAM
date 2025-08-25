'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Plus,
  Eye
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  categories: number;
  collections: number;
  lowStockProducts: number;
  growth: {
    products: number;
    orders: number;
    customers: number;
    revenue: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    categories: 0,
    collections: 0,
    lowStockProducts: 0,
    growth: {
      products: 0,
      orders: 0,
      customers: 0,
      revenue: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    database: 'checking',
    api: 'checking',
    storage: 'checking',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setSystemStatus(prev => ({ ...prev, api: 'checking' }));
        const response = await fetch('/api/admin/stats');
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
          setSystemStatus(prev => ({ 
            ...prev, 
            api: 'online',
            database: 'online',
            storage: 'online'
          }));
        } else {
          throw new Error('Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setSystemStatus(prev => ({ 
          ...prev, 
          api: 'error',
          database: 'error' 
        }));
        
        // Still show some data even if API fails
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          totalCustomers: 0,
          totalRevenue: 0,
          categories: 0,
          collections: 0,
          lowStockProducts: 0,
          growth: {
            products: 0,
            orders: 0,
            customers: 0,
            revenue: 0,
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    color = "blue" 
  }: { 
    title: string; 
    value: string | number; 
    growth: number; 
    icon: any; 
    color?: string;
  }) => (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {growth >= 0 ? (
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(growth)}%
        </span>
        <span className="text-sm text-muted-foreground ml-1">vs last month</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
              </div>
              <div className="mt-4 flex items-center">
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalProducts}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/admin/products"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-3xl font-bold text-foreground">{stats.categories}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/admin/categories"
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Collections</p>
                  <p className="text-3xl font-bold text-foreground">{stats.collections}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/admin/collections"
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/admin/orders"
                  className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <p className="text-sm text-muted-foreground mb-6">Common tasks you can perform to manage your store.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products/new"
            className="flex flex-col items-center justify-center p-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="w-8 h-8 mb-2" />
            <span className="font-medium">Add New Product</span>
          </Link>
          
          <Link
            href="/admin/categories/new"
            className="flex flex-col items-center justify-center p-6 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 transition-colors"
          >
            <Plus className="w-8 h-8 mb-2 text-gray-600" />
            <span className="font-medium text-gray-700">Add New Category</span>
          </Link>
          
          <Link
            href="/admin/collections/new"
            className="flex flex-col items-center justify-center p-6 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 transition-colors"
          >
            <Plus className="w-8 h-8 mb-2 text-gray-600" />
            <span className="font-medium text-gray-700">Add New Collection</span>
          </Link>
          
          <Link
            href="/admin/products?filter=low-stock"
            className="flex flex-col items-center justify-center p-6 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 transition-colors"
          >
            <Eye className="w-8 h-8 mb-2 text-gray-600" />
            <span className="font-medium text-gray-700">View Out of Stock</span>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">System Status</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus.database === 'online' ? 'bg-green-500' : 
                systemStatus.database === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-foreground">Database Connection</span>
            </div>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              systemStatus.database === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
              systemStatus.database === 'checking' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {systemStatus.database === 'online' ? 'Online' : 
               systemStatus.database === 'checking' ? 'Checking...' : 'Error'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus.api === 'online' ? 'bg-green-500' : 
                systemStatus.api === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-foreground">API Services</span>
            </div>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              systemStatus.api === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
              systemStatus.api === 'checking' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {systemStatus.api === 'online' ? 'Online' : 
               systemStatus.api === 'checking' ? 'Checking...' : 'Error'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus.storage === 'online' ? 'bg-green-500' : 
                systemStatus.storage === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-foreground">File Storage</span>
            </div>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              systemStatus.storage === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
              systemStatus.storage === 'checking' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {systemStatus.storage === 'online' ? 'Online' : 
               systemStatus.storage === 'checking' ? 'Checking...' : 'Error'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}