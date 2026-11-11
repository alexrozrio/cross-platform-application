import React, { useState, useCallback, useEffect } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch, useGetProfile } from "@workspace/api-client-react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Swords, Trophy, Clock, Search, Gem, CircleCheck as CheckCircle2, Circle as XCircle, Loader as Loader2, ChevronRight, Crown, Minus, Brain, Grid2x2, Puzzle, Zap, RotateCcw, Share2, Copy, Check, ExternalLink, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { showEventModal } from "@/hooks/use-event-modal";
import { LevelBadge } from "@/components/level-badge";
import { usePageMeta } from "@/components/page-meta";
import { MobileContentDisclosure } from "@/components/mobile-content-disclosure";
import { shareOrDownloadShareCard } from "@/lib/share-card";
import { ShareCardPreview } from "@/components/share-card-preview";
import { challengeInviteUrl } from "@/lib/app-links";
import { WORD_SEARCH_LEVELS, WORD_SEARCH_THEMES, type WordSearchDifficulty, type WordSearchTheme } from "@/lib/word-search";

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard" | "expert";
type SudokuGridSize = 3 | 4 | 6 | 9 | 16;
type MemoryGridSize = 2 | 4 | 6 | 8;
type JigsawGridSize = 2 | 3 | 4 | 5;
type JigsawLevel = 1 | 2 | 3;
type ChallengeStatus = "pending" | "accepted" | "declined" | "completed" | "expired";
type GameType = "sudoku" | "memory" | "jigsaw" | "word-search";

interface ChallengeDetail {
  id: number;
  challengerId: number;
  challengedId: number;
  puzzleId: number;
  status: ChallengeStatus;
  challengerGameId: number | null;
  challengedGameId: number | null;
  winnerId: number | null;
  challengerUsername: string;
  challengedUsername: string;
  challengerAvatar: string | null;
  challengedAvatar: string | null;
  challengerXp: number;
  challengedXp: number;
  challengerPoints: number | null;
  challengedPoints: number | null;
  difficulty: Difficulty;
  gridSize: number;
  shareToken: string | null;
  createdAt: string;
}

interface MemoryDuelDetail {
  id: number;
  gameType: "memory";
  challengerId: number;
  challengedId: number;
  gridSize: number;
  status: ChallengeStatus;
  challengerGameId: number | null;
  challengedGameId: number | null;
  winnerId: number | null;
  challengerUsername: string;
  challengedUsername: string;
  challengerAvatar: string | null;
  challengedAvatar: string | null;
  challengerXp: number;
  challengedXp: number;
  challengerPoints: number | null;
  challengedPoints: number | null;
  shareToken: string | null;
  createdAt: string;
}

interface JigsawChallengeDetail {
  id: number;
  gameType: "jigsaw";
  challengerId: number;
  challengedId: number | null;
  gridSize: JigsawGridSize;
  level: JigsawLevel;
  imageKey: number;
  status: ChallengeStatus;
  challengerGameId: number | null;
  challengedGameId: number | null;
  winnerId: number | null;
  challengerUsername: string;
  challengedUsername: string | null;
  challengerAvatar: string | null;
  challengedAvatar: string | null;
  challengerXp: number;
  challengedXp: number;
  challengerPoints: number | null;
  challengedPoints: number | null;
  shareToken: string | null;
  createdAt: string;
}

interface WordSearchChallengeDetail {
  id: number; challengerId: number; challengedId: number; difficulty: WordSearchDifficulty; theme: WordSearchTheme; seed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null; createdAt: string; gameId?: number;
}

interface ProfileSummary {
  id: number;
  username: string;
  avatar: string | null;
  gems: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  hard: "bg-orange-100 text-orange-700 border-orange-200",
  expert: "bg-red-100 text-red-700 border-red-200",
};

const SUDOKU_GRID_LABELS: Record<number, string> = {
  3: "3×3",
  4: "4×4",
  6: "6×6",
  9: "9×9",
  16: "16×16",
};

const MEMORY_GRID_LABELS: Record<number, string> = {
  2: "2×4 Beginner",
  4: "4×4 Easy",
  6: "8×4 Medium",
  8: "8×8 Hard",
};

const JIGSAW_GRID_LABELS: Record<number, string> = {
  2: "2×2",
  3: "3×3",
  4: "4×4",
  5: "5×5",
};

