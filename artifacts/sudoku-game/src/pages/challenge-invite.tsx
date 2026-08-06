import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Swords,
  Brain,
  Grid2x2,
  Copy,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  LogIn,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { getLevelFromXp } from "@/lib/levels";
import { apiUrl } from "@/lib/api-base-url";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InviteInfo {
  type: "sudoku" | "memory";
  id: number;
  status: "pending" | "accepted" | "declined" | "completed";
  shareToken: string | null;
  challengerId: number;
  challengedId: number | null;
  challengerUsername: string;
  challengerAvatar: string | null;
  challengerXp: number;
  challengedUsername: string | null;
  difficulty?: string;
  gridSize: number;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFF_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  hard: "bg-orange-100 text-orange-700 border-orange-200",
  expert: "bg-red-100 text-red-700 border-red-200",
};

const MEMORY_LABELS: Record<number, string> = {
  2: "2×4 Beginner (4 pairs)",
  4: "4×4 Easy (8 pairs)",
  6: "4×8 Medium (16 pairs)",
  8: "8×8 Hard (32 pairs)",
};

const SUDOKU_LABELS: Record<number, string> = {
  3: "3×3",
  4: "4×4",
  6: "6×6",
  9: "9×9",
  16: "16×16",
};

// ─── Share Sheet ──────────────────────────────────────────────────────────────

