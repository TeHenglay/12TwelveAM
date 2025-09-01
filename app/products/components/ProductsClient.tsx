'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Filter } from 'lucide-react';
import FilterSidebar from './FilterSidebar';
import Pagination from './Pagination';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  inStock: boolean;
  minPrice: number;
  maxPrice: number;
  discount?: {
    percentage: number;
    enabled: boolean;
  } | null;
}

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Array<{
    id: string;
    name: string;
    _count: { products: number };
  }>;
  collections: Array<{
    id: string;
    name: string;
    _count: { products: number };
  }>;
  totalPages: number;
  currentPage: number;
}

export default function ProductsClient({
  initialProducts,
  categories,
  collections,
  totalPages,
  currentPage: initialPage,
}: ProductsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isMobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const selectedCategory = searchParams.get('category') || undefined;
  const selectedCollection = searchParams.get('collection') || undefined;
  const currentSort = searchParams.get('sort') || 'newest';

  const updateSearchParams = useCallback((updates: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });
    
    router.push(`${pathname}?${newSearchParams.toString()}`);
  }, [pathname, router, searchParams]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSearchParams({ sort: e.target.value, page: '1' });
  };

  const handleCategoryChange = (categoryId: string) => {
    updateSearchParams({
      category: categoryId === selectedCategory ? undefined : categoryId,
      page: '1'
    });
  };

  const handleCollectionChange = (collectionId: string) => {
    updateSearchParams({
      collection: collectionId === selectedCollection ? undefined : collectionId,
      page: '1'
    });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    updateSearchParams({
      category: undefined,
      collection: undefined,
      page: '1'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed top-24 right-4 z-50">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-md"
          aria-label="Open filters"
        >
          <Filter className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4">
          {/* Filters */}
          <FilterSidebar
            categories={categories}
            collections={collections}
            selectedCategory={selectedCategory}
            selectedCollection={selectedCollection}
            onCategoryChange={handleCategoryChange}
            onCollectionChange={handleCollectionChange}
            onReset={handleResetFilters}
            isMobileOpen={isMobileFilterOpen}
            onMobileClose={() => setMobileFilterOpen(false)}
            currentSort={currentSort}
            onSortChange={value => updateSearchParams({ sort: value, page: '1' })}
          />

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {products.map((product) => (
                <Link 
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block relative"
                >
                  {/* Hover Border Effect - Bigger than card with sticky effect */}
                  <div className="absolute -inset-3 border-2 border-transparent group-hover:border-gray-500 transition-all duration-500 group-hover:shadow-xl opacity-0 group-hover:opacity-100 transform group-hover:scale-105"></div>
                  
                  <div className="relative bg-white overflow-hidden transition-all duration-500 ease-out group-hover:transform group-hover:-translate-y-3">
                    {/* Product Image Container */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                    <Image
                      src={product.image || '/images/product-placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    {/* Discount Badge */}
                    {product.discount?.enabled && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        -{product.discount.percentage}%
                      </div>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <span className="bg-white px-4 py-2 text-sm font-semibold text-gray-800 rounded-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    
                    {/* Subtle Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-sm font-staatliches text-gray-900 mb-1 text-center">
                        {product.name}
                      </h3>
                      <div className="text-center">
                        {product.discount?.enabled ? (
                          <p className="text-lg font-bold text-gray-900">
                            <span className="flex items-center justify-center gap-2">
                              <span className="text-red-500">
                                ${(product.minPrice * (1 - product.discount.percentage / 100)).toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                ${product.minPrice.toFixed(2)}
                              </span>
                            </span>
                          </p>
                        ) : (
                          <p className="text-lg font-bold text-gray-900">
                            {product.minPrice === product.maxPrice
                              ? `$${product.minPrice.toFixed(2)}`
                              : `$${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}`}
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
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