const JIGSAW_LEVEL_LABELS: Record<number, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Avatar({
  src,
  name,
  size = 8,
}: {
  src: string | null;
  name: string;
  size?: number;
}) {
  const s = `w-${size} h-${size}`;
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${s} rounded-full object-cover ring-2 ring-border shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${s} rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-border`}
    >
      <span className="text-primary font-bold text-xs">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

// ─── Challenge Share Sheet ────────────────────────────────────────────────────

function ChallengeShareSheet({
  open,
  onClose,
  shareToken,
  label,
}: {
  open: boolean;
  onClose: () => void;
  shareToken: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = challengeInviteUrl(shareToken, Capacitor.isNativePlatform());
  const text = `${label} — click to accept and play!`;
  const shareCard = {
    title: "Challenge invitation",
    lines: [label, "Can you beat me?", "Tap the link to accept and play."],
    shareText: `${text}\n${shareUrl}`,
    shareUrl,
    accent: "#8b7cf6",
    filename: "brain-games-challenge.png",
  };
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text + "\n" + shareUrl)}`;
  const telegram = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const copy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const nativeShare = () => {
    void shareImage();
  };

  const shareImage = async () => {
    try {
      const result = await shareOrDownloadShareCard(shareCard);
      if (result === "downloaded") {
        toast.success("Challenge image downloaded — attach it to your message!", { duration: 3000 });
      }
    } catch {
      toast.error("Could not create the challenge image");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[calc(100vw-1rem)] max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain p-4 sm:max-w-sm sm:p-6">
        <DialogHeader className="pr-10">
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" /> Share Challenge
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="challenge-share-card-preview">
            <ShareCardPreview data={shareCard} />
          </div>
          {/* Link preview */}
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs font-mono break-all text-muted-foreground">
            <LinkIcon className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span className="min-w-0 break-all">{shareUrl}</span>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border bg-[#25D366] text-white font-semibold text-sm py-2.5 hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
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
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Telegram
            </a>
            {canNativeShare && (
              <Button variant="outline" className="col-span-2 gap-2" onClick={nativeShare}>
                <ExternalLink className="w-4 h-4" />
                More options…
              </Button>
            )}
            <Button variant="default" className="col-span-2 gap-2" onClick={shareImage}>
              <Share2 className="w-4 h-4" />
              Share as image
            </Button>
            <p className="col-span-2 text-[11px] text-muted-foreground text-center">
              Share as image uses the device share sheet when available, or downloads a PNG for attaching manually.
            </p>
            <Button
              variant="outline"
              className={`${canNativeShare ? "" : "col-span-2"} gap-2 challenge-share-copy-button`}
              onClick={copy}
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            Anyone can accept an open challenge link. A challenge sent to a specific player can only be accepted by that player. Unaccepted challenges expire after 7 days.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }: { status: ChallengeStatus }) {
  if (status === "pending")
    return (
      <Badge
        variant="outline"
        className="text-yellow-600 border-yellow-300 bg-yellow-50 text-xs"
      >
        Pending
      </Badge>
    );
  if (status === "accepted")
    return (
      <Badge
        variant="outline"
        className="text-blue-600 border-blue-300 bg-blue-50 text-xs"
      >
        In Progress
      </Badge>
    );
  if (status === "declined")
    return (
      <Badge
        variant="outline"
        className="text-slate-500 border-slate-300 bg-slate-50 text-xs"
      >
        Declined
      </Badge>
    );
  if (status === "expired")
    return (
      <Badge
        variant="outline"
        className="text-slate-500 border-slate-300 bg-slate-50 text-xs"
      >
        Expired
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="text-green-600 border-green-300 bg-green-50 text-xs"
    >
      Completed
    </Badge>
  );
}

// ─── Sudoku ChallengeCard ─────────────────────────────────────────────────────

function ChallengeCard({
  challenge,
  myProfileId,
  onAccept,
  onDecline,
  onPlay,
  onRematch,
  onShare,
  isResponding,
}: {
  challenge: ChallengeDetail;
  myProfileId: number;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  onPlay: (gameId: number) => void;
  onRematch?: (c: ChallengeDetail) => void;
  onShare?: (token: string, label: string) => void;
  isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger
    ? challenge.challengedUsername
    : challenge.challengerUsername;
  const opponentAvatar = isChallenger
    ? challenge.challengedAvatar
    : challenge.challengerAvatar;
  const opponentXp = isChallenger
    ? (challenge.challengedXp ?? 0)
    : (challenge.challengerXp ?? 0);
  const myPoints = isChallenger
    ? challenge.challengerPoints
    : challenge.challengedPoints;
  const theirPoints = isChallenger
    ? challenge.challengedPoints
    : challenge.challengerPoints;
  const myGameId = isChallenger
    ? challenge.challengerGameId
    : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={opponentAvatar} name={opponent} size={10} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{opponent}</p>
                <LevelBadge xp={opponentXp} size="xs" />
                {challenge.status === "completed" && (
                  <span
                    className={`text-xs font-bold flex items-center gap-1 ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}
                  >
                    {isWinner ? (
                      <>
                        <Crown className="w-3 h-3" /> Won +10 💎
                      </>
                    ) : isTie ? (
                      <>
                        <Minus className="w-3 h-3" /> Tie
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Lost
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize ${DIFF_COLORS[challenge.difficulty]}`}
                >
                  {challenge.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">
                  {SUDOKU_GRID_LABELS[challenge.gridSize]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(challenge.createdAt)}
                </span>
                {isChallenger ? (
                  <span className="text-[10px] text-muted-foreground italic">
                    You challenged
                  </span>
                ) : (
                  <span className="text-[10px] text-blue-600 font-medium">
                    Challenged you
                  </span>
                )}
              </div>

              {(challenge.status === "accepted" ||
                challenge.status === "completed" ||
                (challenge.status === "pending" && myPoints != null)) && (
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-muted-foreground">
                    You:{" "}
                    <span className="font-bold text-foreground">
                      {myPoints != null ? myPoints.toLocaleString() : "—"}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Them:{" "}
                    <span className="font-bold text-foreground">
                      {theirPoints != null ? theirPoints.toLocaleString() : "—"}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={challenge.status} />
            {challenge.status === "pending" && !isChallenger && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onDecline(challenge.id)}
                  disabled={isResponding}
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onAccept(challenge.id)}
                  disabled={isResponding}
                >
                  Accept
                </Button>
              </div>
            )}
            {challenge.status === "accepted" && myGameId && (
              <Button
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => onPlay(myGameId)}
              >
                {myPoints != null ? "View" : "Play"}{" "}
                <ChevronRight className="w-3 h-3" />
              </Button>
            )}
            {challenge.status === "pending" && isChallenger && myGameId && (
              myPoints != null ? (
                <div className="flex flex-col items-end gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => onPlay(myGameId)}
                  >
                    View <ChevronRight className="w-3 h-3" />
                  </Button>
                  <span className="text-[10px] text-muted-foreground italic">Waiting for opponent</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => onPlay(myGameId)}
                >
                  Play now <ChevronRight className="w-3 h-3" />
                </Button>
              )
            )}
            {challenge.status === "pending" && isChallenger && challenge.shareToken && onShare && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-primary"
                onClick={() => onShare(challenge.shareToken!, `I challenge you to a ${challenge.difficulty} Sudoku`)}
              >
                <Share2 className="w-3 h-3" /> Share
              </Button>
            )}
            {challenge.status === "completed" && onRematch && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => onRematch(challenge)}
              >
                <RotateCcw className="w-3 h-3" /> Rematch
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Memory DuelCard ──────────────────────────────────────────────────────────

function MemoryDuelCard({
  duel,
  myProfileId,
  onAccept,
  onDecline,
  onPlay,
  onRematch,
  onShare,
  isResponding,
}: {
  duel: MemoryDuelDetail;
  myProfileId: number;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  onPlay: (duel: MemoryDuelDetail) => void;
  onRematch?: (d: MemoryDuelDetail) => void;
  onShare?: (token: string, label: string) => void;
  isResponding: boolean;
}) {
  const isChallenger = duel.challengerId === myProfileId;
  const opponent = isChallenger
    ? duel.challengedUsername
    : duel.challengerUsername;
  const opponentAvatar = isChallenger
    ? duel.challengedAvatar
    : duel.challengerAvatar;
  const opponentXp = isChallenger
    ? (duel.challengedXp ?? 0)
    : (duel.challengerXp ?? 0);
  const myPoints = isChallenger ? duel.challengerPoints : duel.challengedPoints;
  const theirPoints = isChallenger
    ? duel.challengedPoints
    : duel.challengerPoints;
  const myGameId = isChallenger ? duel.challengerGameId : duel.challengedGameId;
  const isWinner = duel.winnerId === myProfileId;
  const isTie = duel.status === "completed" && duel.winnerId === null;
  const hasPlayed = myPoints != null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={opponentAvatar} name={opponent} size={10} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{opponent}</p>
                <LevelBadge xp={opponentXp} size="xs" />
                {duel.status === "completed" && (
                  <span
                    className={`text-xs font-bold flex items-center gap-1 ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}
                  >
                    {isWinner ? (
                      <>
                        <Crown className="w-3 h-3" /> Won +10 💎
                      </>
                    ) : isTie ? (
                      <>
                        <Minus className="w-3 h-3" /> Tie
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Lost
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium bg-violet-100 text-violet-700 border-violet-200">
                  Memory Match
                </span>
                <span className="text-xs text-muted-foreground">
                  {MEMORY_GRID_LABELS[duel.gridSize] ?? `${duel.gridSize}×grid`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(duel.createdAt)}
                </span>
                {isChallenger ? (
                  <span className="text-[10px] text-muted-foreground italic">
                    You challenged
                  </span>
                ) : (
                  <span className="text-[10px] text-blue-600 font-medium">
                    Challenged you
                  </span>
                )}
              </div>

              {(duel.status === "accepted" ||
                duel.status === "completed" ||
                (duel.status === "pending" && myPoints != null)) && (
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-muted-foreground">
                    You:{" "}
                    <span className="font-bold text-foreground">
                      {myPoints != null ? myPoints.toLocaleString() : "—"}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Them:{" "}
                    <span className="font-bold text-foreground">
                      {theirPoints != null ? theirPoints.toLocaleString() : "—"}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={duel.status} />
            {duel.status === "pending" && !isChallenger && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onDecline(duel.id)}
                  disabled={isResponding}
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onAccept(duel.id)}
                  disabled={isResponding}
                >
                  Accept
                </Button>
              </div>
            )}
            {duel.status === "accepted" && myGameId && (
              <Button
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => onPlay(duel)}
              >
                {hasPlayed ? "Done ✓" : "Play"}{" "}
                <ChevronRight className="w-3 h-3" />
              </Button>
            )}
            {duel.status === "pending" && isChallenger && myGameId && (
              hasPlayed ? (
                <div className="flex flex-col items-end gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => onPlay(duel)}
                  >
                    View <ChevronRight className="w-3 h-3" />
                  </Button>
                  <span className="text-[10px] text-muted-foreground italic">Waiting for opponent</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => onPlay(duel)}
                >
                  Play now <ChevronRight className="w-3 h-3" />
                </Button>
              )
            )}
            {duel.status === "pending" && isChallenger && duel.shareToken && onShare && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-violet-600"
                onClick={() => onShare(duel.shareToken!, `I challenge you to a Memory Match (${MEMORY_GRID_LABELS[duel.gridSize] ?? ""})`)}
              >
                <Share2 className="w-3 h-3" /> Share
              </Button>
            )}
            {duel.status === "completed" && onRematch && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => onRematch(duel)}
              >
                <RotateCcw className="w-3 h-3" /> Rematch
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Jigsaw ChallengeCard ───────────────────────────────────────────────────────

function JigsawChallengeCard({
  challenge,
  myProfileId,
  onAccept,
  onDecline,
  onPlay,
  onRematch,
  onShare,
  isResponding,
}: {
  challenge: JigsawChallengeDetail;
  myProfileId: number;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  onPlay: (challenge: JigsawChallengeDetail) => void;
  onRematch?: (c: JigsawChallengeDetail) => void;
  onShare?: (token: string, label: string) => void;
  isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger
    ? challenge.challengedUsername ?? "A friend"
    : challenge.challengerUsername;
  const opponentAvatar = isChallenger
    ? challenge.challengedAvatar
    : challenge.challengerAvatar;
  const opponentXp = isChallenger
    ? (challenge.challengedXp ?? 0)
    : (challenge.challengerXp ?? 0);
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const theirPoints = isChallenger
    ? challenge.challengedPoints
    : challenge.challengerPoints;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const hasPlayed = myPoints != null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={opponentAvatar} name={opponent} size={10} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{opponent}</p>
                <LevelBadge xp={opponentXp} size="xs" />
                {challenge.status === "completed" && (
                  <span
                    className={`text-xs font-bold flex items-center gap-1 ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}
                  >
                    {isWinner ? (
                      <>
                        <Crown className="w-3 h-3" /> Won +10 💎
                      </>
                    ) : isTie ? (
                      <>
                        <Minus className="w-3 h-3" /> Tie
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Lost
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium bg-amber-100 text-amber-700 border-amber-200">
                  Jigsaw
                </span>
                <span className="text-xs text-muted-foreground">
                  {JIGSAW_GRID_LABELS[challenge.gridSize] ?? `${challenge.gridSize}×${challenge.gridSize}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  Level {challenge.level}
                </span>
                <span className="text-xs text-muted-foreground">
                  Picture #{challenge.imageKey}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(challenge.createdAt)}
                </span>
                {isChallenger ? (
                  <span className="text-[10px] text-muted-foreground italic">
                    You challenged
                  </span>
                ) : (
                  <span className="text-[10px] text-blue-600 font-medium">
                    Challenged you
                  </span>
                )}
              </div>

              {(challenge.status === "accepted" ||
                challenge.status === "completed" ||
                (challenge.status === "pending" && myPoints != null)) && (
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-muted-foreground">
                    You:{" "}
                    <span className="font-bold text-foreground">
                      {myPoints != null ? myPoints.toLocaleString() : "—"}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Them:{" "}
                    <span className="font-bold text-foreground">
                      {theirPoints != null ? theirPoints.toLocaleString() : "—"}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={challenge.status} />
            {challenge.status === "pending" && !isChallenger && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onDecline(challenge.id)}
                  disabled={isResponding}
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onAccept(challenge.id)}
                  disabled={isResponding}
                >
                  Accept
                </Button>
              </div>
            )}
            {challenge.status === "accepted" && myGameId && (
              <Button
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => onPlay(challenge)}
              >
                {hasPlayed ? "Done ✓" : "Play"}{" "}
                <ChevronRight className="w-3 h-3" />
              </Button>
            )}
            {challenge.status === "pending" && isChallenger && myGameId && (
              hasPlayed ? (
                <div className="flex flex-col items-end gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => onPlay(challenge)}
                  >
                    View <ChevronRight className="w-3 h-3" />
                  </Button>
                  <span className="text-[10px] text-muted-foreground italic">Waiting for opponent</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => onPlay(challenge)}
                >
                  Play now <ChevronRight className="w-3 h-3" />
                </Button>
              )
            )}
            {challenge.status === "pending" && isChallenger && challenge.shareToken && onShare && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-amber-600"
                onClick={() => onShare(challenge.shareToken!, `I challenge you to a Jigsaw puzzle (${JIGSAW_GRID_LABELS[challenge.gridSize] ?? ""})`)}
              >
                <Share2 className="w-3 h-3" /> Share
              </Button>
            )}
            {challenge.status === "completed" && onRematch && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => onRematch(challenge)}
              >
                <RotateCcw className="w-3 h-3" /> Rematch
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── NewChallengeDialog ───────────────────────────────────────────────────────

function WordSearchChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, isResponding }: {
  challenge: WordSearchChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: WordSearchChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const theme = WORD_SEARCH_THEMES.find((item) => item.id === challenge.theme);
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  return <Card className="hover:shadow-md transition-shadow border-violet-200/70 dark:border-violet-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-violet-200 bg-violet-100 text-violet-700">Word Search</Badge><span className="text-xs capitalize text-muted-foreground">{WORD_SEARCH_LEVELS[challenge.difficulty].label} · {theme?.emoji} {theme?.label}</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}</div>
  </div></CardContent></Card>;
}

interface RematchData {
  opponent: ProfileSummary;
  gameType: GameType;
  difficulty?: Difficulty;
  sudokuGridSize?: SudokuGridSize;
  memoryGridSize?: MemoryGridSize;
  jigsawGridSize?: JigsawGridSize;
  jigsawLevel?: JigsawLevel;
  wordSearchDifficulty?: WordSearchDifficulty;
  wordSearchTheme?: WordSearchTheme;
}

type GameMode = 'children' | 'adult' | '4all';

const SUDOKU_SIZE_OPTIONS: { value: SudokuGridSize; label: string }[] = [
  { value: 3,  label: '3×3 Baby' },
  { value: 4,  label: '4×4 Mini' },
  { value: 6,  label: '6×6 Dual' },
  { value: 9,  label: '9×9 Classic' },
  { value: 16, label: '16×16 Pro' },
];

const MEMORY_SIZE_OPTIONS: { value: MemoryGridSize; label: string }[] = [
  { value: 2, label: '2×4 Beginner · 4 pairs' },
  { value: 4, label: '4×4 Easy · 8 pairs' },
  { value: 6, label: '8×4 Medium · 16 pairs' },
  { value: 8, label: '8×8 Hard · 32 pairs' },
];

const JIGSAW_SIZE_OPTIONS: { value: JigsawGridSize; label: string }[] = [
  { value: 2, label: '2×2 Easy' },
  { value: 3, label: '3×3 Medium' },
  { value: 4, label: '4×4 Hard' },
  { value: 5, label: '5×5 Expert' },
];

const JIGSAW_LEVEL_OPTIONS: { value: JigsawLevel; label: string }[] = [
  { value: 1, label: 'Level 1' },
  { value: 2, label: 'Level 2' },
  { value: 3, label: 'Level 3' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy',   label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard',   label: 'Hard' },
  { value: 'expert', label: 'Expert' },
];

function filteredSudokuSizes(gameMode: GameMode) {
  return SUDOKU_SIZE_OPTIONS.filter(o =>
    gameMode === 'children' ? [3, 4, 6].includes(o.value) :
    gameMode === 'adult'    ? [9, 16].includes(o.value) :
    true
  );
}

function filteredMemorySizes(gameMode: GameMode) {
  return MEMORY_SIZE_OPTIONS.filter(o =>
    gameMode === 'children' ? [2, 4].includes(o.value) :
    gameMode === 'adult'    ? [6, 8].includes(o.value) :
    true
  );
}

function filteredJigsawSizes(gameMode: GameMode) {
  return JIGSAW_SIZE_OPTIONS.filter(o =>
    gameMode === 'children' ? [2, 3].includes(o.value) :
    gameMode === 'adult'    ? [4, 5].includes(o.value) :
    true
  );
}

function filteredDifficulties(_gameMode: GameMode) {
  return DIFFICULTY_OPTIONS;
}

function NewChallengeDialog({
  open,
  onClose,
  myProfileId,
  gameMode,
  initialData,
  onShareCreated,
}: {
  open: boolean;
  onClose: () => void;
  myProfileId: number;
  gameMode: GameMode;
  initialData?: RematchData;
  onShareCreated?: (data: { token: string; gameId: number; gameType: "sudoku" | "memory" | "jigsaw"; gridSize?: number }) => void;
}) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [dialogMode, setDialogMode] = useState<"player" | "open">("player");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProfileSummary | null>(null);
  const [gameType, setGameType] = useState<GameType>("sudoku");
  const sudokuSizes = filteredSudokuSizes(gameMode);
  const memorySizes = filteredMemorySizes(gameMode);
  const jigsawSizes = filteredJigsawSizes(gameMode);
  const diffs = filteredDifficulties(gameMode);
  const wordSearchLevels = (Object.keys(WORD_SEARCH_LEVELS) as WordSearchDifficulty[]).filter((level) => gameMode === "children" ? WORD_SEARCH_LEVELS[level].mode === "baby" : gameMode === "adult" ? WORD_SEARCH_LEVELS[level].mode === "adult" : true);
  const defaultSudokuSize = sudokuSizes[0]?.value ?? 9;
  const defaultMemorySize = memorySizes[0]?.value ?? 4;
  const defaultJigsawSize = jigsawSizes[0]?.value ?? 2;
  const defaultDiff = diffs[0]?.value ?? 'medium';
  const defaultJigsawLevel: JigsawLevel = 1;
  const defaultJigsawImageKey = 1;
  const defaultWordSearchDifficulty = wordSearchLevels[0] ?? "beginner";
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDiff);
  const [sudokuGridSize, setSudokuGridSize] = useState<SudokuGridSize>(defaultSudokuSize);
  const [memoryGridSize, setMemoryGridSize] = useState<MemoryGridSize>(defaultMemorySize);
  const [jigsawGridSize, setJigsawGridSize] = useState<JigsawGridSize>(defaultJigsawSize);
  const [jigsawLevel, setJigsawLevel] = useState<JigsawLevel>(defaultJigsawLevel);
  const [jigsawImageKey, setJigsawImageKey] = useState<number>(defaultJigsawImageKey);
  const [wordSearchDifficulty, setWordSearchDifficulty] = useState<WordSearchDifficulty>(defaultWordSearchDifficulty);
  const [wordSearchTheme, setWordSearchTheme] = useState<WordSearchTheme>("animals");

  // Reset sizes/difficulty to valid options whenever gameMode or dialog open state changes
  React.useEffect(() => {
    const validSudoku = sudokuSizes.map(o => o.value);
    if (!validSudoku.includes(sudokuGridSize)) {
      setSudokuGridSize(sudokuSizes[0]?.value ?? 9);
    }
    const validMemory = memorySizes.map(o => o.value);
    if (!validMemory.includes(memoryGridSize)) {
      setMemoryGridSize(memorySizes[0]?.value ?? 4);
    }
    const validJigsaw = jigsawSizes.map(o => o.value);
    if (!validJigsaw.includes(jigsawGridSize)) {
      setJigsawGridSize(jigsawSizes[0]?.value ?? 2);
    }
  }, [gameMode, open]);

  React.useEffect(() => {
    if (open && initialData) {
      setDialogMode("player");
      setSelected(initialData.opponent);
      setGameType(initialData.gameType);
      if (initialData.difficulty) setDifficulty(initialData.difficulty);
      if (initialData.sudokuGridSize && sudokuSizes.some(o => o.value === initialData.sudokuGridSize)) {
        setSudokuGridSize(initialData.sudokuGridSize);
      }
      if (initialData.memoryGridSize && memorySizes.some(o => o.value === initialData.memoryGridSize)) {
        setMemoryGridSize(initialData.memoryGridSize);
      }
      if (initialData.jigsawGridSize && jigsawSizes.some(o => o.value === initialData.jigsawGridSize)) {
        setJigsawGridSize(initialData.jigsawGridSize);
      }
      if (initialData.jigsawLevel) {
        setJigsawLevel(initialData.jigsawLevel);
      }
      if (initialData.wordSearchDifficulty && wordSearchLevels.includes(initialData.wordSearchDifficulty)) setWordSearchDifficulty(initialData.wordSearchDifficulty);
      if (initialData.wordSearchTheme) setWordSearchTheme(initialData.wordSearchTheme);
    }
    if (!open) {
      setSearch("");
      setSelected(null);
      setGameType("sudoku");
    }
  }, [open]);

  const { data: results, isFetching } = useQuery<ProfileSummary[]>({
    queryKey: ["profile-search", search, myProfileId],
    queryFn: () =>
      customFetch<ProfileSummary[]>(
        `/api/profiles/search?q=${encodeURIComponent(search)}&exclude=${myProfileId}`,
      ),
    enabled: search.length >= 2,
    staleTime: 5000,
  });

  const createSudokuMutation = useMutation({
    mutationFn: (data: {
      challengerId: number;
      challengedId: number;
      difficulty: Difficulty;
      gridSize: SudokuGridSize;
    }) =>
      customFetch<ChallengeDetail>("/api/challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success(`Sudoku challenge sent to ${selected?.username}!`, {
        description: "You can start playing now — they'll join once they accept.",
      });
      onClose();
      if (challenge.challengerGameId) {
        setLocation(`/game/${challenge.challengerGameId}`);
      }
    },
    onError: () => toast.error("Failed to send challenge"),
  });

  const createMemoryMutation = useMutation({
    mutationFn: (data: {
      challengerId: number;
      challengedId: number;
      gridSize: MemoryGridSize;
    }) =>
      customFetch<MemoryDuelDetail>("/api/memory-duels", { method: "POST", data }),
    onSuccess: (duel) => {
      queryClient.invalidateQueries({ queryKey: ["memory-duels"] });
      toast.success(`Memory Match challenge sent to ${selected?.username}!`, {
        description: "You can start playing now — they'll join once they accept.",
      });
      onClose();
      if (duel.challengerGameId) {
        setLocation(`/memory?duelGameId=${duel.challengerGameId}&gridSize=${duel.gridSize}`);
      }
    },
    onError: () => toast.error("Failed to send challenge"),
  });

  const createJigsawMutation = useMutation({
    mutationFn: (data: {
      challengerId: number;
      challengedId: number | null;
      gridSize: JigsawGridSize;
      level: JigsawLevel;
      imageKey: number;
    }) =>
      customFetch<JigsawChallengeDetail>("/api/jigsaw-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["jigsaw-challenges"] });
      if (selected) {
        toast.success(`Jigsaw challenge sent to ${selected?.username}!`, {
          description: "You can start playing now — they'll join once they accept.",
        });
      } else {
        toast.success("Jigsaw challenge link created!", {
          description: "Share the link to find an opponent.",
        });
      }
      onClose();
      if (challenge.challengerGameId) {
        setLocation(`/jigsaw?gridSize=${challenge.gridSize}&level=${challenge.level}&imageKey=${challenge.imageKey}&gameId=${challenge.challengerGameId}&challengeId=${challenge.id}&shareToken=${challenge.shareToken}`);
      }
    },
    onError: () => toast.error("Failed to send challenge"),
  });

  const createWordSearchMutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; difficulty: WordSearchDifficulty; theme: WordSearchTheme }) =>
      customFetch<WordSearchChallengeDetail>("/api/word-search-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["word-search-challenges"] });
      toast.success(`Word Search challenge sent to ${selected?.username}!`, { description: "Play the shared puzzle while they decide." });
      onClose();
      if (challenge.challengerGameId) setLocation(`/word-search?start=1&gameId=${challenge.challengerGameId}&challengeId=${challenge.id}&difficulty=${challenge.difficulty}&theme=${encodeURIComponent(challenge.theme)}&seed=${challenge.seed}`);
    },
    onError: () => toast.error("Failed to send Word Search challenge"),
  });

  // Open (shareable) challenge mutations — no specific opponent
  const openSudokuMutation = useMutation({
    mutationFn: (data: { challengerId: number; difficulty: Difficulty; gridSize: SudokuGridSize }) =>
      customFetch<ChallengeDetail>("/api/challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      onClose();
      if (challenge.shareToken) {
        onShareCreated?.({
          token: challenge.shareToken,
          gameId: challenge.challengerGameId!,
          gameType: "sudoku",
        });
      }
    },
    onError: () => toast.error("Failed to create challenge link"),
  });

  const openMemoryMutation = useMutation({
    mutationFn: (data: { challengerId: number; gridSize: MemoryGridSize }) =>
      customFetch<MemoryDuelDetail>("/api/memory-duels", { method: "POST", data }),
    onSuccess: (duel) => {
      queryClient.invalidateQueries({ queryKey: ["memory-duels"] });
      onClose();
      if (duel.shareToken) {
        onShareCreated?.({
          token: duel.shareToken,
          gameId: duel.challengerGameId!,
          gameType: "memory",
          gridSize: duel.gridSize,
        });
      }
    },
    onError: () => toast.error("Failed to create challenge link"),
  });

  const openJigsawMutation = useMutation({
    mutationFn: (data: { challengerId: number; gridSize: JigsawGridSize; level: JigsawLevel; imageKey: number }) =>
      customFetch<JigsawChallengeDetail>("/api/jigsaw-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["jigsaw-challenges"] });
      onClose();
      if (challenge.shareToken) {
        onShareCreated?.({
          token: challenge.shareToken,
          gameId: challenge.challengerGameId!,
          gameType: "jigsaw",
          gridSize: challenge.gridSize,
        });
      }
    },
    onError: () => toast.error("Failed to create challenge link"),
  });

  const handleSend = () => {
    if (!selected) return;
    if (gameType === "sudoku") {
      const validSize = sudokuSizes.some(o => o.value === sudokuGridSize)
        ? sudokuGridSize
        : (sudokuSizes[0]?.value ?? 9);
      createSudokuMutation.mutate({
        challengerId: myProfileId,
        challengedId: selected.id,
        difficulty,
        gridSize: validSize,
      });
    } else if (gameType === "memory") {
      const validSize = memorySizes.some(o => o.value === memoryGridSize)
        ? memoryGridSize
        : (memorySizes[0]?.value ?? 4);
      createMemoryMutation.mutate({
        challengerId: myProfileId,
        challengedId: selected.id,
        gridSize: validSize,
      });
    } else if (gameType === "jigsaw") {
      const validSize = jigsawSizes.some(o => o.value === jigsawGridSize)
        ? jigsawGridSize
        : (jigsawSizes[0]?.value ?? 2);
      createJigsawMutation.mutate({
        challengerId: myProfileId,
        challengedId: selected.id,
        gridSize: validSize,
        level: jigsawLevel,
        imageKey: jigsawImageKey,
      });
    } else {
      createWordSearchMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: wordSearchDifficulty, theme: wordSearchTheme });
    }
  };

  const handleCreateLink = () => {
    if (gameType === "sudoku") {
      const validSize = sudokuSizes.some(o => o.value === sudokuGridSize)
        ? sudokuGridSize
        : (sudokuSizes[0]?.value ?? 9);
      openSudokuMutation.mutate({ challengerId: myProfileId, difficulty, gridSize: validSize });
    } else if (gameType === "memory") {
      const validSize = memorySizes.some(o => o.value === memoryGridSize)
        ? memoryGridSize
        : (memorySizes[0]?.value ?? 4);
      openMemoryMutation.mutate({ challengerId: myProfileId, gridSize: validSize });
    } else {
      const validSize = jigsawSizes.some(o => o.value === jigsawGridSize)
        ? jigsawGridSize
        : (jigsawSizes[0]?.value ?? 2);
      openJigsawMutation.mutate({ challengerId: myProfileId, gridSize: validSize, level: jigsawLevel, imageKey: jigsawImageKey });
    }
  };

  const isPending =
    createSudokuMutation.isPending || createMemoryMutation.isPending || createJigsawMutation.isPending || createWordSearchMutation.isPending;
  const isLinkPending =
    openSudokuMutation.isPending || openMemoryMutation.isPending || openJigsawMutation.isPending;

  const handleClose = () => {
    setSearch("");
    setSelected(null);
    setGameType("sudoku");
    setDialogMode("player");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            {dialogMode === "open" ? "Create Challenge Link" : "Challenge a Player"}
          </DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-muted/50 rounded-xl border text-sm font-medium">
          <button
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${dialogMode === "player" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setDialogMode("player"); setSelected(null); setSearch(""); }}
          >
            <Search className="w-3.5 h-3.5" /> Find Player
          </button>
          <button
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${dialogMode === "open" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setDialogMode("open"); setSelected(null); setGameType("sudoku"); }}
          >
            <Share2 className="w-3.5 h-3.5" /> Share Link
          </button>
        </div>

        <div className="space-y-4 py-1">
          {dialogMode === "open" ? (
            /* Open challenge — game settings only */
            <div className="space-y-3">
              {/* Game type */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setGameType("sudoku")}
                  className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 transition-all text-sm font-medium ${gameType === "sudoku" ? "border-primary bg-primary/5 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"}`}
                >
                  <Grid2x2 className="w-4 h-4 shrink-0" />
                  Sudoku
                </button>
                <button
                  onClick={() => setGameType("memory")}
                  className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 transition-all text-sm font-medium ${gameType === "memory" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-border bg-muted/30 text-muted-foreground hover:border-violet-300"}`}
                >
                  <Brain className="w-4 h-4 shrink-0" />
                  Memory
                </button>
                <button
                  onClick={() => setGameType("jigsaw")}
                  className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 transition-all text-sm font-medium ${gameType === "jigsaw" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-border bg-muted/30 text-muted-foreground hover:border-amber-300"}`}
                >
                  <Puzzle className="w-4 h-4 shrink-0" />
                  Jigsaw
                </button>
              </div>
              {gameType === "sudoku" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Difficulty</label>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {diffs.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Grid</label>
                    <Select value={String(sudokuGridSize)} onValueChange={(v) => setSudokuGridSize(Number(v) as SudokuGridSize)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {sudokuSizes.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {gameType === "memory" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Grid Size</label>
                  <Select value={String(memoryGridSize)} onValueChange={(v) => setMemoryGridSize(Number(v) as MemoryGridSize)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {memorySizes.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {gameType === "jigsaw" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Grid Size</label>
                    <Select value={String(jigsawGridSize)} onValueChange={(v) => setJigsawGridSize(Number(v) as JigsawGridSize)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {jigsawSizes.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Level</label>
                    <Select value={String(jigsawLevel)} onValueChange={(v) => setJigsawLevel(Number(v) as JigsawLevel)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {JIGSAW_LEVEL_OPTIONS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>Winner gets <strong>10 gems</strong> — highest score wins!</span>
              </div>
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Share the link — the first person to tap it becomes your opponent.
              </p>
            </div>
          ) : !selected ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Search by username
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Type a username…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
                {isFetching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {results && results.length > 0 && (
                <div className="border rounded-lg divide-y max-h-52 overflow-y-auto">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => setSelected(p)}
                    >
                      <Avatar src={p.avatar} name={p.username} size={8} />
                      <div>
                        <p className="font-medium text-sm">{p.username}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Gem className="w-3 h-3 text-cyan-500" />
                          {p.gems?.toLocaleString() ?? 0} gems
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {search.length >= 2 && !isFetching && results?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-3">
                  No players found
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <Avatar
                  src={selected.avatar}
                  name={selected.username}
                  size={10}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{selected.username}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Gem className="w-3 h-3 text-cyan-500" />
                    {selected.gems?.toLocaleString() ?? 0} gems
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelected(null)}
                >
                  Change
                </Button>
              </div>

              {/* Game type selector */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  onClick={() => setGameType("sudoku")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-sm font-medium ${gameType === "sudoku" ? "border-primary bg-primary/5 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"}`}
                >
                  <Grid2x2 className="w-5 h-5" />
                  Sudoku
                </button>
                <button
                  onClick={() => setGameType("memory")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-sm font-medium ${gameType === "memory" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-border bg-muted/30 text-muted-foreground hover:border-violet-300"}`}
                >
                  <Brain className="w-5 h-5" />
                  Memory
                </button>
                <button
                  onClick={() => setGameType("jigsaw")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-sm font-medium ${gameType === "jigsaw" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-border bg-muted/30 text-muted-foreground hover:border-amber-300"}`}
                >
                  <Puzzle className="w-5 h-5" />
                  Jigsaw
                </button>
                <button onClick={() => setGameType("word-search")} className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-sm font-medium ${gameType === "word-search" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-border bg-muted/30 text-muted-foreground hover:border-violet-300"}`}>
                  <Search className="h-5 w-5" />Word Search
                </button>
              </div>

              {/* Sudoku options */}
              {gameType === "sudoku" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select
                      value={difficulty}
                      onValueChange={(v) => setDifficulty(v as Difficulty)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {diffs.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Grid Size</label>
                    <Select
                      value={String(sudokuGridSize)}
                      onValueChange={(v) =>
                        setSudokuGridSize(Number(v) as SudokuGridSize)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sudokuSizes.map(o => (
                          <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Memory options */}
              {gameType === "memory" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Grid Size</label>
                  <Select
                    value={String(memoryGridSize)}
                    onValueChange={(v) =>
                      setMemoryGridSize(Number(v) as MemoryGridSize)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {memorySizes.map(o => (
                        <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Jigsaw options */}
              {gameType === "jigsaw" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Grid Size</label>
                    <Select
                      value={String(jigsawGridSize)}
                      onValueChange={(v) =>
                        setJigsawGridSize(Number(v) as JigsawGridSize)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jigsawSizes.map(o => (
                          <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Level</label>
                    <Select
                      value={String(jigsawLevel)}
                      onValueChange={(v) =>
                        setJigsawLevel(Number(v) as JigsawLevel)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JIGSAW_LEVEL_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {gameType === "word-search" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><label className="text-sm font-medium">Difficulty</label><Select value={wordSearchDifficulty} onValueChange={(value) => setWordSearchDifficulty(value as WordSearchDifficulty)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{wordSearchLevels.map((level) => <SelectItem key={level} value={level}>{WORD_SEARCH_LEVELS[level].label} · {WORD_SEARCH_LEVELS[level].size}×{WORD_SEARCH_LEVELS[level].size}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium">Theme</label><Select value={wordSearchTheme} onValueChange={(value) => setWordSearchTheme(value as WordSearchTheme)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{WORD_SEARCH_THEMES.map((theme) => <SelectItem key={theme.id} value={theme.id}>{theme.emoji} {theme.label}</SelectItem>)}</SelectContent></Select></div>
                </div>
              )}

              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
                <Trophy className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                <span>
                  Winner gets <strong>10 gems</strong> — whoever scores more
                  points wins!
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {dialogMode === "open" ? (
            <Button onClick={handleCreateLink} disabled={isLinkPending} className="gap-2">
              {isLinkPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Creating…</>
              ) : (
                <><Share2 className="w-4 h-4" />Create Link</>
              )}
            </Button>
          ) : selected ? (
            <Button onClick={handleSend} disabled={isPending} className="gap-2">
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
              ) : (
                <><Swords className="w-4 h-4" />Send Challenge</>
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Challenges() {
  const { profileId } = useAuth();
  const [location, setLocation] = useLocation();
  const queryParams = new URLSearchParams(location.split("?")[1] ?? "");
  const rematchChallengeId = Number(queryParams.get("rematchChallengeId") ?? "");
  const rematchDuelId = Number(queryParams.get("rematchDuelId") ?? "");
  usePageMeta({
    title: "Puzzle Challenges & Duels | Play Brain Games . Online",
    description:
      "Create and join Sudoku, Memory Match, Jigsaw, and Word Search challenges, compare scores, and compete with friends on Play Brain Games . Online.",
    path: "/challenges",
  });
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(useSearch());
  const [showNew, setShowNew] = useState(false);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<GameType>(() => searchParams.get("tab") === "word-search" ? "word-search" : "sudoku");
  const [shareSheetData, setShareSheetData] = useState<{ token: string; label: string } | null>(null);
  const [rematchData, setRematchData] = useState<RematchData | null>(null);

  const handleShare = useCallback((token: string, label: string) => {
    setShareSheetData({ token, label });
  }, []);

  const openNewChallenge = useCallback(() => {
    setRematchData(null);
    setShowNew(true);
  }, []);

  const closeNewChallenge = useCallback(() => {
    setShowNew(false);
    setRematchData(null);
  }, []);

  const { data: profile } = useGetProfile(profileId as number);
  const gameMode = (profile?.gameMode ?? '4all') as GameMode;

  // ── Sudoku challenges ────────────────────────────────────────────────────────
  const { data: challenges, isLoading: challengesLoading } = useQuery<
    ChallengeDetail[]
  >({
    queryKey: ["challenges", profileId],
    queryFn: () =>
      customFetch<ChallengeDetail[]>(`/api/challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const respondMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number;
      action: "accept" | "decline";
    }) =>
      customFetch<ChallengeDetail>(`/api/challenges/${id}/respond`, {
        method: "PATCH",
        data: { action, profileId },
      }),
    onSuccess: (challenge, vars) => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      setRespondingId(null);
      if (vars.action === "accept") {
        if (challenge.challengedGameId)
          setLocation(`/game/${challenge.challengedGameId}`);
      } else {
        toast("Challenge declined.");
      }
    },
    onError: () => {
      setRespondingId(null);
      toast.error("Failed to respond to challenge");
    },
  });

  // ── Memory duels ─────────────────────────────────────────────────────────────
  const { data: duels, isLoading: duelsLoading } = useQuery<MemoryDuelDetail[]>(
    {
      queryKey: ["memory-duels", profileId],
      queryFn: () =>
        customFetch<MemoryDuelDetail[]>(`/api/memory-duels/for/${profileId}`),
      enabled: !!profileId,
      refetchInterval: 10000,
    },
  );

  // ── Jigsaw challenges ───────────────────────────────────────────────────────────
  const { data: jigsawChallenges, isLoading: jigsawLoading } = useQuery<JigsawChallengeDetail[]>(
    {
      queryKey: ["jigsaw-challenges", profileId],
      queryFn: () =>
        customFetch<JigsawChallengeDetail[]>(`/api/jigsaw-challenges/for/${profileId}`),
      enabled: !!profileId,
      refetchInterval: 10000,
    },
  );

  const { data: wordSearchChallenges, isLoading: wordSearchLoading } = useQuery<WordSearchChallengeDetail[]>({
    queryKey: ["word-search-challenges", profileId],
    queryFn: () => customFetch<WordSearchChallengeDetail[]>(`/api/word-search-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const respondDuelMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number;
      action: "accept" | "decline";
    }) =>
      customFetch<MemoryDuelDetail>(`/api/memory-duels/${id}/respond`, {
        method: "PATCH",
        data: { action },
      }),
    onSuccess: (duel, vars) => {
      queryClient.invalidateQueries({ queryKey: ["memory-duels"] });
      setRespondingId(null);
      if (vars.action === "accept") {
        if (duel.challengedGameId) {
          setLocation(
            `/memory?duelGameId=${duel.challengedGameId}&gridSize=${duel.gridSize}`,
          );
        }
      } else {
        toast("Duel declined.");
      }
    },
    onError: () => {
      setRespondingId(null);
      toast.error("Failed to respond to duel");
    },
  });

  const respondJigsawMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number;
      action: "accept" | "decline";
    }) =>
      customFetch<{ gameId?: number }>(`/api/jigsaw-challenges/${id}/respond`, {
        method: "POST",
        data: { profileId, action },
      }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["jigsaw-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        const challenge = jigsawChallenges?.find((item) => item.id === vars.id);
        if (challenge) {
          setLocation(`/jigsaw?gridSize=${challenge.gridSize}&level=${challenge.level}&imageKey=${challenge.imageKey}&gameId=${result.gameId}&challengeId=${challenge.id}&shareToken=${challenge.shareToken}`);
        }
      } else {
        toast("Challenge declined.");
      }
    },
    onError: () => {
      setRespondingId(null);
      toast.error("Failed to respond to challenge");
    },
  });

  const respondWordSearchMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<WordSearchChallengeDetail & { gameId?: number }>(`/api/word-search-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["word-search-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        setLocation(`/word-search?start=1&gameId=${result.gameId}&challengeId=${result.id}&difficulty=${result.difficulty}&theme=${encodeURIComponent(result.theme)}&seed=${result.seed}`);
      } else if (vars.action === "decline") toast("Challenge declined.");
    },
    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleAccept = useCallback(
    (id: number) => {
      setRespondingId(id);
      respondMutation.mutate({ id, action: "accept" });
    },
    [respondMutation],
  );

  const handleDecline = useCallback(
    (id: number) => {
      setRespondingId(id);
      respondMutation.mutate({ id, action: "decline" });
    },
    [respondMutation],
  );

  const handlePlay = useCallback(
    (gameId: number) => {
      setLocation(`/game/${gameId}`);
    },
    [setLocation],
  );

  const handleDuelAccept = useCallback(
    (id: number) => {
      setRespondingId(id);
      respondDuelMutation.mutate({ id, action: "accept" });
    },
    [respondDuelMutation],
  );

  const handleDuelDecline = useCallback(
    (id: number) => {
      setRespondingId(id);
      respondDuelMutation.mutate({ id, action: "decline" });
    },
    [respondDuelMutation],
  );

  const handleDuelPlay = useCallback(
    (duel: MemoryDuelDetail) => {
      const myGameId =
        duel.challengerId === profileId
          ? duel.challengerGameId
          : duel.challengedGameId;
      if (myGameId) {
        setLocation(`/memory?duelGameId=${myGameId}&gridSize=${duel.gridSize}`);
      }
    },
    [setLocation, profileId],
  );

  const handleJigsawAccept = useCallback(
    (id: number) => {
      setRespondingId(id);
      respondJigsawMutation.mutate({ id, action: "accept" });
    },
    [respondJigsawMutation],
  );

  const handleJigsawDecline = useCallback(
    (id: number) => {
      setRespondingId(id);
      respondJigsawMutation.mutate({ id, action: "decline" });
    },
    [respondJigsawMutation],
  );

  const handleJigsawPlay = useCallback(
    (challenge: JigsawChallengeDetail) => {
      const myGameId =
        challenge.challengerId === profileId
          ? challenge.challengerGameId
          : challenge.challengedGameId;
      if (myGameId) {
        setLocation(`/jigsaw?gridSize=${challenge.gridSize}&level=${challenge.level}&imageKey=${challenge.imageKey}&gameId=${myGameId}&challengeId=${challenge.id}&shareToken=${challenge.shareToken}`);
      }
    },
    [setLocation, profileId],
  );

  const handleWordSearchAccept = useCallback((id: number) => { setRespondingId(id); respondWordSearchMutation.mutate({ id, action: "accept" }); }, [respondWordSearchMutation]);
  const handleWordSearchDecline = useCallback((id: number) => { setRespondingId(id); respondWordSearchMutation.mutate({ id, action: "decline" }); }, [respondWordSearchMutation]);
  const handleWordSearchPlay = useCallback((challenge: WordSearchChallengeDetail) => {
    const gameId = challenge.challengerId === profileId ? challenge.challengerGameId : challenge.challengedGameId;
    if (gameId) setLocation(`/word-search?start=1&gameId=${gameId}&challengeId=${challenge.id}&difficulty=${challenge.difficulty}&theme=${encodeURIComponent(challenge.theme)}&seed=${challenge.seed}`);
  }, [profileId, setLocation]);

  const handleSudokuRematch = useCallback(
    (challenge: ChallengeDetail) => {
      const isChallenger = challenge.challengerId === profileId;
      const opponentId = isChallenger ? challenge.challengedId : challenge.challengerId;
      if (!opponentId) {
        toast.error("This challenge no longer has an opponent.");
        return;
      }

      setRematchData({
        opponent: {
          id: opponentId,
          username: isChallenger ? challenge.challengedUsername : challenge.challengerUsername,
          avatar: isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar,
          gems: 0,
        },
        gameType: "sudoku",
        difficulty: challenge.difficulty,
        sudokuGridSize: challenge.gridSize as SudokuGridSize,
      });
      setShowNew(true);
    },
    [profileId],
  );

  const handleMemoryRematch = useCallback(
    (duel: MemoryDuelDetail) => {
      const isChallenger = duel.challengerId === profileId;
      const opponentId = isChallenger ? duel.challengedId : duel.challengerId;
      if (!opponentId) {
        toast.error("This duel no longer has an opponent.");
        return;
      }

      setRematchData({
        opponent: {
          id: opponentId,
          username: isChallenger ? duel.challengedUsername : duel.challengerUsername,
          avatar: isChallenger ? duel.challengedAvatar : duel.challengerAvatar,
          gems: 0,
        },
        gameType: "memory",
        memoryGridSize: duel.gridSize as MemoryGridSize,
      });
      setShowNew(true);
    },
    [profileId],
  );

  const handleJigsawRematch = useCallback(
    (challenge: JigsawChallengeDetail) => {
      const isChallenger = challenge.challengerId === profileId;
      const opponentId = isChallenger ? challenge.challengedId : challenge.challengerId;
      if (!opponentId) {
        toast.error("This challenge no longer has an opponent.");
        return;
      }

      setRematchData({
        opponent: {
          id: opponentId,
          username: isChallenger ? challenge.challengedUsername ?? "Player" : challenge.challengerUsername,
          avatar: isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar,
          gems: 0,
        },
        gameType: "jigsaw",
        jigsawGridSize: challenge.gridSize,
        jigsawLevel: challenge.level,
      });
      setShowNew(true);
    },
    [profileId],
  );

  // Ensure profileId is not null before rendering
  if (!profileId) {
    return (
      <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
        <Card>
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-3 text-center">
            <p className="font-semibold text-lg">Please sign in to view challenges</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    if (showNew || !challenges || !Number.isFinite(rematchChallengeId) || rematchChallengeId <= 0) {
      return;
    }
    const challenge = challenges.find(
      (item) => item.id === rematchChallengeId && item.status === "completed",
    );
    if (!challenge) return;

    handleSudokuRematch(challenge);
    setLocation("/challenges", { replace: true });
  }, [
    challenges,
    handleSudokuRematch,
    rematchChallengeId,
    setLocation,
    showNew,
  ]);

  useEffect(() => {
    if (showNew || !duels || !Number.isFinite(rematchDuelId) || rematchDuelId <= 0) {
      return;
    }
    const duel = duels.find(
      (item) => item.id === rematchDuelId && item.status === "completed",
    );
    if (!duel) return;

    handleMemoryRematch(duel);
    setLocation("/challenges", { replace: true });
  }, [duels, handleMemoryRematch, rematchDuelId, setLocation, showNew]);

  // ── Derived lists ─────────────────────────────────────────────────────────────

  const pending =
    challenges?.filter(
      (c) => c.status === "pending" && c.challengedId === profileId,
    ) ?? [];
  const active = challenges?.filter((c) => c.status === "accepted") ?? [];
  const outgoing =
    challenges?.filter(
      (c) => c.status === "pending" && c.challengerId === profileId,
    ) ?? [];
  const finished =
    challenges?.filter(
      (c) => c.status === "completed" || c.status === "declined",
    ) ?? [];

  const duelPending =
    duels?.filter(
      (d) => d.status === "pending" && d.challengedId === profileId,
    ) ?? [];
  const duelActive = duels?.filter((d) => d.status === "accepted") ?? [];
  const duelOutgoing =
    duels?.filter(
      (d) => d.status === "pending" && d.challengerId === profileId,
    ) ?? [];
  const duelFinished =
    duels?.filter((d) => d.status === "completed" || d.status === "declined") ??
    [];

  const jigsawPending =
    jigsawChallenges?.filter(
      (c) => c.status === "pending" && c.challengedId === profileId,
    ) ?? [];
  const jigsawActive = jigsawChallenges?.filter((c) => c.status === "accepted") ?? [];
  const jigsawOutgoing =
    jigsawChallenges?.filter(
      (c) => c.status === "pending" && c.challengerId === profileId,
    ) ?? [];
  const jigsawFinished =
    jigsawChallenges?.filter(
      (c) => c.status === "completed" || c.status === "declined",
    ) ?? [];
  const wordSearchPending = wordSearchChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const wordSearchActive = wordSearchChallenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const wordSearchOutgoing = wordSearchChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const wordSearchFinished = wordSearchChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];

  // Badge counts for tab labels
  const sudokuAlert =
    pending.length +
    active.filter((c) => {
      const myGameId =
        c.challengerId === profileId ? c.challengerGameId : c.challengedGameId;
      const myPoints =
        c.challengerId === profileId ? c.challengerPoints : c.challengedPoints;
      return myGameId && myPoints == null;
    }).length;
  const memoryAlert =
    duelPending.length +
    duelActive.filter((d) => {
      const myPoints =
        d.challengerId === profileId ? d.challengerPoints : d.challengedPoints;
      return myPoints == null;
    }).length;
  const jigsawAlert =
    jigsawPending.length +
    jigsawActive.filter((c) => {
      const myPoints =
        c.challengerId === profileId ? c.challengerPoints : c.challengedPoints;
      return myPoints == null;
    }).length;
  const wordSearchAlert = wordSearchPending.length + wordSearchActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;

  const isLoading = activeTab === "sudoku" ? challengesLoading : activeTab === "memory" ? duelsLoading : activeTab === "jigsaw" ? jigsawLoading : wordSearchLoading;

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
      <div className="font-size-mobile-safe flex items-center justify-between gap-3 bg-card rounded-2xl px-5 py-4 border border-border">
        <div className="space-y-0.5 min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight leading-tight">
            Challenges
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Beat your opponent&apos;s score to win 10 gems. Unaccepted challenges expire after 7 days.
          </p>
        </div>
        <div className="font-size-mobile-actions flex items-center gap-1.5 shrink-0">
          <Link
            href="/sudoku/"
            className="inline-flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-border bg-card text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors"
            title="Play Sudoku"
          >
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Sudoku</span>
          </Link>
          <Link
            href="/memory/"
            className="inline-flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-border bg-card text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors"
            title="Play Memory"
          >
            <Brain className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Memory</span>
          </Link>
          <Link
            href="/jigsaw/"
            className="inline-flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-border bg-card text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors"
            title="Play Jigsaw"
          >
            <Puzzle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Jigsaw</span>
          </Link>
          <Button size="sm" className="gap-1.5" onClick={openNewChallenge}>
            <Swords className="w-4 h-4" />
            Challenge
          </Button>
        </div>
      </div>

      {/* Game type tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl border sm:grid-cols-4">
        <button
          onClick={() => setActiveTab("sudoku")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === "sudoku" ? "bg-background shadow-sm text-foreground" : "text-foreground/70 hover:text-foreground"}`}
        >
          <Grid2x2 className="w-4 h-4" />
          Sudoku
          {sudokuAlert > 0 && (
            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {sudokuAlert}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("memory")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === "memory" ? "bg-background shadow-sm text-foreground" : "text-foreground/70 hover:text-foreground"}`}
        >
          <Brain className="w-4 h-4" />
          <span className="hidden sm:inline">Memory Match</span>
          <span className="sm:hidden">Memory</span>
          {memoryAlert > 0 && (
            <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">
              {memoryAlert}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("jigsaw")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === "jigsaw" ? "bg-background shadow-sm text-foreground" : "text-foreground/70 hover:text-foreground"}`}
        >
          <Puzzle className="w-4 h-4" />
          Jigsaw
          {jigsawAlert > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
              {jigsawAlert}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab("word-search")} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === "word-search" ? "bg-background shadow-sm text-foreground" : "text-foreground/70 hover:text-foreground"}`}>
          <Search className="h-4 w-4" /><span>Word Search</span>{wordSearchAlert > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">{wordSearchAlert}</span>}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : activeTab === "sudoku" ? (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />{" "}
                Waiting for you ({pending.length})
              </h2>
              {pending.map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  myProfileId={profileId}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onPlay={handlePlay}
                   onRematch={handleSudokuRematch}
                  onShare={handleShare}
                  isResponding={respondingId === c.id}
                />
              ))}
            </section>
          )}
          {active.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />{" "}
                In Progress ({active.length})
              </h2>
              {active.map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  myProfileId={profileId}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onPlay={handlePlay}
                   onRematch={handleSudokuRematch}
                  onShare={handleShare}
                  isResponding={respondingId === c.id}
                />
              ))}
            </section>
          )}
          {outgoing.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <Clock className="w-3.5 h-3.5" /> Waiting for them (
                {outgoing.length})
              </h2>
              {outgoing.map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  myProfileId={profileId}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onPlay={handlePlay}
                   onRematch={handleSudokuRematch}
                  onShare={handleShare}
                  isResponding={respondingId === c.id}
                />
              ))}
            </section>
          )}
          {finished.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> Finished
              </h2>
              {finished.map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  myProfileId={profileId}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onPlay={handlePlay}
                   onRematch={handleSudokuRematch}
                  onShare={handleShare}
                  isResponding={false}
                />
              ))}
            </section>
          )}
          {(!challenges || challenges.length === 0) && (
            <Card>
              <CardContent className="pt-10 pb-10 flex flex-col items-center gap-3 text-center">
                <Swords className="w-12 h-12 text-muted-foreground/30" />
                <p className="font-semibold text-lg">
                  No Sudoku challenges yet
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Challenge another player to a head-to-head Sudoku battle.
                  Winner takes 10 gems!
                </p>
                <Button className="mt-2 gap-2" onClick={openNewChallenge}>
                  <Swords className="w-4 h-4" /> Send your first challenge
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : activeTab === "word-search" ? (
        <div className="space-y-6">
          {wordSearchPending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({wordSearchPending.length})</h2>{wordSearchPending.map((challenge) => <WordSearchChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleWordSearchAccept} onDecline={handleWordSearchDecline} onPlay={handleWordSearchPlay} isResponding={respondingId === challenge.id}/>)}</section>}
          {wordSearchActive.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({wordSearchActive.length})</h2>{wordSearchActive.map((challenge) => <WordSearchChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleWordSearchAccept} onDecline={handleWordSearchDecline} onPlay={handleWordSearchPlay} isResponding={respondingId === challenge.id}/>)}</section>}
          {wordSearchOutgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({wordSearchOutgoing.length})</h2>{wordSearchOutgoing.map((challenge) => <WordSearchChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleWordSearchAccept} onDecline={handleWordSearchDecline} onPlay={handleWordSearchPlay} isResponding={respondingId === challenge.id}/>)}</section>}
          {wordSearchFinished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{wordSearchFinished.map((challenge) => <WordSearchChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleWordSearchAccept} onDecline={handleWordSearchDecline} onPlay={handleWordSearchPlay} isResponding={false}/>)}</section>}
          {(!wordSearchChallenges || wordSearchChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><Search className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Word Search challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to find words in the same puzzle and compare points.</p><Button className="mt-2 gap-2 bg-violet-600 hover:bg-violet-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a Word Search challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "jigsaw" ? (
        <div className="space-y-6">
          {jigsawPending.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />{" "}
                Waiting for you ({jigsawPending.length})
              </h2>
              {jigsawPending.map((c) => (
                <JigsawChallengeCard
                  key={c.id}
                  challenge={c}
                  myProfileId={profileId!}
                  onAccept={handleJigsawAccept}
                  onDecline={handleJigsawDecline}
                  onPlay={handleJigsawPlay}
                  onRematch={handleJigsawRematch}
                  onShare={handleShare}
                  isResponding={respondingId === c.id}
                />
              ))}
            </section>
          )}
          {jigsawActive.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />{" "}
                In Progress ({jigsawActive.length})
              </h2>
              {jigsawActive.map((c) => (
                <JigsawChallengeCard
                  key={c.id}
                  challenge={c}
                  myProfileId={profileId!}
                  onAccept={handleJigsawAccept}
                  onDecline={handleJigsawDecline}
                  onPlay={handleJigsawPlay}
                  onRematch={handleJigsawRematch}
                  onShare={handleShare}
                  isResponding={respondingId === c.id}
                />
              ))}
            </section>
          )}
          {jigsawOutgoing.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <Clock className="w-3.5 h-3.5" /> Waiting for them (
                {jigsawOutgoing.length})
              </h2>
              {jigsawOutgoing.map((c) => (
                <JigsawChallengeCard
                  key={c.id}
                  challenge={c}
                  myProfileId={profileId!}
                  onAccept={handleJigsawAccept}
                  onDecline={handleJigsawDecline}
                  onPlay={handleJigsawPlay}
                  onRematch={handleJigsawRematch}
                  onShare={handleShare}
                  isResponding={respondingId === c.id}
                />
              ))}
            </section>
          )}
          {jigsawFinished.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> Finished
              </h2>
              {jigsawFinished.map((c) => (
                <JigsawChallengeCard
                  key={c.id}
                  challenge={c}
                  myProfileId={profileId!}
                  onAccept={handleJigsawAccept}
                  onDecline={handleJigsawDecline}
                  onPlay={handleJigsawPlay}
                  onRematch={handleJigsawRematch}
                  onShare={handleShare}
                  isResponding={false}
                />
              ))}
            </section>
          )}
          {(!jigsawChallenges || jigsawChallenges.length === 0) && (
            <Card>
              <CardContent className="pt-10 pb-10 flex flex-col items-center gap-3 text-center">
                <Puzzle className="w-12 h-12 text-muted-foreground/30" />
                <p className="font-semibold text-lg">
                  No Jigsaw challenges yet
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Challenge a friend to solve the same picture puzzle. Compare
                  scores to win 10 gems!
                </p>
                <Button
                  className="mt-2 gap-2 bg-amber-600 hover:bg-amber-700"
                  onClick={openNewChallenge}
                >
                  <Puzzle className="w-4 h-4" /> Send a jigsaw challenge
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {duelPending.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />{" "}
                Waiting for you ({duelPending.length})
              </h2>
              {duelPending.map((d) => (
                <MemoryDuelCard
                  key={d.id}
                  duel={d}
                  myProfileId={profileId}
                  onAccept={handleDuelAccept}
                  onDecline={handleDuelDecline}
                  onPlay={handleDuelPlay}
                   onRematch={handleMemoryRematch}
                  onShare={handleShare}
                  isResponding={respondingId === d.id}
                />
              ))}
            </section>
          )}
          {duelActive.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />{" "}
                In Progress ({duelActive.length})
              </h2>
              {duelActive.map((d) => (
                <MemoryDuelCard
                  key={d.id}
                  duel={d}
                  myProfileId={profileId}
                  onAccept={handleDuelAccept}
                  onDecline={handleDuelDecline}
                  onPlay={handleDuelPlay}
                   onRematch={handleMemoryRematch}
                  onShare={handleShare}
                  isResponding={respondingId === d.id}
                />
              ))}
            </section>
          )}
          {duelOutgoing.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <Clock className="w-3.5 h-3.5" /> Waiting for them (
                {duelOutgoing.length})
              </h2>
              {duelOutgoing.map((d) => (
                <MemoryDuelCard
                  key={d.id}
                  duel={d}
                  myProfileId={profileId}
                  onAccept={handleDuelAccept}
                  onDecline={handleDuelDecline}
                  onPlay={handleDuelPlay}
                   onRematch={handleMemoryRematch}
                  onShare={handleShare}
                  isResponding={respondingId === d.id}
                />
              ))}
            </section>
          )}
          {duelFinished.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> Finished
              </h2>
              {duelFinished.map((d) => (
                <MemoryDuelCard
                  key={d.id}
                  duel={d}
                  myProfileId={profileId}
                  onAccept={handleDuelAccept}
                  onDecline={handleDuelDecline}
                  onPlay={handleDuelPlay}
                   onRematch={handleMemoryRematch}
                  onShare={handleShare}
                  isResponding={false}
                />
              ))}
            </section>
          )}
          {(!duels || duels.length === 0) && (
            <Card>
              <CardContent className="pt-10 pb-10 flex flex-col items-center gap-3 text-center">
                <Brain className="w-12 h-12 text-muted-foreground/30" />
                <p className="font-semibold text-lg">
                  No Memory Match duels yet
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Challenge a friend to a head-to-head Memory Match. Flip all
                  pairs the fastest to win 10 gems!
                </p>
                <Button
                  className="mt-2 gap-2 bg-violet-600 hover:bg-violet-700"
                  onClick={openNewChallenge}
                >
                  <Brain className="w-4 h-4" /> Send a memory duel
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <MobileContentDisclosure
        id="challenge-guidance"
        title="More about challenges"
        className="rounded-2xl border border-border bg-card p-3 md:px-5 md:py-5"
      >
      <section
        aria-labelledby="challenge-help-heading"
        className="text-sm leading-relaxed text-muted-foreground"
      >
        <h2 id="challenge-help-heading" className="text-lg font-semibold text-foreground">
          How challenges work
        </h2>
        <p className="mt-2">
          No account is needed to start a challenge. Choose the Challenge button,
            select Sudoku, Memory Match, Jigsaw, or Word Search to challenge another player on the same puzzle.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-foreground">What challenges are</h3>
            <p className="mt-1">
              Both players compete on the same puzzle or board, and the higher
              score wins.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">How invitations work</h3>
            <p className="mt-1">
              Share the invitation link. Your friend can accept as a guest,
              without signing in. Invitations expire after 7 days if nobody
              accepts. If one expires, its link still lets players start a solo
              game or send a fresh challenge.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">How scoring works</h3>
            <p className="mt-1">
              Speed, difficulty, mistakes, hints, or card flips affect the
              result. Winners earn gems and ties reward both players.
            </p>
          </div>
        </div>
      </section>
      </MobileContentDisclosure>

      <NewChallengeDialog
        open={showNew}
        onClose={closeNewChallenge}
        myProfileId={profileId}
        gameMode={gameMode}
        initialData={rematchData ?? undefined}
        onShareCreated={(data) => {
          setShareSheetData({
            token: data.token,
            label: data.gameType === "sudoku"
              ? "I challenge you to a Sudoku!"
              : "I challenge you to a Memory Match!",
          });
        }}
      />

      {shareSheetData && (
        <ChallengeShareSheet
          open={true}
          onClose={() => setShareSheetData(null)}
          shareToken={shareSheetData.token}
          label={shareSheetData.label}
        />
      )}
    </div>
  );
}
