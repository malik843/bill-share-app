'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BloomBackground, { BloomRef } from '@/components/auth/BloomBackground';
import MouseGradient from '@/components/auth/MouseGradient';
import RegisterForm from '@/components/auth/RegisterForm';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import gsap from 'gsap';

const REGISTER_COLORS = ["#EF4444", "#14B8A6", "#0EA5E9", "#0F172A", "#F8FAFC"];
const ONBOARDING_COLORS = ["#F8FAFC", "#EF4444", "#14B8A6", "#0EA5E9", "#0F172A"];

export default function RegisterPage() {
  const [phase, setPhase] = useState<'register' | 'onboarding'>('register');
  const [registeredName, setRegisteredName] = useState('');
  const [showMouseGradient, setShowMouseGradient] = useState(false);
  
  const bloomRef = useRef<BloomRef>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Phase 1: Initial load
  useEffect(() => {
    const initFlow = async () => {
      // 1. Bloom in
      if (bloomRef.current) {
        await bloomRef.current.bloomIn();
      }
      
      // 2. Start 4s timer for gradient tracking
      timerRef.current = setTimeout(() => {
        setShowMouseGradient(true);
      }, 4000);

      // 3. Reveal form
      if (formContainerRef.current) {
        gsap.fromTo(formContainerRef.current, 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }
    };
    initFlow();
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleRegisterSubmit = async (data: { fullName: string }) => {
    setRegisteredName(data.fullName);
    
    // Hide gradient immediately and clear any pending timers
    setShowMouseGradient(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // 1. Fade form out
    if (formContainerRef.current) {
      await gsap.to(formContainerRef.current, { opacity: 0, y: -20, duration: 0.3 });
    }
    
    // 2. Bloom Reverse
    if (bloomRef.current) {
      await bloomRef.current.bloomOut();
    }
    
    // 3. Swap Phase
    setPhase('onboarding');
    
    // Wait a tick for React to render the new component inside the container
    gsap.delayedCall(0.1, async () => {
      // 4. Re-Bloom in
      if (bloomRef.current) {
        await bloomRef.current.bloomIn();
      }
      
      // We don't trigger the gradient during onboarding, per request
      
      // 5. Reveal new form
      if (formContainerRef.current) {
        gsap.fromTo(formContainerRef.current, 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }
    });
  };

  const handleOnboardingSubmit = async () => {
    // 1. Fade form out
    if (formContainerRef.current) {
      await gsap.to(formContainerRef.current, { opacity: 0, y: -20, duration: 0.3 });
    }
    
    // 2. Bloom Reverse
    if (bloomRef.current) {
      await bloomRef.current.bloomOut();
    }
    
    // 3. Redirect
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020617] flex items-center justify-center overflow-hidden">
      <BloomBackground ref={bloomRef} colors={phase === 'register' ? REGISTER_COLORS : ONBOARDING_COLORS} />
      
      <MouseGradient active={showMouseGradient} isLightMode={phase === 'register'} />
      
      <div 
        ref={formContainerRef}
        className={`relative z-10 w-full shadow-2xl bg-white/5 backdrop-blur-3xl opacity-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          phase === 'register' 
            ? 'max-w-[32rem] mx-4 p-8 md:p-12 min-h-[auto] rounded-[2rem] border border-white/10' 
            : 'max-w-none w-screen h-screen mx-0 p-0 rounded-none border-none flex overflow-hidden'
        }`}
      >
        {phase === 'register' ? (
          <RegisterForm onSubmit={handleRegisterSubmit} />
        ) : (
          <OnboardingForm initialName={registeredName} onSubmit={handleOnboardingSubmit} />
        )}
      </div>
    </div>
  );
}
