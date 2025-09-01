'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  _count?: {
    products: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        // Handle both possible response formats
        const categoriesData = data.categories || data || [];
        
        // Transform API data to match component interface
        const transformedCategories = categoriesData.map((category: any) => ({
          id: category.id,
          name: category.name,
          imageUrl: category.imageUrl,
          _count: {
            products: category.productCount || category._count?.products || 0
          }
        }));
        
        setCategories(transformedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchCategories(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Organize your products into categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Link>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">No categories found</div>
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create your first category
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {category.imageUrl ? (
                <div className="h-48 bg-muted flex items-center justify-center overflow-hidden">
                  <img 
                    src={category.imageUrl} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center">
                  <div className="text-muted-foreground">No Image</div>
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="p-1 hover:bg-accent rounded"
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1 hover:bg-accent rounded"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {category._count?.products || 0} products
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}