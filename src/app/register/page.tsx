'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import BloomBackground, { BloomRef } from '@/components/auth/BloomBackground';
import MouseGradient from '@/components/auth/MouseGradient';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import RegisterForm from '@/components/auth/RegisterForm';
import gsap from 'gsap';

const REGISTER_COLORS = ["#EF4444", "#14B8A6", "#0EA5E9", "#0F172A", "#F8FAFC"];
const ONBOARDING_COLORS = ["#F8FAFC", "#EF4444", "#14B8A6", "#0EA5E9", "#0F172A"];

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const [phase, setPhase] = useState<'auth' | 'onboarding'>('auth');
  const [authMethod, setAuthMethod] = useState<'google' | 'credentials'>('google');
  const [showMouseGradient, setShowMouseGradient] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const bloomRef = useRef<BloomRef>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // If already authenticated, check onboarding status
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Check if user has completed onboarding
      fetch('/api/groups')
        .then(res => res.json())
        .then(groups => {
          if (Array.isArray(groups) && groups.length > 0) {
            // Already onboarded — go to dashboard
            router.push('/dashboard');
          } else {
            // Needs onboarding
            setPhase('onboarding');
          }
        })
        .catch(() => {
          // On error, show onboarding
          setPhase('onboarding');
        });
    }
  }, [status, session, router]);

  // Phase 1: Initial load — bloom in
  useEffect(() => {
    const initFlow = async () => {
      if (bloomRef.current) {
        await bloomRef.current.bloomIn();
      }
      
      timerRef.current = setTimeout(() => {
        setShowMouseGradient(true);
      }, 4000);

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

  // Transition to onboarding when phase changes
  useEffect(() => {
    if (phase === 'onboarding') {
      const transition = async () => {
        setShowMouseGradient(false);
        if (timerRef.current) clearTimeout(timerRef.current);

        if (formContainerRef.current) {
          await gsap.to(formContainerRef.current, { opacity: 0, y: -20, duration: 0.3 });
        }
        if (bloomRef.current) {
          await bloomRef.current.bloomOut();
        }

        gsap.delayedCall(0.1, async () => {
          if (bloomRef.current) {
            await bloomRef.current.bloomIn();
          }
          if (formContainerRef.current) {
            gsap.fromTo(formContainerRef.current, 
              { opacity: 0, y: 30 }, 
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );
          }
        });
      };
      transition();
    }
  }, [phase]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn('google', { callbackUrl: '/register' });
    } catch {
      setIsSigningIn(false);
    }
  };

  const handleOnboardingSubmit = async () => {
    // Fade form out
    if (formContainerRef.current) {
      await gsap.to(formContainerRef.current, { opacity: 0, y: -20, duration: 0.3 });
    }
    
    // Bloom reverse
    if (bloomRef.current) {
      await bloomRef.current.bloomOut();
    }
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="relative min-h-screen w-full bg-[#020617] flex items-center justify-center">
        <BloomBackground ref={bloomRef} colors={REGISTER_COLORS} />
        <div className="text-white/60 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#020617] flex items-center justify-center overflow-hidden">
      <BloomBackground ref={bloomRef} colors={phase === 'auth' ? REGISTER_COLORS : ONBOARDING_COLORS} />
      
      <MouseGradient active={showMouseGradient} isLightMode={phase === 'auth'} />
      
      <div 
        ref={formContainerRef}
        className={`relative z-10 w-full shadow-2xl bg-white/5 backdrop-blur-3xl opacity-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          phase === 'auth' 
            ? 'max-w-[32rem] mx-4 p-8 md:p-12 min-h-[auto] rounded-[2rem] border border-white/10' 
            : 'max-w-none w-screen h-screen mx-0 p-0 rounded-none border-none flex overflow-hidden'
        }`}
      >
        {phase === 'auth' ? (
          authMethod === 'google' ? (
            /* ─── Google Sign-In Card ─── */
            <div className="flex flex-col items-center text-center space-y-8">
              {/* Logo */}
              <div className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                </div>
                ShareBill.
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">Welcome</h1>
                <p className="text-white/60 text-sm max-w-xs">
                  Split bills with friends, simplify debts, and settle up in seconds.
                </p>
              </div>

              <div className="w-full max-w-xs space-y-3">
                {/* Google Sign-In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full h-14 flex items-center justify-center gap-3 rounded-xl bg-white text-gray-800 font-semibold text-sm transition-all hover:bg-gray-50 hover:shadow-lg hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSigningIn ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  {isSigningIn ? 'Signing in...' : 'Continue with Google'}
                </button>
                
                {/* Credentials Toggle Button */}
                <button
                  onClick={() => setAuthMethod('credentials')}
                  disabled={isSigningIn}
                  className="w-full h-14 flex items-center justify-center gap-3 rounded-xl bg-transparent border-2 border-gray-200 text-gray-900 font-semibold text-sm transition-all hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Continue with Email
                </button>
              </div>

              <p className="text-white/30 text-xs max-w-xs">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          ) : (
            <RegisterForm 
              onSuccess={handleOnboardingSubmit} 
              onBack={() => setAuthMethod('google')} 
            />
          )
        ) : (
          /* ─── Cinematic Onboarding (easily removable — just switch to router.push('/dashboard')) ─── */
          <OnboardingForm initialName={session?.user?.name || ''} onSubmit={handleOnboardingSubmit} />
        )}
      </div>
    </div>
  );
}
