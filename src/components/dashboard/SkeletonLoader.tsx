'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SkeletonLoader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Animate skeleton items
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.to('.skeleton-pulse', {
        opacity: 0.5,
        duration: 0.8,
        repeat: 2,
        yoyo: true,
        ease: 'power1.inOut'
      }).to(containerRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: onComplete
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto space-y-8 p-6 pt-12">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-10 w-48 bg-muted rounded-md skeleton-pulse" />
        <div className="h-10 w-10 bg-muted rounded-full skeleton-pulse" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 rounded-xl skeleton-pulse" />
        ))}
      </div>

      {/* Graph Skeleton */}
      <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-xl skeleton-pulse" />
    </div>
  );
}
