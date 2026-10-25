import { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

const AVATAR_CACHE_KEY = "play-brain-games.cached-avatar.v1";
const MAX_CACHED_AVATAR_BYTES = 256 * 1024;

interface CachedAvatarEntry {
  url: string;
  dataUrl: string;
}

const avatarRequests = new Map<string, Promise<string | null>>();

function readCachedAvatar(url: string | null | undefined): string | null {
  if (!url || typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AVATAR_CACHE_KEY);
    if (!raw) return null;

    const entry = JSON.parse(raw) as Partial<CachedAvatarEntry>;
    return entry.url === url &&
      typeof entry.dataUrl === "string" &&
      entry.dataUrl.startsWith("data:image/")
      ? entry.dataUrl
      : null;
  } catch {
    return null;
  }
}

function removeCachedAvatar(url: string) {
  try {
    const raw = window.localStorage.getItem(AVATAR_CACHE_KEY);
    if (!raw) return;

    const entry = JSON.parse(raw) as Partial<CachedAvatarEntry>;
    if (entry.url === url) {
      window.localStorage.removeItem(AVATAR_CACHE_KEY);
    }
  } catch {
    try {
      window.localStorage.removeItem(AVATAR_CACHE_KEY);
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read the profile image."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the profile image."));
    reader.readAsDataURL(blob);
  });
}

function cacheRemoteAvatar(url: string): Promise<string | null> {
  const pending = avatarRequests.get(url);
  if (pending) return pending;

  const request = fetch(url, { mode: "cors", credentials: "omit" })
    .then(async (response) => {
      if (!response.ok) return null;

      const blob = await response.blob();
      if (!blob.type.toLowerCase().startsWith("image/") || blob.size > MAX_CACHED_AVATAR_BYTES) {
        return null;
      }

      return blobToDataUrl(blob);
    })
    .then((dataUrl) => {
      if (!dataUrl) return null;

      try {
        window.localStorage.setItem(
          AVATAR_CACHE_KEY,
          JSON.stringify({ url, dataUrl } satisfies CachedAvatarEntry),
        );
      } catch {
        // Keep displaying the in-memory image even if storage is full or disabled.
      }

      return dataUrl;
    })
    .catch(() => null)
    .finally(() => {
      avatarRequests.delete(url);
    });

  avatarRequests.set(url, request);
  return request;
}

interface CachedAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

export function CachedAvatar({ src, alt = "", className }: CachedAvatarProps) {
  const storedImage = useMemo(() => readCachedAvatar(src), [src]);
  const [downloadedImage, setDownloadedImage] = useState<CachedAvatarEntry | null>(null);
  const [unusableCacheUrl, setUnusableCacheUrl] = useState<string | null>(null);
  const [failedRemoteUrl, setFailedRemoteUrl] = useState<string | null>(null);

  const cachedImage = downloadedImage && downloadedImage.url === src
    ? downloadedImage.dataUrl
    : unusableCacheUrl === src
      ? null
      : storedImage;
  const imageSrc = cachedImage ?? (src && failedRemoteUrl !== src ? src : null);

  useEffect(() => {
    if (!src) return;

    let active = true;
    void cacheRemoteAvatar(src).then((dataUrl) => {
      if (!active || !dataUrl) return;
      setDownloadedImage({ url: src, dataUrl });
      setFailedRemoteUrl((current) => current === src ? null : current);
    });

    return () => {
      active = false;
    };
  }, [src]);

  if (!imageSrc) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground",
          className,
        )}
      >
        <User className="h-3/5 w-3/5" />
      </span>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (!src) return;
        if (cachedImage) {
          removeCachedAvatar(src);
          setUnusableCacheUrl(src);
          setDownloadedImage((current) => current?.url === src ? null : current);
        } else {
          setFailedRemoteUrl(src);
        }
      }}
    />
  );
}
