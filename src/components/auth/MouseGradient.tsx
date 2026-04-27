'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MouseGradientProps {
  active: boolean;
  isLightMode: boolean;
}

export default function MouseGradient({ active, isLightMode }: MouseGradientProps) {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!blobRef.current) return;
      gsap.to(blobRef.current, {
        x: e.clientX,
        y: e.clientY,
        xPercent: -50,
        yPercent: -50,
        duration: 0.8,
        ease: 'power3.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (active && blobRef.current) {
      gsap.to(blobRef.current, { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' });
    } else if (!active && blobRef.current) {
      gsap.to(blobRef.current, { opacity: 0, scale: 0.8, duration: 0.5, ease: 'power2.out' });
    }
  }, [active]);

  // Adjust gradient colors based on whether background is light (#F8FAFC) or dark (#0F172A)
  const gradientStyle = isLightMode 
    ? 'radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, rgba(20, 184, 166, 0.15) 40%, rgba(255,255,255,0) 70%)'
    : 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(45, 212, 191, 0.1) 40%, rgba(0,0,0,0) 70%)';

  return (
    <div
      ref={blobRef}
      className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] rounded-full opacity-0 z-[5] mix-blend-normal transform scale-75"
      style={{
        background: gradientStyle,
        filter: 'blur(50px)',
      }}
    />
  );
}
