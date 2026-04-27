'use client';

import { useRouter } from 'next/navigation';
import SplitScreenLayout from '@/components/auth/SplitScreenLayout';
import OnboardingForm from '@/components/onboarding/OnboardingForm';

export default function OnboardingPage() {
  const router = useRouter();
  return (
    <SplitScreenLayout>
      <OnboardingForm onSubmit={() => router.push('/dashboard')} />
    </SplitScreenLayout>
  );
}
