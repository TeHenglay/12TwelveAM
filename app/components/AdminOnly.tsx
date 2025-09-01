'use client';

import { useAdmin } from '@/app/hooks/useAdmin';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function AdminOnly({ 
  children, 
  fallback = <div>Access denied. Admin privileges required.</div>,
  redirectTo = '/admin/login'
}: AdminOnlyProps) {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin && redirectTo) {
      router.push(redirectTo);
    }
  }, [isAdmin, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
