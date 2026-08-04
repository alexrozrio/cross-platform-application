import React from "react";
import { toast } from "sonner";
import { Copy, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BadgeShareSheetProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  badgeTitle: string;
  username: string;
  points: number;
  period: string;
}

function buildText(
  badgeTitle: string,
  username: string,
  points: number,
  period: string
) {
  return `🏆 ${username} earned the "${badgeTitle}" badge in Brain Games 4 All!\n${period} · ${points.toLocaleString()} pts\nThink you can beat that?`;
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

export function BadgeShareSheet({
  open,
  onClose,
  shareUrl,
  badgeTitle,
  username,
  points,
  period,
}: BadgeShareSheetProps) {
  const text = buildText(badgeTitle, username, points, period);

  const platforms = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      bg: "bg-[#25D366] hover:bg-[#1ebe5d]",
      icon: <WhatsAppIcon />,
      href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      bg: "bg-[#1877F2] hover:bg-[#1469d6]",
      icon: <FacebookIcon />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: "twitter",
      label: "X (Twitter)",
      bg: "bg-zinc-900 hover:bg-zinc-700",
      icon: <TwitterIcon />,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: "telegram",
      label: "Telegram",
      bg: "bg-[#26A5E4] hover:bg-[#1d96d4]",
      icon: <TelegramIcon />,
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
    },
  ];

  const handleOpen = (href: string) =>
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not copy — try manually selecting the URL");
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: `${badgeTitle} — Brain Games 4 All`, text, url: shareUrl });
    } catch {
      // user cancelled or not supported
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      {/* Use Dialog's natural p-6 gap-4 — do NOT override with p-0/overflow-hidden */}
      <DialogContent className="sm:max-w-md mx-2 sm:mx-auto w-[calc(100%-1rem)] sm:w-full rounded-lg">
        <DialogHeader>
          <DialogTitle>Share your badge</DialogTitle>
          <DialogDescription className="sr-only">
            Share your tournament badge with friends on social media or copy the link.
          </DialogDescription>
        </DialogHeader>

        {/* Preview blurb */}
        <div className="rounded-lg bg-muted/60 border border-border/40 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-foreground/80">
          {text}
        </div>

        {/* Platform grid — 2 columns, each button full-width within its cell */}
        <div className="grid grid-cols-2 gap-2">
          {platforms.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleOpen(p.href)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-white text-sm font-medium transition-colors active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-primary ${p.bg}`}
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Copy link */}
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 overflow-hidden">
          <span
            className="block flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground font-mono"
            title={shareUrl}
          >
            {shareUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium text-foreground/70 hover:text-foreground transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-primary rounded"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
        </div>

        {/* Native share — mobile/supported browsers only */}
        {hasNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border text-sm font-medium text-foreground/80 hover:bg-muted/60 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share via device
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
