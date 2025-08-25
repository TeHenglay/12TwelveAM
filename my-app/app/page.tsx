"use client";

import { Hero } from '@/app/components';
import dynamic from 'next/dynamic';

// Lazy load components that are not immediately visible
const LogoLoop = dynamic(() => import('@/app/components/LogoLoop'), {
  loading: () => <div className="h-[80px] bg-black animate-pulse" />,
});

const NewArrivals = dynamic(() => import('@/app/components/NewArrivals'), {
  loading: () => (
    <section className="relative w-full py-16 bg-white">
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <h2 className="text-3xl font-bold text-center mb-12">New Arrivals</h2>
        <div className="flex items-center justify-center h-[580px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    </section>
  ),
});

const ProductSection = dynamic(() => import('@/app/components/ProductSection'), {
  loading: () => (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  ),
});
const brandLogos = [
  { src: "/images/logo.png", alt: "Twelve AM Logo", title: "Twelve AM" },
  { src: "/images/Logo1.png", alt: "Twelve AM Logo 1", title: "Twelve AM" },
  { src: "/images/logo2.png", alt: "Twelve AM Logo 2", title: "Twelve AM" },
  { src: "/images/logo3.png", alt: "Twelve AM Logo 3", title: "Twelve AM" },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero section with overlapping LogoLoop */}
      <div className="relative">
        <Hero />
        
        {/* LogoLoop overlapping at the bottom of Hero section */}
        <div className="absolute bottom-0 left-0 right-0 h-[80px] overflow-hidden bg-black/80 backdrop-blur-sm z-20">
          <LogoLoop
            logos={brandLogos}
            speed={40}
            direction="left"
            logoHeight={40}
            gap={80}
            logoOffset={8}
            pauseOnHover
            scaleOnHover
            fadeOut
            fadeOutColor="#000000"
            ariaLabel="Twelve AM Brand"
          />
        </div>
      </div>
      
      <NewArrivals />
      <ProductSection />
    </main>
  );
}
