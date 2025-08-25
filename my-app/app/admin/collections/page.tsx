'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
  description: string;
  available: boolean;
  collectionType: 'CURRENT' | 'DISCONTINUED';
  discontinuedDate: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

interface NewCollectionForm {
  name: string;
  description: string;
  available: boolean;
  collectionType: 'CURRENT' | 'DISCONTINUED';
}

export default function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCollection, setNewCollection] = useState<NewCollectionForm>({
    name: '',
    description: '',
    available: true,
    collectionType: 'CURRENT',
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/collections');
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      } else {
        setError('Failed to fetch collections');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Failed to fetch collections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      // Validate form
      if (!newCollection.name.trim()) {
        throw new Error('Collection name is required');
      }
      if (!newCollection.description.trim()) {
        throw new Error('Collection description is required');
      }
      if (newCollection.description.length < 10) {
        throw new Error('Description must be at least 10 characters');
      }

      const response = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCollection),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create collection');
      }

      // Reset form and refresh list
      setNewCollection({
        name: '',
        description: '',
        available: true,
        collectionType: 'CURRENT',
      });
      setShowForm(false);
      await fetchCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
      setError((error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewCollection(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleDelete = async (collectionId: string) => {
    if (confirm('Are you sure you want to delete this collection? This cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/collections/${collectionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchCollections();
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to delete collection');
        }
      } catch (error) {
        console.error('Error deleting collection:', error);
        setError('An error occurred while deleting the collection');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Collections</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Collection
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      {/* Add New Collection Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Add New Collection</h2>
            <button
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Collection Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCollection.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Enter collection name"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Collection Type
                </label>
                <select
                  name="collectionType"
                  value={newCollection.collectionType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="CURRENT">Current</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={newCollection.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Enter collection description (at least 10 characters)"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="available"
                id="available"
                checked={newCollection.available}
                onChange={handleChange}
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                Available for products
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Collection'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Collections List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-48 bg-gray-200 rounded mt-1"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No collections found. Create your first collection to get started.
                  </td>
                </tr>
              ) : (
                collections.map(collection => (
                  <tr key={collection.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{collection.name}</div>
                        <div className="text-sm text-gray-500">{collection.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        collection.collectionType === 'CURRENT' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {collection.collectionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{collection.productCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        collection.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {collection.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(collection.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/admin/collections/${collection.id}/edit`}>
                          <button className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(collection.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
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
    </div>
  );
}
