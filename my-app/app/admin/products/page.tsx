'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  totalStock: number;
  sizes: Array<{
    size: string;
    stock: number;
    price: number;
  }>;
  status: 'active' | 'draft';
  image?: string;
  inStock: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const handleArchive = async (productId: string) => {
    if (!confirm('Are you sure you want to archive this product?')) return;
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: true })
      });
      
      if (response.ok) {
        fetchProducts(); // Refresh the list
      }
    } catch (error) {
      console.error('Error archiving product:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        const realProducts = data.products?.map((product: any) => {
          const totalStock = product.sizes?.reduce((sum: number, size: any) => sum + size.stock, 0) || 0;
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category?.name || 'Uncategorized',
            totalStock,
            sizes: product.sizes || [],
            status: product.isArchived ? 'draft' : 'active',
            image: product.images[0]?.url,
            inStock: totalStock > 0
          };
        }) || [];
        setProducts(realProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-muted rounded-lg animate-pulse"></div>
                        <div className="ml-4">
                          <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-20 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-16 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-12 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-muted rounded w-16 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-muted rounded w-20 animate-pulse ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${
                          product.inStock 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <div className="text-sm font-medium text-foreground">
                          <span className="text-blue-600 dark:text-blue-400">{product.totalStock}</span>
                          <span className="text-muted-foreground"> units total</span>
                        </div>
                        {product.sizes && product.sizes.length > 1 && (
                          <div className="text-xs text-muted-foreground">
                            {product.sizes.map((size, index) => (
                              <span key={size.size} className="mr-2">
                                {size.size}: <span className="font-medium">{size.stock}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1 hover:bg-accent rounded"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        <button 
                          onClick={() => handleArchive(product.id)}
                          className="p-1 hover:bg-accent rounded"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first product'}
          </p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </div>
      )}
    </div>
  );
}