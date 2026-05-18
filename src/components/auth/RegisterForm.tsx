'use client';

import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { UserPlus, LogIn, AlertTriangle, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Props {
  onSuccess: () => void;
  onBack: () => void;
}

export default function RegisterForm({ onSuccess, onBack }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const toggleMode = () => {
    setError('');
    setMode(prev => prev === 'login' ? 'register' : 'login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (mode === 'register') {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: fullName, email, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Something went wrong');
          setIsLoading(false);
          return;
        }

        // Successfully registered, now sign in
        const signInRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.error) {
          setError('Failed to log in after registration');
          setIsLoading(false);
        } else {
          onSuccess();
        }
      } catch (err) {
        setError('Network error');
        setIsLoading(false);
      }
    } else {
      // Login mode
      try {
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError('Invalid email or password');
          setIsLoading(false);
        } else {
          onSuccess();
        }
      } catch (err) {
        setError('Network error');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full text-left space-y-6">
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex justify-center items-center gap-2">
          {mode === 'login' ? (
            <><LogIn className="w-6 h-6 text-primary" /> Welcome Back</>
          ) : (
            <><UserPlus className="w-6 h-6 text-primary" /> Create Account</>
          )}
        </h1>
        <p className="text-white/60 text-sm">
          {mode === 'login' ? "Enter your email to sign in to your account" : "Enter your details to create a new account"}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/80">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
              placeholder="Segun"
              required
            />
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white/80">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white/80">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-white text-gray-800 hover:bg-gray-100 h-11 w-full mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'login' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div className="text-center space-y-4 pt-2 border-t border-white/10">
        <button
          onClick={toggleMode}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
        
        <div>
          <button
            onClick={onBack}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            ← Back to Google Login
          </button>
        </div>
      </div>
    </div>
  );
}
