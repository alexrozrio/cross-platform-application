import React, { useState, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch, useGetProfile } from "@workspace/api-client-react";
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
import { Swords, Trophy, Clock, Search, Gem, CircleCheck as CheckCircle2, Circle as XCircle, Loader as Loader2, ChevronRight, Crown, Minus, Brain, Grid2x2, Zap, RotateCcw, Share2, Copy, Check, ExternalLink, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { showEventModal } from "@/hooks/use-event-modal";
import { LevelBadge } from "@/components/level-badge";

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard" | "expert";
type SudokuGridSize = 3 | 4 | 6 | 9 | 16;
type MemoryGridSize = 2 | 4 | 6 | 8;
type ChallengeStatus = "pending" | "accepted" | "declined" | "completed";
type GameType = "sudoku" | "memory";

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
  6: "4×8 Medium",
  8: "8×8 Hard",
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
  const shareUrl = `${window.location.origin}/invite/${shareToken}`;
  const text = `${label} — click to accept and play!`;
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
    navigator.share({ title: label, text, url: shareUrl }).catch(() => {});
  };

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
            <Button
              variant="outline"
              className={`${canNativeShare ? "" : "col-span-2"} gap-2`}
              onClick={copy}
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── NewChallengeDialog ───────────────────────────────────────────────────────

interface RematchData {
  opponent: ProfileSummary;
  gameType: GameType;
  difficulty?: Difficulty;
  sudokuGridSize?: SudokuGridSize;
  memoryGridSize?: MemoryGridSize;
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
  { value: 6, label: '4×8 Medium · 16 pairs' },
  { value: 8, label: '8×8 Hard · 32 pairs' },
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
  onShareCreated?: (data: { token: string; gameId: number; gameType: "sudoku" | "memory"; gridSize?: number }) => void;
}) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [dialogMode, setDialogMode] = useState<"player" | "open">("player");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProfileSummary | null>(null);
  const [gameType, setGameType] = useState<GameType>("sudoku");
  const sudokuSizes = filteredSudokuSizes(gameMode);
  const memorySizes = filteredMemorySizes(gameMode);
  const diffs = filteredDifficulties(gameMode);
  const defaultSudokuSize = sudokuSizes[0]?.value ?? 9;
  const defaultMemorySize = memorySizes[0]?.value ?? 4;
  const defaultDiff = diffs[0]?.value ?? 'medium';
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDiff);
  const [sudokuGridSize, setSudokuGridSize] = useState<SudokuGridSize>(defaultSudokuSize);
  const [memoryGridSize, setMemoryGridSize] = useState<MemoryGridSize>(defaultMemorySize);

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
  }, [gameMode, open]);

  React.useEffect(() => {
    if (open && initialData) {
      setSelected(initialData.opponent);
      setGameType(initialData.gameType);
      if (initialData.difficulty) setDifficulty(initialData.difficulty);
      if (initialData.sudokuGridSize && sudokuSizes.some(o => o.value === initialData.sudokuGridSize)) {
        setSudokuGridSize(initialData.sudokuGridSize);
      }
      if (initialData.memoryGridSize && memorySizes.some(o => o.value === initialData.memoryGridSize)) {
        setMemoryGridSize(initialData.memoryGridSize);
      }
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
      if (challenge.challengerGameId) setLocation(`/game/${challenge.challengerGameId}`);
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
      if (duel.challengerGameId) setLocation(`/memory?duelGameId=${duel.challengerGameId}&gridSize=${duel.gridSize}`);
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
    } else {
      const validSize = memorySizes.some(o => o.value === memoryGridSize)
        ? memoryGridSize
        : (memorySizes[0]?.value ?? 4);
      createMemoryMutation.mutate({
        challengerId: myProfileId,
        challengedId: selected.id,
        gridSize: validSize,
      });
    }
  };

  const handleCreateLink = () => {
    if (gameType === "sudoku") {
      const validSize = sudokuSizes.some(o => o.value === sudokuGridSize)
        ? sudokuGridSize
        : (sudokuSizes[0]?.value ?? 9);
      openSudokuMutation.mutate({ challengerId: myProfileId, difficulty, gridSize: validSize });
    } else {
      const validSize = memorySizes.some(o => o.value === memoryGridSize)
        ? memoryGridSize
        : (memorySizes[0]?.value ?? 4);
      openMemoryMutation.mutate({ challengerId: myProfileId, gridSize: validSize });
    }
  };

  const isPending =
    createSudokuMutation.isPending || createMemoryMutation.isPending;
  const isLinkPending =
    openSudokuMutation.isPending || openMemoryMutation.isPending;

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
            onClick={() => { setDialogMode("open"); setSelected(null); }}
          >
            <Share2 className="w-3.5 h-3.5" /> Share Link
          </button>
        </div>

        <div className="space-y-4 py-1">
          {dialogMode === "open" ? (
            /* Open challenge — game settings only */
            <div className="space-y-3">
              {/* Game type */}
              <div className="grid grid-cols-2 gap-2">
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
              <div className="grid grid-cols-2 gap-2">
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
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<GameType>("sudoku");
  const [shareSheetData, setShareSheetData] = useState<{ token: string; label: string } | null>(null);

  const handleShare = useCallback((token: string, label: string) => {
    setShareSheetData({ token, label });
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

  if (!profileId) {
    return (
      <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
        <div className="space-y-1 bg-card rounded-2xl px-5 py-4 border border-border">
          <h1 className="text-3xl font-serif font-bold tracking-tight">
            Challenges
          </h1>
        </div>
        <Card>
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-3 text-center">
            <Swords className="w-10 h-10 text-muted-foreground/40" />
            <p className="font-medium">Sign in to challenge other players</p>
            <Button onClick={() => setLocation("/sign-in")}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = activeTab === "sudoku" ? challengesLoading : duelsLoading;

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
      <div className="font-size-mobile-safe flex items-center justify-between gap-3 bg-card rounded-2xl px-5 py-4 border border-border">
        <div className="space-y-0.5 min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight leading-tight">
            Challenges
          </h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Beat your opponent's score to win 10 gems.
          </p>
        </div>
        <div className="font-size-mobile-actions flex items-center gap-1.5 shrink-0">
          <Link
            href="/sudoku"
            className="inline-flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-border bg-card text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors"
            title="Play Sudoku"
          >
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Sudoku</span>
          </Link>
          <Link
            href="/memory"
            className="inline-flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-border bg-card text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors"
            title="Play Memory"
          >
            <Brain className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Memory</span>
          </Link>
          <Button size="sm" className="gap-1.5" onClick={() => setShowNew(true)}>
            <Swords className="w-4 h-4" />
            Challenge
          </Button>
        </div>
      </div>

      {/* Game type tabs */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border">
        <button
          onClick={() => setActiveTab("sudoku")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === "sudoku" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
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
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === "memory" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
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
                <Button className="mt-2 gap-2" onClick={() => setShowNew(true)}>
                  <Swords className="w-4 h-4" /> Send your first challenge
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
                  onClick={() => setShowNew(true)}
                >
                  <Brain className="w-4 h-4" /> Send a memory duel
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <NewChallengeDialog
        open={showNew}
        onClose={() => setShowNew(false)}
        myProfileId={profileId}
        gameMode={gameMode}
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
