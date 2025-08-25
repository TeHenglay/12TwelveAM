'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('Page Load Time:', navEntry.loadEventEnd - navEntry.fetchStart, 'ms');
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime, 'ms');
        }
        
        if (entry.entryType === 'first-input') {
          console.log('FID:', (entry as any).processingStart - entry.startTime, 'ms');
        }
        
        if (entry.entryType === 'layout-shift') {
          console.log('CLS:', (entry as any).value);
        }
      });
    });

    // Observe different performance metrics
    try {
      observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      // Fallback for browsers that don't support all entry types
      try {
        observer.observe({ entryTypes: ['navigation'] });
      } catch (err) {
        console.warn('Performance monitoring not supported');
      }
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      console.log('Memory Usage:', {
        used: Math.round(memInfo.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memInfo.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) + ' MB'
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Only render in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return null;
}
