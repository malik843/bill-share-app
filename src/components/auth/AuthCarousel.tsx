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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const slides = containerRef.current.querySelectorAll('.carousel-slide');
    
    const ctx = gsap.context(() => {
      // Animate out all slides
      gsap.to(slides, {
        opacity: 0,
        zIndex: 0,
        scale: 1.05,
        duration: 1.2,
        ease: 'power3.out'
      });
      
      // Animate in the current slide
      gsap.to(slides[currentIndex], {
        opacity: 1,
        zIndex: 10,
        scale: 1,
        duration: 1.2,
        ease: 'power3.out'
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, [currentIndex]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src}
          className="carousel-slide absolute inset-0 opacity-0"
          style={{
            zIndex: index === 0 ? 10 : 0,
            opacity: index === 0 ? 1 : 0
          }}
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
