'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [onboarded, setOnboarded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        try {
          const res = await fetch(`/api/profile?userId=${nextUser.uid}`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            setProfile(data || null);
            setOnboarded(Boolean(data && data.onboarded));
          } else if (res.status === 404) {
            setProfile(null);
            setOnboarded(false);
          } else {
            setProfile(null);
          }
        } catch (e) {
          setProfile(null);
        }
      } else {
        setProfile(null);
        setOnboarded(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setOnboarded(false);
    router.replace('/');
  };

  const value = {
    user,
    profile,
    onboarded,
    loading,
    logout,
    refreshProfile: async () => {
      if (!user) return;
      const res = await fetch(`/api/profile?userId=${user.uid}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setProfile(data || null);
        setOnboarded(Boolean(data && data.onboarded));
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

