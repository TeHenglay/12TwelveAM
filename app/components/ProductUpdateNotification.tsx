'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ProductUpdateNotificationProps {
  productSlug?: string;
}

export default function ProductUpdateNotification({ productSlug }: ProductUpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const pathname = usePathname();
  
  useEffect(() => {
    // Listen for product update events
    const eventSource = new EventSource('/api/sse/product-updates');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // If we're on a specific product page and that product was updated
        if (productSlug && data.slug === productSlug) {
          setMessage(`This product has been updated. Refresh to see the latest information.`);
          setIsVisible(true);
        } 
        // If we're on the products listing page and any product was updated
        else if (pathname === '/products' || pathname === '/') {
          setMessage('Product catalog has been updated. Refresh to see the latest products.');
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };
    
    eventSource.onerror = () => {
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [productSlug, pathname]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-md shadow-lg z-50 max-w-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setIsVisible(false)}
            className="inline-flex text-white focus:outline-none"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-2">
        <button
          onClick={() => window.location.reload()}
          className="text-sm bg-white text-gray-900 px-3 py-1 rounded-md hover:bg-gray-50"
        >
          Refresh Now
        </button>
      </div>
    </div>
  );
}