function ShareSheet({
  open,
  onClose,
  shareUrl,
  text,
}: {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const nativeShare = () => {
    navigator.share({ url: shareUrl, title: "Brain Games Challenge", text }).catch(() => {});
  };

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text + "\n" + shareUrl)}`;
  const telegram = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" /> Share Challenge
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          {/* Link preview */}
          <div className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 text-xs font-mono break-all text-muted-foreground">
            <ExternalLink className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span className="min-w-0 truncate">{shareUrl}</span>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border bg-[#25D366] text-white font-semibold text-sm py-2.5 hover:opacity-90 transition-opacity"
            >
              {/* WhatsApp SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>

            <a
              href={telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border bg-[#26A5E4] text-white font-semibold text-sm py-2.5 hover:opacity-90 transition-opacity"
            >
              {/* Telegram SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Telegram
            </a>

            {canNativeShare && (
              <Button
                variant="outline"
                className="col-span-2 gap-2"
                onClick={nativeShare}
              >
                <Share2 className="w-4 h-4" />
                Share via…
              </Button>
            )}

            <Button
              variant="outline"
              className={`${canNativeShare ? "" : "col-span-2"} gap-2`}
              onClick={copy}
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            Anyone with this link can accept your challenge and play against you.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ src, name, size = 16 }: { src: string | null; name: string; size?: number }) {
  const s = `w-${size} h-${size}`;
  if (src)
    return <img src={src} alt={name} className={`${s} rounded-full object-cover ring-2 ring-border`} />;
  return (
    <div className={`${s} rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border`}>
      <span className="text-primary font-bold text-lg">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChallengeInvitePage({ token }: { token: string }) {
  const { profileId, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [showShare, setShowShare] = useState(false);
  const [declined, setDeclined] = useState(false);

  const { data: invite, isLoading, error } = useQuery<InviteInfo>({
    queryKey: ["invite", token],
    queryFn: () => customFetch<InviteInfo>(`/api/invite/${token}`),
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () =>
      customFetch<{ type: string; gameId: number; gridSize?: number }>(`/api/invite/${token}/accept`, {
        method: "POST",
        data: { profileId },
      }),
    onSuccess: (result) => {
      toast.success("Challenge accepted! Good luck! 🎮");
      if (result.type === "sudoku") {
        setLocation(`/game/${result.gameId}`);
      } else {
        setLocation(`/memory?duelGameId=${result.gameId}&gridSize=${result.gridSize ?? 4}`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to accept challenge");
    },
  });

  const declineMutation = useMutation({
    mutationFn: () =>
      customFetch(`/api/invite/${token}/decline`, {
        method: "POST",
        data: { profileId },
      }),
    onSuccess: () => {
      setDeclined(true);
      toast("Challenge declined.");
    },
    onError: () => toast.error("Failed to decline challenge"),
  });

  const isMyChallenge = invite?.challengerId === profileId;
  const isTargeted = invite?.challengedId !== null && invite?.challengedId !== profileId;
  const shareUrl = `${window.location.origin}/invite/${token}`;

  const shareText = invite
    ? invite.type === "sudoku"
      ? `${invite.challengerUsername} challenges you to a ${invite.difficulty} ${SUDOKU_LABELS[invite.gridSize] ?? invite.gridSize} Sudoku! Beat their score to win gems 💎`
      : `${invite.challengerUsername} challenges you to a Memory Match (${MEMORY_LABELS[invite.gridSize] ?? invite.gridSize})! Beat their score to win gems 💎`
    : "";

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto w-full space-y-4 pt-8">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="max-w-sm mx-auto w-full pt-16 text-center space-y-4">
        <XCircle className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Challenge not found</h2>
        <p className="text-sm text-muted-foreground">
          This invite link may be invalid or has expired.
        </p>
        <Button onClick={() => setLocation("/challenges")}>View challenges</Button>
      </div>
    );
  }

  const level = getLevelFromXp(invite.challengerXp);

  return (
    <div className="max-w-sm mx-auto w-full space-y-6 pt-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800">
          <Swords className="w-3.5 h-3.5" /> Challenge Invite
        </div>
        <h1 className="text-2xl font-serif font-bold tracking-tight pt-1">
          You've been challenged!
        </h1>
      </div>

      {/* Challenge card */}
      <Card className="overflow-hidden shadow-lg border-2">
        {/* Gradient header */}
        <div
          className={`px-6 py-5 flex flex-col items-center gap-3 ${
            invite.type === "sudoku"
              ? "bg-gradient-to-br from-primary/10 to-primary/5"
              : "bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-900/10"
          }`}
        >
          <Avatar src={invite.challengerAvatar} name={invite.challengerUsername} size={16} />
          <div className="text-center">
            <p className="font-bold text-lg leading-tight">{invite.challengerUsername}</p>
            <p
              className="text-xs font-semibold mt-0.5"
              style={{ color: level.color !== "#fff" ? level.color : undefined }}
            >
              {level.name}
            </p>
          </div>

          {/* Game type + settings */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {invite.type === "sudoku" ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                  <Grid2x2 className="w-3.5 h-3.5" /> Sudoku
                </span>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium capitalize ${DIFF_COLORS[invite.difficulty ?? "medium"]}`}>
                  {invite.difficulty}
                </span>
                <span className="text-xs px-2 py-1 rounded-full border bg-muted font-medium">
                  {SUDOKU_LABELS[invite.gridSize] ?? invite.gridSize}
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200">
                  <Brain className="w-3.5 h-3.5" /> Memory Match
                </span>
                <span className="text-xs px-2 py-1 rounded-full border bg-muted font-medium">
                  {MEMORY_LABELS[invite.gridSize] ?? `${invite.gridSize}×grid`}
                </span>
              </>
            )}
          </div>
        </div>

        <CardContent className="px-5 py-4 space-y-4">
          {/* Status / action area */}
          {invite.status !== "pending" || declined ? (
            <div className="text-center py-4 space-y-2">
              {(invite.status === "accepted" || (invite.status === "pending" && !declined)) ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                  <p className="font-semibold">Challenge accepted!</p>
                  <p className="text-xs text-muted-foreground">Head to your challenges to play.</p>
                  <Button size="sm" onClick={() => setLocation("/challenges")}>
                    View challenges
                  </Button>
                </>
              ) : invite.status === "declined" || declined ? (
                <>
                  <XCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="font-semibold text-muted-foreground">Challenge declined</p>
                </>
              ) : invite.status === "completed" ? (
                <>
                  <CheckCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="font-semibold">Challenge completed</p>
                  <Button size="sm" onClick={() => setLocation("/challenges")}>
                    View result
                  </Button>
                </>
              ) : null}
            </div>
          ) : !isSignedIn ? (
            /* Not signed in */
            <div className="text-center space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Sign in to accept this challenge and play!
              </p>
              <Button
                className="w-full gap-2"
                onClick={() => {
                  const from = encodeURIComponent(window.location.href);
                  window.location.href = apiUrl(`/api/login?from=${from}`);
                }}
              >
                <LogIn className="w-4 h-4" /> Sign in to accept
              </Button>
            </div>
          ) : isMyChallenge ? (
            /* Own challenge */
            <div className="text-center space-y-3 py-2">
              <p className="text-sm text-muted-foreground">This is your own challenge.</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowShare(true)}>
                <Share2 className="w-4 h-4" /> Share this challenge
              </Button>
            </div>
          ) : isTargeted ? (
            /* Specific user challenge, wrong user */
            <div className="text-center space-y-2 py-2">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="font-semibold">This challenge was sent to {invite.challengedUsername}</p>
              <p className="text-xs text-muted-foreground">You're not the intended recipient.</p>
            </div>
          ) : (
            /* Open challenge, signed-in user can accept */
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Beat <strong>{invite.challengerUsername}</strong>'s score to win <strong>10 gems 💎</strong>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => declineMutation.mutate()}
                  disabled={declineMutation.isPending || acceptMutation.isPending}
                >
                  Decline
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => acceptMutation.mutate()}
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                >
                  {acceptMutation.isPending ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Swords className="w-4 h-4" />
                  )}
                  Accept & Play
                </Button>
              </div>
            </div>
          )}

          {/* Share button (always visible for non-declined/completed) */}
          {invite.status === "pending" && !declined && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-muted-foreground text-xs"
              onClick={() => setShowShare(true)}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share this challenge link
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Badge row */}
      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <Badge variant="outline" className="gap-1 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40">
          🏆 Winner gets 10 gems
        </Badge>
        <Badge variant="outline" className="gap-1 bg-card">
          ⚡ Score more points to win
        </Badge>
      </div>

      <ShareSheet
        open={showShare}
        onClose={() => setShowShare(false)}
        shareUrl={shareUrl}
        text={shareText}
      />
    </div>
  );
}
