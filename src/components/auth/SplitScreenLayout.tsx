'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import AuthCarousel from './AuthCarousel';

interface SplitScreenLayoutProps {
  children: React.ReactNode;
  imageNode?: React.ReactNode;
}

export default function SplitScreenLayout({ children, imageNode }: SplitScreenLayoutProps) {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftPanelRef.current,
        { x: '-100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 1, ease: 'power3.out' }
      );
      gsap.fromTo(
        rightPanelRef.current,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Left Panel: Content / Form */}
      <div 
        ref={leftPanelRef}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-card shadow-2xl z-10"
      >
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>

      {/* Right Panel: Image / Branding */}
      <div 
        ref={rightPanelRef}
        className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden"
      >
        <AuthCarousel />
        
        <div className="relative z-10 w-full max-w-lg mt-auto bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
           {imageNode || (
             <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
                  Simplify your shared expenses.
                </h2>
                <p className="text-lg text-slate-200">
                  Trustworthy, transparent, and built for the modern Nigerian lifestyle.
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
