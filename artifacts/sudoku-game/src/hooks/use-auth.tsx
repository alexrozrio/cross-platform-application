import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/react';

// Generates (or re-uses) a persistent anonymous device ID
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
  setProfileId: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  profileId: null,
  setProfileId: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  const [profileId, setProfileIdState] = useState<number | null>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sudoku-profile-id') : null;
    return stored ? parseInt(stored, 10) : null;
  });

  // Track previous clerkUserId to avoid redundant syncs
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

    // Skip sync if nothing changed
    if (prevClerkUserIdRef.current === currentClerkUserId) return;
    prevClerkUserIdRef.current = currentClerkUserId;

    const syncProfile = async () => {
      try {
        let body: Record<string, string>;

        if (user) {
          // Signed in — sync by Clerk user ID
          const email = user.primaryEmailAddress?.emailAddress ?? '';
          const nameFromEmail = email.split('@')[0];
          const displayName = user.fullName || user.firstName || nameFromEmail || 'Player';
          body = {
            clerkUserId: user.id,
            username: displayName,
            ...(user.imageUrl ? { avatar: user.imageUrl } : {}),
          };
        } else {
          // Anonymous — sync by stable device ID
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
        }
      } catch {
        // Network error — keep whatever profileId is already cached
      }
    };

    syncProfile();
  }, [isLoaded, user]);

  return (
    <AuthContext.Provider value={{ profileId, setProfileId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
