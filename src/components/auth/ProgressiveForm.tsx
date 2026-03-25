'use client';

import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';

export default function ProgressiveForm() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bvn, setBvn] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);

  const animateNextStep = (nextStep: number) => {
    if (!containerRef.current) return;
    
    gsap.to(containerRef.current.children, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      stagger: 0.1,
      onComplete: () => {
        setStep(nextStep);
        gsap.fromTo(
          containerRef.current!.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
        );
      }
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) animateNextStep(2);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) animateNextStep(3);
  };

  const handleBvnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bvn) {
      setIsLoading(true);
      // Mock API call
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to ShareBill</h1>
        <p className="text-muted-foreground mt-2">
          {step === 1 && "Let's start with your email"}
          {step === 2 && "Welcome back. Enter your password"}
          {step === 3 && "Verify your identity with BVN"}
        </p>
      </div>

      <div ref={containerRef} className="space-y-6">
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-12 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="name@example.com"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full"
            >
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-12 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => animateNextStep(1)}
              className="mt-2 text-sm text-muted-foreground hover:text-foreground hover:underline w-full text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-3 py-2"
            >
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleBvnSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="bvn" className="text-sm font-medium leading-none">Bank Verification Number (BVN)</label>
              <input
                id="bvn"
                type="text"
                maxLength={11}
                value={bvn}
                onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                className="flex h-12 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter your 11-digit BVN"
                required
              />
              <p className="text-xs text-muted-foreground">
                We use this to verify your identity to ensure a high-trust environment.
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading || bvn.length !== 11}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full"
            >
              {isLoading ? (
                <span className="animate-pulse">Verifying...</span>
              ) : (
                "Complete Verification"
              )}
            </button>
          </form>
        )}
      </div>
      
      {/* Progress Indicators */}
      <div className="mt-8 flex justify-center space-x-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              s === step ? 'w-8 bg-primary' : s < step ? 'w-4 bg-primary/50' : 'w-4 bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
