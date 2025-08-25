'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  inStock: boolean;
  hasSizes: boolean;
  minPrice: number;
  maxPrice: number;
  discount?: {
    percentage: number;
    enabled: boolean;
  } | null;
}

interface ProductListProps {
  category?: string;
  collection?: string;
  search?: string;
  initialProducts?: Product[];
}

export default function ProductList({
  category,
  collection,
  search,
  initialProducts,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProducts);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest');

  // Fetch products on component mount or when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query params
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (collection) params.append('collection', collection);
        if (search) params.append('search', search);
        if (sort) params.append('sort', sort);
        params.append('page', page.toString());
        params.append('limit', '12');

        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, collection, search, sort, page]);

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setPage(1); // Reset to first page when changing sort
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format price display
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Calculate discounted price
  const getDiscountedPrice = (price: number, discount?: { percentage: number; enabled: boolean } | null) => {
    if (discount && discount.enabled) {
      return price * (1 - discount.percentage / 100);
    }
    return price;
  };

  // Render loading state
  if (isLoading && !initialProducts) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white overflow-hidden">
              <div className="bg-gray-200 aspect-[4/5]"></div>
              <div className="p-4">
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => setPage(1)}
          className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Render empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
        <p className="text-gray-600 mb-6">
          {search
            ? `No products matching "${search}"`
            : category
            ? 'No products in this category'
            : collection
            ? 'No products in this collection'
            : 'No products available'}
        </p>
        <Link href="/products">
          <button className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700">
            View All Products
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Sorting and filters */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center">
          <label htmlFor="sort" className="text-sm text-gray-600 mr-2">
            Sort by:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={handleSortChange}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
        {products.map(product => (
          <Link href={`/products/${product.slug}`} key={product.id} className="group block relative">
            {/* Hover Border Effect - Bigger than card with sticky effect */}
            <div className="absolute -inset-3 border-2 border-transparent group-hover:border-gray-500 transition-all duration-500 group-hover:shadow-xl opacity-0 group-hover:opacity-100 transform group-hover:scale-105"></div>
            
            <div className="relative bg-white overflow-hidden transition-all duration-500 ease-out group-hover:transform group-hover:-translate-y-3">
              <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {product.discount && product.discount.enabled && (
                  <div className="absolute top-2 right-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {product.discount.percentage}% OFF
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <span className="bg-white px-3 py-1 text-sm font-medium text-gray-800 rounded">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-1 text-center">
                  {product.name}
                </h3>
                <div className="text-center">
                {product.hasSizes ? (
                  <p className="text-lg font-bold text-gray-900">
                    {product.minPrice === product.maxPrice
                      ? formatPrice(getDiscountedPrice(product.minPrice, product.discount))
                      : `${formatPrice(getDiscountedPrice(product.minPrice, product.discount))} - ${formatPrice(getDiscountedPrice(product.maxPrice, product.discount))}`}
                  </p>
                ) : (
                  <p className="text-lg font-bold text-gray-900">
                    {product.discount && product.discount.enabled ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-red-500">
                          {formatPrice(getDiscountedPrice(product.price, product.discount))}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </span>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </p>
                )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 border rounded-md ${
                  page === i + 1
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}