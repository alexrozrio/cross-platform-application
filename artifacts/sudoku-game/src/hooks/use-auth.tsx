import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
}

const AuthContext = createContext<AuthContextType>({
  profileId: null,
  isReady: false,
  replitUser: null,
  isSignedIn: false,
  setProfileId: () => {},
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

  useEffect(() => {
    fetch('/api/auth/user', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) return null;
        if (!res.ok) return null;
        return res.json() as Promise<ReplitUser>;
      })
      .then((user) => {
        setReplitUser(user);
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
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
  }, [isLoaded, replitUser]);

  return (
    <AuthContext.Provider value={{ profileId, isReady, replitUser, isSignedIn: !!replitUser, setProfileId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
