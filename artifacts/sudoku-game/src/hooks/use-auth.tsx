import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiUrl } from '../lib/api-base-url';

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

interface ReplitUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}

interface AuthContextType {
  profileId: number | null;
  isReady: boolean;
  replitUser: ReplitUser | null;
  isSignedIn: boolean;
  setProfileId: (id: number | null) => void;
  restoreGuestProfile: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  profileId: null,
  isReady: false,
  replitUser: null,
  isSignedIn: false,
  setProfileId: () => {},
  restoreGuestProfile: async () => {
    throw new Error('Guest profile restore is unavailable.');
  },
});

export function AuthProvider({
  children,
  onProfileSynced,
}: {
  children: React.ReactNode;
  onProfileSynced?: (profileId: number) => void;
}) {
  const [replitUser, setReplitUser] = useState<ReplitUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [profileId, setProfileIdState] = useState<number | null>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sudoku-profile-id') : null;
    return stored ? parseInt(stored, 10) : null;
  });

  const [isReady, setIsReady] = useState<boolean>(() => {
    return !!localStorage.getItem('sudoku-profile-id');
  });

  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  const setProfileId = (id: number | null) => {
    if (id) {
      localStorage.setItem('sudoku-profile-id', id.toString());
    } else {
      localStorage.removeItem('sudoku-profile-id');
    }
    setProfileIdState(id);
  };

  const restoreGuestProfile = async (code: string) => {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    const res = await fetch(apiUrl(`${basePath}/api/profiles/restore-guest`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      credentials: 'include',
    });
    const result = await res.json().catch(() => ({})) as {
      profileId?: number;
      deviceId?: string;
      error?: string;
    };
    if (!res.ok) {
      throw new Error(result.error ?? 'Could not restore this guest profile.');
    }
    if (typeof result.profileId !== 'number' || !Number.isSafeInteger(result.profileId) || typeof result.deviceId !== 'string' || !result.deviceId) {
      throw new Error('The server returned an invalid guest profile.');
    }

    localStorage.setItem('sudoku-device-id', result.deviceId);
    setProfileId(result.profileId);
  };

  useEffect(() => {
    const controller = new AbortController();
    const url = apiUrl('/api/auth/user');
    const isCrossOrigin = url.startsWith('http');
    // The deployed API may be waking from an idle period. A short timeout
    // makes native startup silently skip guest-profile creation on cold starts.
    const timeoutId = setTimeout(() => controller.abort(), isCrossOrigin ? 60_000 : 15_000);
    fetch(url, { credentials: isCrossOrigin ? 'omit' : 'include', signal: controller.signal })
      .then((res) => {
        if (res.status === 401) return null;
        if (!res.ok) return null;
        return res.json() as Promise<ReplitUser>;
      })
      .then((user) => {
        if (user) localStorage.setItem("sudoku-has-signed-in", "true");
        setReplitUser(user);
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      })
      .finally(() => clearTimeout(timeoutId));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const currentUserId = replitUser?.id ?? null;

    if (prevUserIdRef.current === currentUserId) {
      setIsReady(true);
      return;
    }
    prevUserIdRef.current = currentUserId;

    const syncProfile = async () => {
      const controller = new AbortController();
      // Allow time for the deployed API to wake on native cold starts.
      const timeoutId = window.setTimeout(() => controller.abort(), 60_000);
      try {
        let body: Record<string, string>;

        if (replitUser) {
          const nameFromEmail = replitUser.email?.split('@')[0];
          const fullName = replitUser.firstName && replitUser.lastName
            ? `${replitUser.firstName} ${replitUser.lastName}`
            : replitUser.firstName ?? null;
          const displayName = fullName || nameFromEmail || 'Player';
          body = {
            replitUserId: replitUser.id,
            username: displayName,
            ...(replitUser.profileImageUrl ? { avatar: replitUser.profileImageUrl } : {}),
          };
        } else {
          body = { deviceId: getOrCreateDeviceId() };
        }

        const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
        const url = apiUrl(`${basePath}/api/profiles/sync`);
        console.log('[Auth] Syncing profile to:', url, 'with body:', body);
        const isCrossOrigin = url.startsWith('http');
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: isCrossOrigin ? 'omit' : 'include',
          signal: controller.signal,
        });

        console.log('[Auth] Sync response status:', res.status);
        if (res.ok) {
          const profile = await res.json();
          console.log('[Auth] Profile synced:', profile);
          setProfileId(profile.id);
          onProfileSynced?.(profile.id);
        } else {
          console.error('[Auth] Sync failed:', res.status, res.statusText);
        }
      } catch (err) {
        console.error('[Auth] Sync error:', err);
        // Network error — keep whatever profileId is already cached
      } finally {
        window.clearTimeout(timeoutId);
        setIsReady(true);
      }
    };

    syncProfile();
  }, [isLoaded, replitUser]);

  return (
    <AuthContext.Provider value={{ profileId, isReady, replitUser, isSignedIn: !!replitUser, setProfileId, restoreGuestProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
