'use client';

import dynamic from 'next/dynamic';

// Dynamically import PerformanceMonitor only on client side
const PerformanceMonitor = dynamic(() => import('./PerformanceMonitor'), {
  ssr: false,
  loading: () => null,
});

export default function ClientPerformanceMonitor() {
  // Only render in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return <PerformanceMonitor />;
}
