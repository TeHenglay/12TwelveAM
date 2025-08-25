'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  inStock: boolean;
  discount?: {
    percentage: number;
    enabled: boolean;
  } | null;
}

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=8&sort=newest');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="relative w-full py-20 bg-white">
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
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
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full py-20 bg-white">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
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
                <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                  <Image
                    src={product.image || '/images/product-placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    priority={products.indexOf(product) < 4} // Eager load first 4 images
                  />
                  
                  {/* Discount Badge */}
                  {product.discount?.enabled && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                      -{product.discount.percentage}%
                    </div>
                  )}
                  
                  {/* Out of Stock Overlay */}
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
                  <h3 className="text-sm font-medium text-gray-900 mb-1 text-center">
                    {product.name}
                  </h3>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {product.discount?.enabled ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="text-red-500">
                            ${(product.price * (1 - product.discount.percentage / 100)).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        </span>
                      ) : (
                        `$${product.price.toFixed(2)}`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* View All Products Button */}
        <div className="text-center mt-16">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-semibold
                     hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span>View All Products</span>
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 8l4 4m0 0l-4 4m4-4H3" 
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}