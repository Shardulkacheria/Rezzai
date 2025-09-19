'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Protected({ children }) {
  const { user, loading, onboarded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/');
      return;
    }
  }, [user, loading, router]);

  // This wrapper is used for dashboard-like pages where user must be signed in.
  if (loading || !user) return null;
  return children;
}




