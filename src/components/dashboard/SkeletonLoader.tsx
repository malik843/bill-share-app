'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SkeletonLoader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.to('.skeleton-pulse', {
        opacity: 0.4,
        duration: 0.8,
        repeat: 2,
        yoyo: true,
        ease: 'power1.inOut'
      }).to(containerRef.current, {
        opacity: 0,
        y: -15,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: onComplete
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="w-full max-w-7xl mx-auto flex-1 flex flex-col p-4 sm:p-6 lg:p-10 space-y-8 min-h-screen">
      {/* Top Banner Skeleton */}
      <div className="w-full bg-card rounded-[2rem] shadow-sm border border-border flex justify-between items-center p-6 md:p-8 skeleton-pulse">
         <div className="space-y-4">
            <div className="w-24 h-4 bg-muted rounded-md" />
            <div className="w-48 h-12 bg-muted rounded-md" />
         </div>
         <div className="flex space-x-4 md:space-x-6">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted" />
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted" />
         </div>
      </div>
      
      {/* Table Skeleton */}
      <div className="w-full flex-1 bg-card rounded-[2rem] shadow-sm border border-border p-6 md:p-8 skeleton-pulse flex flex-col">
         <div className="w-full flex justify-end mb-8">
            <div className="w-32 h-8 bg-muted rounded-md" />
         </div>
         <div className="flex flex-col space-y-4">
           {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="w-full h-[72px] bg-muted/60 rounded-2xl" />
           ))}
         </div>
      </div>
    </div>
  );
}
