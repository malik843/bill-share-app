'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useDispatch } from 'react-redux';
import { setUserProfile, UserProfile } from '@/store/dashboardSlice';
import { ChevronRight, CreditCard, Smartphone, Banknote, Wallet, X, Check } from 'lucide-react';

const AVATARS = ['😎', '🚀', '🌟', '🦄', '🦁', '🦊', '🦉', '🦋'];

const CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' },
];

const PAYMENT_METHODS = [
  { id: 'bank_transfer', icon: Banknote, title: 'Bank Transfer', desc: 'Direct to your bank account' },
  { id: 'mobile_money', icon: Smartphone, title: 'Mobile Money', desc: 'Quick mobile payments' },
  { id: 'card', icon: CreditCard, title: 'Card Payment', desc: 'Debit or credit card' },
  { id: 'in_app_wallet', icon: Wallet, title: 'In-App Wallet', desc: 'Keep balances inside ShareBill' },
];

const GROUP_ICONS = ['🏠', '🍕', '✈️', '👨‍👩‍👧‍👦', '💼'];

export interface OnboardingData {
  displayName: string;
  avatarId: string;
  phoneNumber: string | null;
  currency: "NGN" | "USD" | "EUR" | "GBP" | "CAD" | "GHS";
  paymentMethod: "bank_transfer" | "mobile_money" | "card" | "paypal" | "in_app_wallet" | null;
  firstGroup: {
    name: string;
    icon: string;
    members: string[];
  };
}

interface Props {
  initialName?: string;
  onSubmit: () => void;
}

const STEP_DETAILS = [
  { id: 1, title: 'Identity', subtitle: 'Who are you?' },
  { id: 2, title: 'Currency', subtitle: 'Regional settings' },
  { id: 3, title: 'Payment', subtitle: 'Settle up' },
  { id: 4, title: 'Network', subtitle: 'Your first group' },
];

