'use client';

import AnimatedHeader from './AnimatedHeader';
import ClientPerformanceMonitor from './ClientPerformanceMonitor';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { Footer, MobileNav } = require('./index');
  
  return (
    <>
      {/* Animated Header with GSAP - Fixed positioning to overlap content */}
      <AnimatedHeader />
      
      {/* Main content: no padding-top to allow navbar overlap */}
      <main className="flex-1 w-full">{children}</main>
      
      <Footer />
      <MobileNav />
      <ClientPerformanceMonitor />
    </>
  );
}
