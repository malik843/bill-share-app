'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

const images = [
  '/carousel-1.jpg',
  '/carousel-2.jpg',
  '/carousel-3.jpg',
  '/carousel-4.jpg'
];

export default function AuthCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const validSlides = slidesRef.current.filter(Boolean) as HTMLDivElement[];
    if (validSlides.length === 0) return;

    let current = 0;
    
    const ctx = gsap.context(() => {
      // Set initial state for all slides directly within the context
      gsap.set(validSlides, { opacity: 0, zIndex: 0, scale: 1.05 });
      gsap.set(validSlides[0], { opacity: 1, zIndex: 10, scale: 1 });
    }, containerRef);

    const interval = setInterval(() => {
      const next = (current + 1) % images.length;
      
      ctx.add(() => {
        // Animate out previous
        gsap.to(validSlides[current], {
          opacity: 0,
          zIndex: 0,
          scale: 1.05,
          duration: 1.2,
          ease: 'power3.out',
          overwrite: 'auto'
        });
        
        // Animate in next
        gsap.to(validSlides[next], {
          opacity: 1,
          zIndex: 10,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });
      
      current = next;
      setCurrentIndex(current);
    }, 5000);

    return () => {
      clearInterval(interval);
      ctx.revert(); // Only revert safely exactly when component unmounts
    };
  }, []); // Run only once on mount

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900">
      {images.map((src, index) => (
        <div
          key={src}
          ref={(el) => { slidesRef.current[index] = el; }}
          className={`carousel-slide absolute inset-0 ${index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <Image
            src={src}
            alt={`Carousel image ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Subtle overlay to ensure the text remains readable against bright images */}
          <div className="absolute inset-0 bg-slate-900/40" />
        </div>
      ))}
      
      {/* Indicator dots positioned at the top */}
      <div className="absolute top-12 left-0 right-0 z-20 flex justify-center space-x-3">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${
              index === currentIndex ? 'w-8 bg-white' : 'w-4 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
