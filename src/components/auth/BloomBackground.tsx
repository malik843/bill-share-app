'use client';

import React, { useImperativeHandle, forwardRef, useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

export interface BloomRef {
  bloomIn: () => Promise<void>;
  bloomOut: () => Promise<void>;
}

interface BloomBackgroundProps {
  colors: string[];
}

const BloomBackground = forwardRef<BloomRef, BloomBackgroundProps>(({ colors }, ref) => {
  const [size, setSize] = useState(2000); // Fallback size
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const updateSize = () => {
      const diag = Math.hypot(window.innerWidth, window.innerHeight);
      setSize(diag);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Ensure circles start at scale 0 explicitly via GSAP for consistency
  useEffect(() => {
    gsap.set(circleRefs.current, { scale: 0 });
  }, []);

  useImperativeHandle(ref, () => ({
    bloomIn: () => {
      return new Promise((resolve) => {
        gsap.to(circleRefs.current, {
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          onComplete: () => resolve()
        });
      });
    },
    bloomOut: () => {
      return new Promise((resolve) => {
        gsap.to(circleRefs.current, {
          scale: 0,
          duration: 0.6,
          stagger: { each: 0.12, from: 'end' },
          ease: 'power2.in',
          onComplete: () => resolve()
        });
      });
    }
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
      {colors.map((color, index) => (
        <div
          key={index}
          ref={(el) => {
            circleRefs.current[index] = el;
          }}
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            width: `${size}px`,
            height: `${size}px`,
            top: '50%',
            left: '50%',
            marginTop: `-${size / 2}px`,
            marginLeft: `-${size / 2}px`,
            // transform starts at 0 via GSAP
            zIndex: index + 1,
          }}
        />
      ))}
    </div>
  );
});

BloomBackground.displayName = 'BloomBackground';
export default BloomBackground;