export default function OnboardingForm({ initialName = '', onSubmit }: Props) {
  const dispatch = useDispatch();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [data, setData] = useState<OnboardingData>({
    displayName: initialName,
    avatarId: AVATARS[0],
    phoneNumber: '',
    currency: 'NGN',
    paymentMethod: null,
    firstGroup: {
      name: '',
      icon: GROUP_ICONS[0],
      members: [],
    }
  });

  const [memberInput, setMemberInput] = useState('');
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      if (locale.includes('NG')) { setDetectedCurrency('NGN'); setData(d => ({ ...d, currency: 'NGN' })); }
      else if (locale.includes('US')) { setDetectedCurrency('USD'); setData(d => ({ ...d, currency: 'USD' })); }
      else if (locale.includes('GB')) { setDetectedCurrency('GBP'); setData(d => ({ ...d, currency: 'GBP' })); }
      else if (locale.includes('CA')) { setDetectedCurrency('CAD'); setData(d => ({ ...d, currency: 'CAD' })); }
      else if (locale.includes('GH')) { setDetectedCurrency('GHS'); setData(d => ({ ...d, currency: 'GHS' })); }
      else { setDetectedCurrency('EUR'); setData(d => ({ ...d, currency: 'EUR' })); }
    } catch(e) {
      // Ignore
    }
  }, []);

  const getStepRef = (s: number) => {
    if (s === 1) return step1Ref;
    if (s === 2) return step2Ref;
    if (s === 3) return step3Ref;
    if (s === 4) return step4Ref;
    return null;
  };

  const shakeElement = (el: HTMLElement) => {
    gsap.fromTo(el, 
      { x: 0 },
      { x: 8, duration: 0.1, yoyo: true, repeat: 3, ease: 'power1.inOut', onComplete: () => { gsap.set(el, { x: 0 }); } }
    );
  };

  const handleNext = async () => {
    if (step === 1 && !data.displayName.trim()) {
      const input = document.getElementById('displayNameInput');
      if (input) shakeElement(input);
      return;
    }
    if (step === 4) {
      const hasName = data.firstGroup.name.trim().length > 0;
      const hasMembers = data.firstGroup.members.length > 0;
      // If they started filling it out, make sure they finish it (prevent partial group data)
      if ((hasName && !hasMembers) || (!hasName && hasMembers)) {
        const input1 = document.getElementById('groupNameInput');
        const input2 = document.getElementById('membersInput');
        if (!hasName && input1) shakeElement(input1);
        if (!hasMembers && input2) shakeElement(input2);
        return;
      }
    }

    if (step === 4) {
      // Create group via API if user filled out group data
      const hasGroup = data.firstGroup.name.trim().length > 0;
      if (hasGroup) {
        try {
          await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: data.firstGroup.name,
              icon: data.firstGroup.icon,
              currency: data.currency,
            }),
          });
        } catch (e) {
          console.error('Failed to create group:', e);
        }
      }
      // Persist to local Redux for immediate UI use
      dispatch(setUserProfile(data as unknown as UserProfile));
      onSubmit();
      return;
    }

    const currentRef = getStepRef(step);
    const nextRef = getStepRef(step + 1);

    if (currentRef?.current && nextRef?.current) {
      await gsap.to(currentRef.current, { opacity: 0, x: -40, duration: 0.3, ease: 'power2.in' });
      setStep((step + 1) as any);
      gsap.fromTo(nextRef.current, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
    }
  };

  const handleBack = async () => {
    if (step === 1) return;
    
    const currentRef = getStepRef(step);
    const prevRef = getStepRef(step - 1);

    if (currentRef?.current && prevRef?.current) {
      await gsap.to(currentRef.current, { opacity: 0, x: 40, duration: 0.3, ease: 'power2.in' });
      setStep((step - 1) as any);
      gsap.fromTo(prevRef.current, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
    }
  };

  const addMember = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = memberInput.trim().replace(',', '');
      if (val && !data.firstGroup.members.includes(val) && data.firstGroup.members.length < 10) {
        setData({ ...data, firstGroup: { ...data.firstGroup, members: [...data.firstGroup.members, val] } });
        setMemberInput('');
      }
    }
  };

  const removeMember = (m: string) => {
    setData({ ...data, firstGroup: { ...data.firstGroup, members: data.firstGroup.members.filter(x => x !== m) } });
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
      
      {/* LEFT PANE - Sidebar Stepper */}
      <div className="w-full md:w-[32%] lg:w-[28%] bg-black/40 border-r border-white/5 p-8 md:p-12 flex flex-col relative z-20">
        <div className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          </div>
          ShareBill.
        </div>
        
        <div className="flex-1 flex flex-col justify-center gap-10">
          <div className="relative flex flex-col gap-10">
            {/* Vertical Connecting Lines */}
            <div className="absolute top-6 bottom-6 left-6 w-0.5 bg-white/5 -translate-x-1/2 z-0">
              <div 
                className="absolute top-0 left-0 w-full bg-primary shadow-[0_0_15px_rgba(14,165,233,0.8)] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" 
                style={{ height: `${((step - 1) / 3) * 100}%` }}
              />
            </div>

            {STEP_DETAILS.map((s) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              const isPending = step < s.id;

              return (
                <div key={s.id} className={`flex items-center gap-6 relative z-10 transition-all duration-300 ${isPending ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                  {/* Circle Marker */}
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-500 border-2 ${
                      isCompleted 
                        ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' 
                        : isActive 
                          ? 'bg-primary border-primary text-white shadow-[0_0_20px_rgba(14,165,233,0.5)] scale-110'
                          : 'bg-[#0f172a] border-white/20 text-white/50'
                    }`}
                  >
                    {isCompleted ? <Check className="w-6 h-6" /> : s.id}
                  </div>
                  
                  {/* Step Labels */}
                  <div className="flex flex-col">
                    <span className={`text-lg font-bold tracking-tight ${isActive ? 'text-white' : 'text-white/70'}`}>{s.title}</span>
                    <span className="text-sm text-white/40">{s.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* RIGHT PANE - Form Content */}
      <div className="flex-1 p-8 md:p-14 lg:p-20 flex flex-col items-center justify-center relative overflow-y-auto bg-transparent">
        
        {/* Centered Wrapper for Form & Footer */}
        <div className="w-full max-w-2xl flex flex-col">
          
          <div className="relative w-full" ref={containerRef}>
            
            {/* SEGMENT 1: IDENTITY */}
            <div ref={step1Ref} className={`w-full ${step === 1 ? 'relative z-10' : 'absolute top-0 left-0 z-0 pointer-events-none opacity-0'}`}>
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-white">Let's set up your profile</h2>
                <p className="text-white/60 mt-2">This is how people will recognize you</p>
              </div>

              <div className="space-y-8 w-full">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">Avatar Selection</label>
                  <div className="flex flex-wrap gap-3">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => {
                          setData({ ...data, avatarId: a });
                          gsap.fromTo(`#avatar-${a}`, { scale: 0.8 }, { scale: 1.05, duration: 0.4, ease: 'back.out(1.7)' });
                        }}
                        id={`avatar-${a}`}
                        className={`w-14 h-14 rounded-full text-2xl flex items-center justify-center transition-colors border-2 cursor-pointer ${
                          data.avatarId === a 
                            ? 'border-primary bg-primary/20 shadow-[0_0_20px_rgba(14,165,233,0.3)]' 
                            : 'border-transparent bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className={data.avatarId === a ? 'scale-110 transition-transform' : ''}>{a}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Display Name <span className="text-destructive">*</span></label>
                  <input
                    id="displayNameInput"
                    type="text"
                    value={data.displayName}
                    onChange={(e) => setData({ ...data, displayName: e.target.value })}
                    className="flex h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-base text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:bg-white/10 transition-colors placeholder:text-white/30"
                    placeholder="e.g. Tunde, Sarah, Alex"
                    maxLength={24}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center justify-between">
                    Phone Number <span className="text-xs text-white/60 font-normal bg-white/5 px-2 py-1 rounded">Optional</span>
                  </label>
                  <input
                    type="tel"
                    value={data.phoneNumber || ''}
                    onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                    className="flex h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-base text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:bg-white/10 transition-colors placeholder:text-white/30"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>
            </div>

            {/* SEGMENT 2: CURRENCY */}
            <div ref={step2Ref} className={`w-full ${step === 2 ? 'relative z-10' : 'absolute top-0 left-0 z-0 pointer-events-none opacity-0'}`}>
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-white">Choose your currency</h2>
                <p className="text-white/60 mt-2">All bills and balances will display in this currency</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setData({ ...data, currency: c.code as any });
                      gsap.fromTo(`#currency-${c.code}`, { scale: 0.95 }, { scale: 1.02, duration: 0.3, ease: 'back.out(1.5)' });
                    }}
                    id={`currency-${c.code}`}
                    className={`relative flex items-center p-5 rounded-2xl border transition-colors text-left cursor-pointer ${
                      data.currency === c.code
                        ? 'border-primary bg-primary/10 shadow-[0_0_25px_rgba(14,165,233,0.15)]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-4xl mr-4">{c.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-base">{c.code}</span>
                      <span className="text-sm text-white/60">{c.name}</span>
                    </div>
                    {detectedCurrency === c.code && (
                      <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-bold bg-primary/20 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                        Detected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* SEGMENT 3: PAYMENT PREFERENCES */}
            <div ref={step3Ref} className={`w-full ${step === 3 ? 'relative z-10' : 'absolute top-0 left-0 z-0 pointer-events-none opacity-0'}`}>
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-white">How do you want to settle up?</h2>
                <p className="text-white/60 mt-2">You can always change this later in settings</p>
              </div>

              <div className="space-y-4 w-full">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = data.paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        setData({ ...data, paymentMethod: pm.id as any });
                        gsap.fromTo(`#pm-${pm.id}`, { scale: 0.98 }, { scale: 1.02, duration: 0.3, ease: 'back.out(1.5)' });
                      }}
                      id={`pm-${pm.id}`}
                      className={`w-full flex items-center p-4 rounded-2xl border transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(14,165,233,0.15)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`p-3 rounded-xl mr-5 ${isSelected ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/60'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base">{pm.title}</span>
                        <span className="text-sm text-white/60">{pm.desc}</span>
                      </div>
                    </button>
                  )
                })}
                
                <button
                  type="button"
                  onClick={() => { setData({ ...data, paymentMethod: null }); handleNext(); }}
                  className="w-full py-4 mt-4 text-sm font-medium text-white/60 hover:text-white transition-colors border border-transparent hover:border-white/10 rounded-xl cursor-pointer"
                >
                  Skip for now
                </button>
              </div>
            </div>

            {/* SEGMENT 4: NETWORK */}
            <div ref={step4Ref} className={`w-full ${step === 4 ? 'relative z-10' : 'absolute top-0 left-0 z-0 pointer-events-none opacity-0'}`}>
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-white">Create your first group</h2>
                <p className="text-white/60 mt-2">You can split bills with anyone in your group</p>
              </div>

              <div className="space-y-8 w-full">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">Group Name</label>
                  <input
                    id="groupNameInput"
                    type="text"
                    value={data.firstGroup.name}
                    onChange={(e) => setData({ ...data, firstGroup: { ...data.firstGroup, name: e.target.value } })}
                    className="flex h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-base text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:bg-white/10 transition-colors placeholder:text-white/30"
                    placeholder="e.g. Roommates, Trip Squad"
                  />
                  <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                    {['Roommates', 'Office Lunch', 'Trip Squad', 'Family'].map(s => (
                      <button 
                        key={s} type="button" 
                        onClick={() => setData({ ...data, firstGroup: { ...data.firstGroup, name: s } })}
                        className="whitespace-nowrap px-4 py-2 text-xs font-medium rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-white flex items-center justify-between">
                    Invite Members <span className="text-[10px] text-white/60 font-normal bg-white/5 px-2 py-0.5 rounded">Optional</span>
                  </label>
                  <div 
                    id="membersInput"
                    className="min-h-14 w-full rounded-xl border border-white/10 bg-white/5 p-3 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white/10 transition-colors flex flex-wrap gap-2 items-center"
                  >
                    {data.firstGroup.members.map(m => (
                      <span key={m} className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/30 text-primary text-sm px-3 py-1.5 rounded-lg shadow-sm">
                        {m}
                        <button type="button" onClick={() => removeMember(m)} className="hover:text-white ml-1 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      onKeyDown={addMember}
                      className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder:text-white/30 min-w-37.5"
                      placeholder={data.firstGroup.members.length === 0 ? "Type name & press Enter..." : ""}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">Group Icon</label>
                  <div className="flex gap-4">
                    {GROUP_ICONS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setData({ ...data, firstGroup: { ...data.firstGroup, icon: i } })}
                        className={`w-14 h-14 rounded-2xl text-2xl flex items-center justify-center transition-colors cursor-pointer ${
                          data.firstGroup.icon === i 
                            ? 'border-primary bg-primary/20 border-2 scale-105 shadow-[0_0_15px_rgba(14,165,233,0.25)]' 
                            : 'border border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { 
                    // Skip group creation — just save profile and advance
                    dispatch(setUserProfile({...data, firstGroup: { name: '', icon: GROUP_ICONS[0], members: [] }} as unknown as UserProfile));
                    onSubmit();
                  }}
                  className="w-full py-4 mt-6 text-sm font-medium text-white/60 hover:text-white transition-colors border border-transparent hover:border-white/10 rounded-xl cursor-pointer"
                >
                  Skip for now
                </button>

              </div>
            </div>

          </div>

          {/* Navigation Footer */}
          <div className="w-full flex justify-between gap-4 pt-8 border-t border-white/10 mt-10 z-20">
            <button
              type="button"
              onClick={handleBack}
              className={`h-14 px-8 rounded-xl text-sm font-medium text-white hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              Back
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              className={`h-14 px-10 flex items-center justify-center gap-3 rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-[0_0_20px_rgba(14,165,233,0.3)] cursor-pointer hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] hover:scale-[1.02] ${
                step === 4 
                  ? 'bg-linear-to-r from-primary to-accent text-white' 
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              {step === 4 ? 'Let\'s Go' : 'Continue'}
              {step !== 4 && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
