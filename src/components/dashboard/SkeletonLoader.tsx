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
    <div ref={containerRef} className="skeleton-wrapper">
      {/* Top Banner Skeleton */}
      <div className="skeleton-header skeleton-pulse">
         <div className="space-y-4">
            <div className="w-24 h-4 skeleton-box" />
            <div className="w-48 h-12 skeleton-box" />
         </div>
         <div className="flex space-x-4 md:space-x-6">
            <div className="w-12 h-12 md:w-16 md:h-16 skeleton-avatar" />
            <div className="w-12 h-12 md:w-16 md:h-16 skeleton-avatar" />
         </div>
      </div>
      
      {/* Table Skeleton */}
      <div className="skeleton-table skeleton-pulse">
         <div className="w-full flex justify-end mb-8">
            <div className="w-32 h-8 skeleton-box" />
         </div>
         <div className="flex flex-col space-y-4">
           {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="skeleton-table-row" />
           ))}
         </div>
      </div>
    </div>
  );
}
