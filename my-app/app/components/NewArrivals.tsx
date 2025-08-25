'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProductProps {
  id: string;
  name: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  image: string | null;
  sizes: string[];
  inStock: boolean;
  slug: string;
  discount?: {
    percentage: number;
    enabled: boolean;
  } | null;
}

// Get circular relative position from -N..+N
function getPos(i: number, current: number, total: number) {
  let d = (i - current) % total;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d; // e.g., -2,-1,0,1,2
}

const CARD_W = 420;  // visual width target for center card (px) - made bigger
const GAP = 80;      // gap between cards (px) - increased spacing

/** Position helpers based on relative slot (-2..2) */
function slotToX(slot: number) {
  // Space cards left/right of center. 0 = center.
  return slot * (CARD_W * 0.55 + GAP); // tighter spacing as they shrink
}
function slotToScale(slot: number) {
  return [0.78, 0.88, 1, 0.88, 0.78][slot + 2];
}
function slotToOpacity(slot: number) {
  return [0.35, 0.6, 1, 0.6, 0.35][slot + 2];
}
function slotToZ(slot: number) {
  return [1, 5, 10, 5, 1][slot + 2];
}

// Removed CenterPriceTag component as price is no longer displayed on center card

// Removed SizePills component as sizes are no longer displayed

export default function NewArrivals() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products/new-arrivals', {
        // Use browser caching for better performance
        cache: 'default'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching new arrivals:', err);
      setError('Failed to load products');
      // Fallback to empty array or show error message
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reduced auto-refresh to every 10 minutes to reduce server load
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchProducts();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [fetchProducts, loading]);

  const next = () => setCurrentIndex((p) => (p + 1) % products.length);
  const prev = () => setCurrentIndex((p) => (p - 1 + products.length) % products.length);

  // Compute visible deck: only items within ±2 of the focused card.
  const deck = useMemo(() => {
    if (products.length === 0) return [];
    const total = products.length;
    return products
      .map((p, i) => {
        const slot = getPos(i, currentIndex, total); // -2..+2 (or beyond)
        return { ...p, i, slot };
      })
      .filter((x) => Math.abs(x.slot) <= 2);
  }, [currentIndex, products]);

  // Show loading state
  if (loading) {
    return (
      <section className="relative w-full py-16 select-none bg-white">
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">New Arrivals</h2>
                     <div className="flex items-center justify-center h-[580px]">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
           </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="relative w-full py-16 select-none bg-white">
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">New Arrivals</h2>
                     <div className="flex items-center justify-center h-[580px]">
             <div className="text-center">
               <p className="text-gray-600 mb-4">{error}</p>
               <button 
                 onClick={() => window.location.reload()} 
                 className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
               >
                 Try Again
               </button>
             </div>
           </div>
        </div>
      </section>
    );
  }

  // Show empty state
  if (products.length === 0) {
    return (
      <section className="relative w-full py-16 select-none bg-white">
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">New Arrivals</h2>
                     <div className="flex items-center justify-center h-[580px]">
             <p className="text-gray-600">No new arrivals available at the moment.</p>
           </div>
        </div>
      </section>
    );
  }

  return (
    // Full-bleed section: background spans viewport, content is centered
    <section id="new-arrivals" className="relative w-full py-16 select-none bg-white">
      {/* Centered content wrapper */}
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <h2 className="text-3xl font-bold text-center mb-12">New Arrivals</h2>
        {/* Arrow buttons */}
        <button
          onClick={prev}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white shadow-lg
                     flex items-center justify-center hover:bg-gray-50"
          aria-label="Previous product"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               strokeWidth={1.5} stroke="currentColor" fill="none" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
          </svg>
        </button>

        <button
          onClick={next}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white shadow-lg
                     flex items-center justify-center hover:bg-gray-50"
          aria-label="Next product"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               strokeWidth={1.5} stroke="currentColor" fill="none" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
          </svg>
        </button>

                 {/* Stage */}
         <div
           className="relative mx-auto"
           style={{ height: 580 }}
         >
          {/* Cards are absolutely positioned and animated into slots */}
          {deck.map((product) => {
            const { id, name, image, minPrice, sizes, slot, inStock, discount } = product;
            const displayPrice = discount?.enabled 
              ? minPrice * (1 - discount.percentage / 100)
              : minPrice;
            
            return (
                             <motion.div
                 key={id}
                 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                            rounded-[28px] overflow-hidden shadow-xl"
                 style={{ width: CARD_W, height: CARD_W * 1.25, zIndex: slotToZ(slot) }}
                animate={{
                  x: slotToX(slot),
                  scale: slotToScale(slot),
                  opacity: slotToOpacity(slot),
                  filter: slot === 0 ? 'grayscale(0%)' : 'grayscale(10%)',
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              >
                                 {/* Card body — white for center, light-gray for sides */}
                 <div className={slot === 0 ? 'h-full bg-white text-black' : 'h-full bg-gray-200'}>
                   <div className="relative h-[75%]">
                                         {image ? (
                       <Image
                         src={image}
                         alt={name}
                         fill
                         className={`object-cover ${slot === 0 ? 'mix-blend-normal' : 'opacity-90'}`}
                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
                         priority={slot === 0}
                         loading={slot === 0 ? 'eager' : 'lazy'}
                         quality={85}
                         placeholder="blur"
                         blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                       />
                     ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <div className="text-gray-500 text-center">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm">No Image</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Discount badge */}
                    {discount?.enabled && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        -{discount.percentage}%
                      </div>
                    )}
                    
                                         {/* Out of stock overlay */}
                     {!inStock && (
                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                         <span className="text-white font-bold text-lg">Out of Stock</span>
                       </div>
                     )}
                  </div>

                   {/* Product Name and Price */}
                   <div className={`h-[25%] flex flex-col items-center justify-center gap-3 px-4 text-black`}>
                     <div className="text-lg font-staatliches font-bold tracking-wide uppercase text-center">{name}</div>
                     
                     {/* Price for all cards */}
                     <div className="text-center">
                       {discount?.enabled ? (
                         <div className="flex flex-col items-center gap-1">
                           <span className="text-xs opacity-60 line-through">${minPrice.toFixed(2)}</span>
                           <span className="text-lg font-bold">${displayPrice.toFixed(2)}</span>
                         </div>
                       ) : (
                         <span className="text-lg font-bold">${displayPrice.toFixed(2)}</span>
                       )}
                     </div>
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
