import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Share2, Check, Copy, X } from "lucide-react";
import { type AchievementMeta } from "@/lib/achievement-utils";

// ─── Social platform definitions ──────────────────────────────────────────────

const PLATFORMS = [
  {
    id: "twitter",
    label: "X / Twitter",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      </svg>
    ),
    color: "hover:bg-black hover:text-white",
    buildUrl: (text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
    color: "hover:bg-[#25D366] hover:text-white",
    buildUrl: (text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: "hover:bg-[#1877F2] hover:text-white",
    buildUrl: (_: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: "hover:bg-[#0A66C2] hover:text-white",
    buildUrl: (_: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

// ─── Share text builders ───────────────────────────────────────────────────────

function buildShareText(achievement: AchievementMeta, siteUrl: string): string {
  return `🏆 I have achieved "${achievement.title}" ${achievement.emoji} on Brain Games 4 All!\n${achievement.description}\n\nCome play and beat my score 👉 ${siteUrl}`;
}

function buildMultiShareText(achievements: AchievementMeta[], siteUrl: string): string {
  const list = achievements.map((a) => `  ${a.emoji} ${a.title}`).join("\n");
  return `🏆 I just unlocked ${achievements.length} achievements on Brain Games 4 All!\n${list}\n\nCome play and beat my score 👉 ${siteUrl}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ShareAchievementButtonProps {
  /** Single achievement to share */
  achievement?: AchievementMeta;
  /** Multiple achievements — uses a combined message */
  achievements?: AchievementMeta[];
  variant?: "icon" | "full";
  /** Custom label for the full-variant button */
  label?: string;
  /** If provided, the share URL points to the public profile page */
  profileId?: number;
}

export function ShareAchievementButton({
  achievement,
  achievements,
  variant = "icon",
  label,
  profileId,
}: ShareAchievementButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  // Deep-link to the sharer's public profile when profileId is available
  const siteUrl = profileId ? `${origin}/players/${profileId}` : origin;

  // Build the share text — multi takes priority
  const shareText = achievements && achievements.length > 1
    ? buildMultiShareText(achievements, siteUrl)
    : buildShareText((achievement ?? achievements![0])!, siteUrl);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === "full" ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl h-10 w-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="w-4 h-4" />
            {label ?? "Share Achievement"}
          </Button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(true); }}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center bg-background/80 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-background transition-all shadow-sm"
            title="Share achievement"
          >
            <Share2 className="w-3 h-3" />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        className="w-52 p-2 rounded-xl shadow-lg"
        align="end"
        sideOffset={6}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 pb-1.5">
          Share on
        </p>
        <div className="space-y-0.5">
          {PLATFORMS.map((p) => (
            <a
              key={p.id}
              href={p.buildUrl(shareText, siteUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={[
                "flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 text-sm font-medium transition-colors text-foreground",
                p.color,
              ].join(" ")}
            >
              {p.icon}
              {p.label}
            </a>
          ))}

          <div className="border-t border-border/50 my-1" />

          <button
            onClick={handleCopy}
            className="flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted text-foreground"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy message"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
