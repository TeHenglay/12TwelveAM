'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    slug: '',
  });

  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [backImageFile, setBackImageFile] = useState<File | null>(null);
  const [sizes, setSizes] = useState<Array<{ size: string; price: string; stock: string }>>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        setFrontImage(base64);
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
        setBackImage(base64);
      } catch (error) {
        console.error('Error converting back image:', error);
        alert('Error processing back image. Please try again.');
      }
    }
  };

  // Remove front image
  const removeFrontImage = () => {
    setFrontImage(null);
    setFrontImageFile(null);
    // Reset the file input
    const input = document.getElementById('front-image-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  // Remove back image
  const removeBackImage = () => {
    setBackImage(null);
    setBackImageFile(null);
    // Reset the file input
    const input = document.getElementById('back-image-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const productData = {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        inStock: true,
        categoryId: product.category || null,
        images: [
          ...(frontImage ? [{ url: frontImage, order: 0 }] : []),
          ...(backImage ? [{ url: backImage, order: 1 }] : [])
        ],
        sizes: sizes.map(size => ({
          size: size.size,
          price: parseFloat(size.price) || parseFloat(product.price),
          stock: parseInt(size.stock) || 0
        }))
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert('Product created successfully!');
        // Reset form
        setProduct({
          name: '',
          description: '',
          price: '',
          category: '',
          slug: '',
        });
        setFrontImage(null);
        setBackImage(null);
        setFrontImageFile(null);
        setBackImageFile(null);
        setSizes([]);
        // Reset file inputs
        const frontInput = document.getElementById('front-image-input') as HTMLInputElement;
        const backInput = document.getElementById('back-image-input') as HTMLInputElement;
        if (frontInput) frontInput.value = '';
        if (backInput) backInput.value = '';
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product for your store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic Information */}
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
                placeholder="Enter product name"
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
                placeholder="Enter product description"
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
                  onChange={(e) => setProduct({ ...product, price: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={product.category}
                  onChange={(e) => setProduct({ ...product, category: e.target.value })}
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
                Slug
              </label>
              <input
                type="text"
                value={product.slug}
                onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Auto-generated from name if empty"
              />
            </div>
          </div>
        </div>

        {/* Stock Management */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Stock Management</h3>
          
          {sizes.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 font-medium text-sm text-muted-foreground mb-2">
                <div>Size</div>
                <div>Price</div>
                <div>Stock</div>
              </div>
              {sizes.map((size, index) => (
                <div key={index} className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={size.size}
                    onChange={(e) => {
                      const newSizes = [...sizes];
                      newSizes[index] = { ...size, size: e.target.value };
                      setSizes(newSizes);
                    }}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Size"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={size.price}
                    onChange={(e) => {
                      const newSizes = [...sizes];
                      newSizes[index] = { ...size, price: e.target.value };
                      setSizes(newSizes);
                    }}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Price"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={size.stock}
                      onChange={(e) => {
                        const newSizes = [...sizes];
                        newSizes[index] = { ...size, stock: e.target.value };
                        setSizes(newSizes);
                      }}
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Stock"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSizes = sizes.filter((_, i) => i !== index);
                        setSizes(newSizes);
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
                  setSizes([...sizes, { size: '', price: product.price, stock: '0' }]);
                }}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Size
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No sizes configured</p>
              <button
                type="button"
                onClick={() => {
                  setSizes([{ size: 'One Size', price: product.price, stock: '0' }]);
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Front Image */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-foreground">Front Image *</h4>
              <div className="space-y-2">
                {/* File Input */}
                <div className="flex items-center space-x-2">
                  <input
                    id="front-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFrontImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="front-image-input"
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
                
                {/* Preview */}
                {frontImage && (
                  <div className="relative">
                    <img
                      src={frontImage}
                      alt="Front preview"
                      className="w-full h-48 object-cover rounded border border-border"
                    />
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Front
                    </div>
                    <button
                      type="button"
                      onClick={removeFrontImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Back Image */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-foreground">Back Image</h4>
              <div className="space-y-2">
                {/* File Input */}
                <div className="flex items-center space-x-2">
                  <input
                    id="back-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleBackImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="back-image-input"
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
                
                {/* Preview */}
                {backImage && (
                  <div className="relative">
                    <img
                      src={backImage}
                      alt="Back preview"
                      className="w-full h-48 object-cover rounded border border-border"
                    />
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Back
                    </div>
                    <button
                      type="button"
                      onClick={removeBackImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Summary */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Image Upload:</strong> Click the buttons above to select images from your device. Front image is required. Back image is optional but recommended for better product showcase.
            </p>
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
                Create Product
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