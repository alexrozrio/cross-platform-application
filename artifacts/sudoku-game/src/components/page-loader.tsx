import { Loader2 } from "lucide-react";

// Lightweight fallback shown while a lazy-loaded page chunk is fetched.
// Kept intentionally minimal so it never becomes its own bottleneck.
export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}
