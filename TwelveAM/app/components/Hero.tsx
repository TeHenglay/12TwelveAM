'use client';

import React from 'react';
import DotGrid from './DotGrid';
import Logo3DEffect from './Logo3DEffect';
import ScrambledText from './ScrambledText';
import { motion } from 'framer-motion';

/**
 * Full-screen minimalist Hero section with interactive DotGrid background
 * - Black background spanning entire viewport (100vw x 100vh)
 * - Gray dots that turn shiny white on hover
 * - 3D animated logo in the center
 * - Navbar overlaps on top, LogoLoop overlaps at bottom
 * - Lower proximity and shock radius for more precise interactions
 */

const Hero: React.FC = () => {
  return (
    <section className="relative w-screen h-screen overflow-hidden bg-black left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      {/* Interactive DotGrid Background */}
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={8}
          gap={50}
          baseColor="#6b7280"
          activeColor="#ffffff"
          proximity={100}
          shockRadius={120}
          shockStrength={3}
          resistance={500}
          returnDuration={1.0}
          className="w-full h-full"
        />
      </div>
      
      {/* 3D Logo in Center */}
      <motion.div 
        className="absolute inset-0 z-10 flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <div 
          className="w-72 h-72 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => {
            const newArrivalsSection = document.getElementById('new-arrivals');
            if (newArrivalsSection) {
              newArrivalsSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }
          }}
        >
          <Logo3DEffect className="w-full h-full" />
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.0 }}
          className="mt-4 sm:mt-2 md:mt-0 text-center"
        >
          <div className="inline-block px-6 py-4 bg-black/10 backdrop-blur-sm rounded-lg drop-shadow-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:drop-shadow-[0_10px_25px_rgba(255,255,255,0.25)] transition-all duration-300">
            <ScrambledText
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-wider uppercase"
              radius={120}
              duration={1.5}
              speed={0.3}
              scrambleChars="•"
            >
               WHERE TODAY MEETS TOMORROW
            </ScrambledText>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
