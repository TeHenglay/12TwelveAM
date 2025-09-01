'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Logo3DProps {
  className?: string;
}

export default function Logo3DEffect({ className = '' }: Logo3DProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse movement to create parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center (normalized from -1 to 1)
    const x = -((e.clientX - centerX) / (rect.width / 2)) * 15;
    const y = ((e.clientY - centerY) / (rect.height / 2)) * 15;
    
    setRotation({ x: y, y: x });
  };

  // Handle automatic rotation when not hovering
  useEffect(() => {
    let startTime = Date.now();
    let angle = 0;

    const animate = () => {
      if (isHovering) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = Date.now() - startTime;
      angle = (elapsed * 0.05) % 360;
      
      setRotation({
        x: Math.sin(angle * Math.PI / 180) * 10,
        y: Math.cos(angle * Math.PI / 180) * 10
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsAnimating(false);
    };
  }, [isHovering]);

  return (
    <div 
      ref={containerRef}
      className={`perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div 
        className="relative w-full h-full transition-transform duration-200 ease-out transform-style-3d"
        style={{ 
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
        }}
      >
        {/* Main logo */}
        <div className="w-full h-full">
          <Image
            src="/images/hero-logo.png"
            alt="TwelveAM Logo"
            width={500}
            height={500}
            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            priority
          />
        </div>
        
        {/* Reflection/shadow effect */}
        <div 
          className="absolute inset-0 transform translate-z-[-10px] opacity-30"
          style={{ filter: 'blur(4px)' }}
        >
          <Image
            src="/images/hero-logo.png"
            alt=""
            width={500}
            height={500}
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* No glow effect, but keeping the drop shadow on the main logo */}
      </div>

      {/* Custom CSS for 3D effects */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .translate-z-[-2px] {
          transform: translateZ(-2px);
        }
      `}</style>
    </div>
  );
}
