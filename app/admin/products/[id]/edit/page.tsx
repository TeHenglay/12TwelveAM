'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  slug: string;
  inStock: boolean;
  isArchived: boolean;
  categoryId: string;
  images: Array<{ id?: string; url: string; order?: number }>;
  sizes: Array<{ id?: string; size: string; price: number; stock: number }>;
}

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newFrontImage, setNewFrontImage] = useState<string | null>(null);
  const [newBackImage, setNewBackImage] = useState<string | null>(null);
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [backImageFile, setBackImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [resolvedParams.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        // Handle both possible response formats
        const categoriesData = data.categories || data || [];
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Convert file to Base64 for preview and storage
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle front image file selection
  const handleFrontImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFrontImageFile(file);
      try {
        const base64 = await convertToBase64(file);
        setNewFrontImage(base64);
      } catch (error) {
        console.error('Error converting front image:', error);
        alert('Error processing front image. Please try again.');
      }
    }
  };

  // Handle back image file selection
  const handleBackImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackImageFile(file);
      try {
        const base64 = await convertToBase64(file);
        setNewBackImage(base64);
      } catch (error) {
        console.error('Error converting back image:', error);
        alert('Error processing back image. Please try again.');
      }
    }
  };

  // Remove new front image
  const removeNewFrontImage = () => {
    setNewFrontImage(null);
    setFrontImageFile(null);
    const input = document.getElementById('new-front-image-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  // Remove new back image
  const removeNewBackImage = () => {
    setNewBackImage(null);
    setBackImageFile(null);
    const input = document.getElementById('new-back-image-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/admin/products/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          slug: product.slug,
          inStock: product.inStock,
          isArchived: product.isArchived,
          categoryId: product.categoryId,
          images: [
            // Keep existing images that weren't replaced
            ...(product.images || []).filter(img => 
              (img.order !== 0 || !newFrontImage) && (img.order !== 1 || !newBackImage)
            ),
            // Add new front image if uploaded
            ...(newFrontImage ? [{ url: newFrontImage, order: 0 }] : []),
            // Add new back image if uploaded
            ...(newBackImage ? [{ url: newBackImage, order: 1 }] : [])
          ],
          sizes: product.sizes,
        }),
      });

      if (response.ok) {
        alert('Product updated successfully!');
        router.push('/admin/products');
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
        <Link
          href="/admin/products"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Product Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={product.price}
                  onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={product.categoryId}
                  onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={product.slug}
                onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={product.inStock}
                  onChange={(e) => setProduct({ ...product, inStock: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="inStock" className="text-sm font-medium text-foreground">
                  In Stock
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isArchived"
                  checked={product.isArchived}
                  onChange={(e) => setProduct({ ...product, isArchived: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isArchived" className="text-sm font-medium text-foreground">
                  Archived
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Management */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Stock Management</h3>
          
          {product.sizes && product.sizes.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 font-medium text-sm text-muted-foreground mb-2">
                <div>Size</div>
                <div>Price</div>
                <div>Stock</div>
              </div>
              {product.sizes.map((size, index) => (
                <div key={size.id || index} className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={size.size}
                    onChange={(e) => {
                      const newSizes = [...product.sizes];
                      newSizes[index] = { ...size, size: e.target.value };
                      setProduct({ ...product, sizes: newSizes });
                    }}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Size"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={size.price}
                    onChange={(e) => {
                      const newSizes = [...product.sizes];
                      newSizes[index] = { ...size, price: parseFloat(e.target.value) || 0 };
                      setProduct({ ...product, sizes: newSizes });
                    }}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Price"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={size.stock}
                      onChange={(e) => {
                        const newSizes = [...product.sizes];
                        newSizes[index] = { ...size, stock: parseInt(e.target.value) || 0 };
                        setProduct({ ...product, sizes: newSizes });
                      }}
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Stock"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSizes = product.sizes.filter((_, i) => i !== index);
                        setProduct({ ...product, sizes: newSizes });
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newSizes = [...product.sizes, { size: '', price: product.price, stock: 0 }];
                  setProduct({ ...product, sizes: newSizes });
                }}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Size
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No sizes configured for this product</p>
              <button
                type="button"
                onClick={() => {
                  setProduct({ ...product, sizes: [{ size: 'One Size', price: product.price, stock: 0 }] });
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Add First Size
              </button>
            </div>
          )}
        </div>

        {/* Image Management */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Product Images</h3>
          
          {/* Current Images */}
          {product.images && product.images.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-foreground mb-3">Current Images</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.images.map((image, index) => (
                  <div key={image.id || index} className="relative">
                    <img
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-border"
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium">
                      {image.order === 0 ? 'Front' : image.order === 1 ? 'Back' : `Image ${index + 1}`}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = product.images.filter((_, i) => i !== index);
                        setProduct({ ...product, images: newImages });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Images */}
          <div className="space-y-6">
            <h4 className="text-md font-medium text-foreground">Upload New Images</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload New Front Image */}
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-foreground">Replace Front Image</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      id="new-front-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFrontImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="new-front-image-input"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      📷 Choose Front Image
                    </label>
                    {frontImageFile && (
                      <span className="text-sm text-muted-foreground">
                        {frontImageFile.name}
                      </span>
                    )}
                  </div>
                  
                  {newFrontImage && (
                    <div className="relative">
                      <img
                        src={newFrontImage}
                        alt="New front preview"
                        className="w-full h-32 object-cover rounded border border-border"
                      />
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                        New Front
                      </div>
                      <button
                        type="button"
                        onClick={removeNewFrontImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload New Back Image */}
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-foreground">Replace Back Image</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      id="new-back-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleBackImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="new-back-image-input"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      📷 Choose Back Image
                    </label>
                    {backImageFile && (
                      <span className="text-sm text-muted-foreground">
                        {backImageFile.name}
                      </span>
                    )}
                  </div>
                  
                  {newBackImage && (
                    <div className="relative">
                      <img
                        src={newBackImage}
                        alt="New back preview"
                        className="w-full h-32 object-cover rounded border border-border"
                      />
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        New Back
                      </div>
                      <button
                        type="button"
                        onClick={removeNewBackImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Instructions */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Image Upload:</strong> Click the buttons above to select new images from your device. New images will replace existing front/back images when you save.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
          <Link
            href="/admin/products"
            className="inline-flex items-center px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}