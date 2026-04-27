'use client';

import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { UserPlus } from 'lucide-react';

interface Props {
  onSubmit: (data: { fullName: string }) => void;
}

export default function RegisterForm({ onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && email) animateNextStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      setIsLoading(true);
      // Mock account creation
      setTimeout(() => {
        onSubmit({ fullName });
      }, 800);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-primary" /> Create Account
        </h1>
        <p className="text-muted-foreground mt-2">
          {step === 1 && "Let's start with your basic details."}
          {step === 2 && "Secure your account with a password."}
        </p>
      </div>

      <div ref={containerRef} className="space-y-6">
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-muted-foreground">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="flex h-12 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all text-black"
                placeholder="segun."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-muted-foreground">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-12 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all text-black"
                placeholder="name@example.com"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full mt-4 cursor-pointer"
            >
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-12 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full mt-4 cursor-pointer"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <button
              type="button"
              onClick={() => animateNextStep(1)}
              className="mt-2 text-sm text-muted-foreground hover:text-foreground hover:underline w-full text-center focus-visible:outline-none rounded-md px-3 py-2 cursor-pointer"
            >
              Back
            </button>
          </form>
        )}
      </div>
      
      {/* Progress Indicators */}
      <div className="mt-8 flex justify-center space-x-2">
        {[1, 2].map((s) => (
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
