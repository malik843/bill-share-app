'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';

export default function SettleUpButton({ onClick }: { onClick?: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    gsap.to(btnRef.current, { scale: 1.05, duration: 0.2, ease: 'back.out(1.7)' });
  };

  const handleMouseLeave = () => {
    gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
  };

  return (
    <button
      ref={btnRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center space-x-2 w-full max-w-xs"
    >
      <span>Settle Up</span>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </button>
  );
}
