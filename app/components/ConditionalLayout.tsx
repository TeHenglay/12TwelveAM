'use client';

import { usePathname } from 'next/navigation';
import ClientLayout from './ClientLayout';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't show main website navbar/footer for admin routes
  const isAdminRoute = pathname?.startsWith('/admin');
  
  if (isAdminRoute) {
    // Admin routes: no main website layout, just the children
    return <>{children}</>;
  }
  
  // Regular routes: use the main website layout with navbar/footer
  return <ClientLayout>{children}</ClientLayout>;
}
