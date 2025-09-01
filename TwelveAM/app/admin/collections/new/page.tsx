'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewCollectionPage() {
  const [collection, setCollection] = useState({
    name: '',
    description: '',
    available: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collection),
      });

      if (response.ok) {
        alert('Collection created successfully!');
        setCollection({ name: '', description: '', available: true });
      } else {
        throw new Error('Failed to create collection');
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Failed to create collection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/collections"
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Collection</h1>
          <p className="text-muted-foreground">Create a new product collection</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Collection Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={collection.name}
                  onChange={(e) => setCollection({ ...collection, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter collection name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={collection.description}
                  onChange={(e) => setCollection({ ...collection, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter collection description"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={collection.available}
                  onChange={(e) => setCollection({ ...collection, available: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="available" className="text-sm font-medium text-foreground">
                  Available to customers
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Collection
                </>
              )}
            </button>
            <Link
              href="/admin/collections"
              className="inline-flex items-center px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
