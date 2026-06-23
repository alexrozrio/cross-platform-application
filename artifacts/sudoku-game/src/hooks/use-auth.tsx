import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/react';

function getOrCreateDeviceId(): string {
  const KEY = 'sudoku-device-id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    const rand = Math.random().toString(36).substring(2, 10);
    id = `device_${rand}_${Date.now()}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

interface AuthContextType {
  profileId: number | null;
  isReady: boolean;
  setProfileId: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  profileId: null,
  isReady: false,
  setProfileId: () => {},
});

export function AuthProvider({
  children,
  onProfileSynced,
}: {
  children: React.ReactNode;
  onProfileSynced?: (profileId: number) => void;
}) {
  const { user, isLoaded } = useUser();

  const [profileId, setProfileIdState] = useState<number | null>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sudoku-profile-id') : null;
    return stored ? parseInt(stored, 10) : null;
  });

  // isReady = true once the first sync attempt has completed (success or failure)
  const [isReady, setIsReady] = useState<boolean>(() => {
    // If we already have a cached profileId, consider ready immediately
    return !!localStorage.getItem('sudoku-profile-id');
  });

  const prevClerkUserIdRef = useRef<string | null | undefined>(undefined);

  const setProfileId = (id: number | null) => {
    if (id) {
      localStorage.setItem('sudoku-profile-id', id.toString());
    } else {
      localStorage.removeItem('sudoku-profile-id');
    }
    setProfileIdState(id);
  };

  useEffect(() => {
    if (!isLoaded) return;

    const currentClerkUserId = user?.id ?? null;

    if (prevClerkUserIdRef.current === currentClerkUserId) {
      // Nothing changed — mark ready if not already
      setIsReady(true);
      return;
    }
    prevClerkUserIdRef.current = currentClerkUserId;

    const syncProfile = async () => {
      try {
        let body: Record<string, string>;

        if (user) {
          const email = user.primaryEmailAddress?.emailAddress ?? '';
          const nameFromEmail = email.split('@')[0];
          const displayName = user.fullName || user.firstName || nameFromEmail || 'Player';
          body = {
            clerkUserId: user.id,
            username: displayName,
            ...(user.imageUrl ? { avatar: user.imageUrl } : {}),
          };
        } else {
          body = { deviceId: getOrCreateDeviceId() };
        }

        const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
        const res = await fetch(`${basePath}/api/profiles/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
        });

        if (res.ok) {
          const profile = await res.json();
          setProfileId(profile.id);
          onProfileSynced?.(profile.id);
        }
      } catch {
        // Network error — keep whatever profileId is already cached
      } finally {
        setIsReady(true);
      }
    };

    syncProfile();
  }, [isLoaded, user]);

  return (
    <AuthContext.Provider value={{ profileId, isReady, setProfileId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
