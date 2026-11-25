import React, { useState, useCallback, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
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
import { Swords, Trophy, Clock, Search, Gem, CircleCheck as CheckCircle2, Circle as XCircle, Loader as Loader2, ChevronRight, Crown, Minus, Brain, Grid3x3, Puzzle, RotateCcw, Share2, Copy, Check, ExternalLink, Link as LinkIcon, Bomb, Box, Images, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { showEventModal } from "@/hooks/use-event-modal";
import { LevelBadge } from "@/components/level-badge";
import { usePageMeta } from "@/components/page-meta";
import { MobileContentDisclosure } from "@/components/mobile-content-disclosure";
import { shareOrDownloadShareCard } from "@/lib/share-card";
import { ShareCardPreview } from "@/components/share-card-preview";
import { challengeInviteUrl } from "@/lib/app-links";
import { WORD_SEARCH_LEVELS, WORD_SEARCH_THEMES, type WordSearchDifficulty, type WordSearchTheme } from "@/lib/word-search";
import { MINESWEEPER_LEVELS, type MinesweeperDifficulty } from "@/lib/minesweeper";
import { SLIDE_PUZZLE_LEVELS, SLIDE_PUZZLE_TILE_STYLES, type SlidePuzzleDifficulty, type SlidePuzzleTileStyle } from "@/lib/slide-puzzle";
import { GAME_2048_LEVELS, type Game2048Difficulty } from "@/lib/game-2048";
import { JUMBLE_LEVELS, type JumbleDifficulty } from "@/lib/jumble-words";
import { SNAKE_LEVELS, type SnakeDifficulty } from "@/lib/snake";
import { ODD_IMAGE_LEVELS, ODD_IMAGE_LEVEL_ORDER, type OddImageLevel } from "@/lib/odd-images";
import { RUBIKS_LEVELS, RUBIKS_VISIBLE, isRubiksPuzzle, levelForPuzzle, type RubiksPuzzle } from "@/lib/rubiks";
import { QUIZ_LEVELS, QUIZ_SUBJECTS, quizGameId, quizSubjectForGameId, isQuizSubject, type QuizGameId, type QuizLevel, type QuizSubject } from "@/lib/quiz";
import { IMAGE_THEMES } from "@/lib/themes";
import { GAME_ICONS, gameIconColor } from "@/lib/game-icons";

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard" | "expert";
type SudokuGridSize = 3 | 4 | 6 | 9 | 16;
type MemoryGridSize = 2 | 4 | 6 | 8;
type JigsawGridSize = 2 | 3 | 4 | 5;
type JigsawLevel = 1 | 2 | 3;
type ChallengeStatus = "pending" | "accepted" | "declined" | "completed" | "expired";
type GameType = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "snake" | "odd-images" | "rubiks" | QuizGameId;
type ChallengeTab = "recent" | GameType;

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

interface MinesweeperChallengeDetail {
  id: number; challengerId: number; challengedId: number; difficulty: MinesweeperDifficulty; seed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null; createdAt: string; gameId?: number;
}

interface SlidePuzzleChallengeDetail {
  id: number; challengerId: number; challengedId: number; difficulty: SlidePuzzleDifficulty;
  tileStyle: SlidePuzzleTileStyle; themeId: string | null; seed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
  createdAt: string; gameId?: number;
}

interface Game2048ChallengeDetail {
  id: number; challengerId: number; challengedId: number; difficulty: Game2048Difficulty; size: number; seed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null;
  challengerScore: number | null; challengedScore: number | null;
  challengerMaxTile: number | null; challengedMaxTile: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
  createdAt: string; gameId?: number;
}

interface JumbleChallengeDetail {
  id: number; challengerId: number; challengedId: number; difficulty: JumbleDifficulty; questions: number; seed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null;
  challengerScore: number | null; challengedScore: number | null;
  challengerCorrect: number | null; challengedCorrect: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
  createdAt: string; expiresAt?: string; gameId?: number;
}

interface SnakeChallengeDetail {
  id: number; challengerId: number; challengedId: number; difficulty: SnakeDifficulty; seed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null;
  challengerScore: number | null; challengedScore: number | null;
  challengerFoodEaten: number | null; challengedFoodEaten: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
  createdAt: string; expiresAt?: string; gameId?: number;
}

interface OddImageChallengeDetail {
  id: number; challengerId: number; challengedId: number; level: OddImageLevel; theme: string; seed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
  challengerCorrect: number | null; challengerQuestions: number | null;
  challengedCorrect: number | null; challengedQuestions: number | null;
  createdAt: string; expiresAt: string; gameId?: number;
}

interface RubiksChallengeDetail {
  id: number; challengerId: number; challengedId: number; puzzle: RubiksPuzzle; scrambleSeed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
  createdAt: string; gameId?: number;
}

interface QuizChallengeDetail {
  id: number; challengerId: number; challengedId: number; subject: QuizSubject; level: QuizLevel; seed: number;
  status: ChallengeStatus; challengerGameId: number | null; challengedGameId: number | null; winnerId: number | null;
  challengerUsername: string; challengedUsername: string; challengerAvatar: string | null; challengedAvatar: string | null;
  challengerXp: number; challengedXp: number; challengerPoints: number | null; challengedPoints: number | null;
  challengerCorrect: number | null; challengerQuestions: number | null;
  challengedCorrect: number | null; challengedQuestions: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
  createdAt: string; gameId?: number;
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
  2: "Easy · 2×4",
  4: "Medium · 4×4",
  6: "Hard · 8×4",
  8: "Expert · 8×8",
};

const JIGSAW_GRID_LABELS: Record<number, string> = {
  2: "Easy · 2×2",
  3: "Medium · 3×3",
  4: "Hard · 4×4",
  5: "Expert · 5×5",
};

const JIGSAW_LEVEL_LABELS: Record<number, string> = {
  1: "Guided",
  2: "Assisted",
  3: "Challenging",
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
            Anyone can accept an open challenge link. A challenge sent to a specific player can only be accepted by that player. Unaccepted challenges expire after 7 days and disappear from the list 7 days later. Accepted challenges that are still unfinished expire 14 days after being sent and disappear; completed challenges stay visible.
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

function MinesweeperChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: MinesweeperChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: MinesweeperChallengeDetail) => void; onRematch?: (challenge: MinesweeperChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const level = MINESWEEPER_LEVELS[challenge.difficulty];
  return <Card className="hover:shadow-md transition-shadow border-emerald-200/70 dark:border-emerald-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">Minesweeper</Badge><span className="text-xs capitalize text-muted-foreground">{level.label} · {level.size}×{level.size} · {level.mines} mines</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}{challenge.status === "completed" && onRematch && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onRematch(challenge)}><RotateCcw className="h-3 w-3"/> Rematch</Button>}</div>
  </div></CardContent></Card>;
}

function SlidePuzzleChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: SlidePuzzleChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: SlidePuzzleChallengeDetail) => void; onRematch?: (challenge: SlidePuzzleChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const level = SLIDE_PUZZLE_LEVELS[challenge.difficulty];
  const styleLabel = SLIDE_PUZZLE_TILE_STYLES.find((style) => style.id === challenge.tileStyle)?.label ?? challenge.tileStyle;
  return <Card className="hover:shadow-md transition-shadow border-sky-200/70 dark:border-sky-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-sky-200 bg-sky-100 text-sky-700">Slide Puzzle</Badge><span className="text-xs capitalize text-muted-foreground">{level.label} · {level.size}×{level.size} · {styleLabel}</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}{challenge.status === "completed" && onRematch && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onRematch(challenge)}><RotateCcw className="h-3 w-3"/> Rematch</Button>}</div>
  </div></CardContent></Card>;
}

function Game2048ChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: Game2048ChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: Game2048ChallengeDetail) => void; onRematch?: (challenge: Game2048ChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myMaxTile = isChallenger ? challenge.challengerMaxTile : challenge.challengedMaxTile;
  const otherMaxTile = isChallenger ? challenge.challengedMaxTile : challenge.challengerMaxTile;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const level = GAME_2048_LEVELS[challenge.difficulty];
  return <Card className="hover:shadow-md transition-shadow border-orange-200/70 dark:border-orange-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-orange-200 bg-orange-100 text-orange-700">2048</Badge><span className="text-xs capitalize text-muted-foreground">{level.label} · {level.size}×{level.size} · target {level.targetTile}</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}{myMaxTile != null ? ` (tile ${myMaxTile})` : ""}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}{otherMaxTile != null ? ` (tile ${otherMaxTile})` : ""}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}{challenge.status === "completed" && onRematch && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onRematch(challenge)}><RotateCcw className="h-3 w-3"/> Rematch</Button>}</div>
  </div></CardContent></Card>;
}

function JumbleChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: JumbleChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: JumbleChallengeDetail) => void; onRematch?: (challenge: JumbleChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myCorrect = isChallenger ? challenge.challengerCorrect : challenge.challengedCorrect;
  const otherCorrect = isChallenger ? challenge.challengedCorrect : challenge.challengerCorrect;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const level = JUMBLE_LEVELS[challenge.difficulty];
  return <Card className="hover:shadow-md transition-shadow border-cyan-200/70 dark:border-cyan-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-cyan-200 bg-cyan-100 text-cyan-700">Jumble Words</Badge><span className="text-xs capitalize text-muted-foreground">{level.label} · {challenge.questions || level.questions} words</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}{myCorrect != null ? ` (${myCorrect}/${challenge.questions || level.questions})` : ""}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}{otherCorrect != null ? ` (${otherCorrect}/${challenge.questions || level.questions})` : ""}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}{challenge.status === "completed" && onRematch && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onRematch(challenge)}><RotateCcw className="h-3 w-3"/> Rematch</Button>}</div>
  </div></CardContent></Card>;
}

function SnakeChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: SnakeChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: SnakeChallengeDetail) => void; onRematch?: (challenge: SnakeChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myFood = isChallenger ? challenge.challengerFoodEaten : challenge.challengedFoodEaten;
  const otherFood = isChallenger ? challenge.challengedFoodEaten : challenge.challengerFoodEaten;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const level = SNAKE_LEVELS[challenge.difficulty];
  return <Card className="hover:shadow-md transition-shadow border-green-200/70 dark:border-green-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-green-200 bg-green-100 text-green-700">Snake</Badge><span className="text-xs capitalize text-muted-foreground">{level.label} · {level.gridSize}×{level.gridSize} · endless apples</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}{myFood != null ? ` (${myFood} food)` : ""}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}{otherFood != null ? ` (${otherFood} food)` : ""}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}{challenge.status === "completed" && onRematch && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onRematch(challenge)}><RotateCcw className="h-3 w-3"/> Rematch</Button>}</div>
  </div></CardContent></Card>;
}

function OddImageChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: OddImageChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: OddImageChallengeDetail) => void; onRematch?: (challenge: OddImageChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myCorrect = isChallenger ? challenge.challengerCorrect : challenge.challengedCorrect;
  const myQuestions = isChallenger ? challenge.challengerQuestions : challenge.challengedQuestions;
  const otherCorrect = isChallenger ? challenge.challengedCorrect : challenge.challengerCorrect;
  const otherQuestions = isChallenger ? challenge.challengedQuestions : challenge.challengerQuestions;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const level = ODD_IMAGE_LEVELS[challenge.level];
  const themeLabel = IMAGE_THEMES.find((theme) => theme.id === challenge.theme)?.name ?? challenge.theme;
  return <Card className="hover:shadow-md transition-shadow border-teal-200/70 dark:border-teal-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-teal-200 bg-teal-100 text-teal-700">Odd Images</Badge><span className="text-xs capitalize text-muted-foreground">{level.label} · {level.gridSize}×{level.gridSize} · {level.questions} questions · {themeLabel}</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}{myCorrect != null && myQuestions ? ` (${myCorrect}/${myQuestions})` : ""}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}{otherCorrect != null && otherQuestions ? ` (${otherCorrect}/${otherQuestions})` : ""}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}{challenge.status === "completed" && onRematch && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onRematch(challenge)}><RotateCcw className="h-3 w-3"/> Rematch</Button>}</div>
  </div></CardContent></Card>;
}

function RubiksChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: RubiksChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: RubiksChallengeDetail) => void; onRematch?: (challenge: RubiksChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const level = levelForPuzzle(challenge.puzzle);
  const puzzleLabel = RUBIKS_LEVELS.find((l) => l.puzzle === challenge.puzzle)?.name ?? challenge.puzzle;
  return <Card className="hover:shadow-md transition-shadow border-rose-200/70 dark:border-rose-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-rose-200 bg-rose-100 text-rose-700">Rubik's Cube</Badge><span className="text-xs capitalize text-muted-foreground">{level} · {puzzleLabel}</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}{challenge.status === "completed" && onRematch && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onRematch(challenge)}><RotateCcw className="h-3 w-3"/> Rematch</Button>}</div>
  </div></CardContent></Card>;
}

function QuizChallengeCard({ challenge, myProfileId, onAccept, onDecline, onPlay, onRematch, isResponding }: {
  challenge: QuizChallengeDetail; myProfileId: number; onAccept: (id: number) => void; onDecline: (id: number) => void;
  onPlay: (challenge: QuizChallengeDetail) => void; onRematch?: (challenge: QuizChallengeDetail) => void; isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const avatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const xp = isChallenger ? challenge.challengedXp : challenge.challengerXp;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const otherPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myCorrect = isChallenger ? challenge.challengerCorrect : challenge.challengedCorrect;
  const myQuestions = isChallenger ? challenge.challengerQuestions : challenge.challengedQuestions;
  const otherCorrect = isChallenger ? challenge.challengedCorrect : challenge.challengerCorrect;
  const otherQuestions = isChallenger ? challenge.challengedQuestions : challenge.challengerQuestions;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
  const isWinner = challenge.winnerId === myProfileId;
  const isTie = challenge.status === "completed" && challenge.winnerId === null;
  const subject = QUIZ_SUBJECTS[challenge.subject] ?? QUIZ_SUBJECTS.science;
  const level = QUIZ_SUBJECTS[challenge.subject]?.levels[challenge.level] ?? QUIZ_SUBJECTS.science.levels[challenge.level];
  return <Card className="hover:shadow-md transition-shadow border-violet-200/70 dark:border-violet-800/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3"><Avatar src={avatar} name={opponent} size={10}/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{opponent}</p><LevelBadge xp={xp} size="xs"/>{challenge.status === "completed" && <span className={`flex items-center gap-1 text-xs font-bold ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>{isWinner ? <><Crown className="h-3 w-3"/> Won +10 💎</> : isTie ? <><Minus className="h-3 w-3"/> Tie +2 💎</> : <><XCircle className="h-3 w-3"/> Lost</>}</span>}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2"><Badge className="border-violet-200 bg-violet-100 text-violet-700">{subject.emoji} {subject.name}</Badge><span className="text-xs capitalize text-muted-foreground">{level.label} · {level.detail}</span><span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span><span className="text-[10px] text-muted-foreground italic">{isChallenger ? "You challenged" : "Challenged you"}</span></div>
      {(challenge.status === "accepted" || challenge.status === "completed" || myPoints !== null) && <div className="mt-2 flex items-center gap-3 text-xs"><span className="text-muted-foreground">You: <b className="text-foreground">{myPoints?.toLocaleString() ?? "—"}{myCorrect != null && myQuestions ? ` (${myCorrect}/${myQuestions})` : ""}</b></span><span className="text-muted-foreground">Them: <b className="text-foreground">{otherPoints?.toLocaleString() ?? "—"}{otherCorrect != null && otherQuestions ? ` (${otherCorrect}/${otherQuestions})` : ""}</b></span></div>}
    </div></div>
    <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={challenge.status}/>{challenge.status === "pending" && !isChallenger && <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50" onClick={() => onDecline(challenge.id)} disabled={isResponding}>Decline</Button><Button size="sm" className="h-7 text-xs" onClick={() => onAccept(challenge.id)} disabled={isResponding}>Accept</Button></div>}{myGameId && (challenge.status === "accepted" || (challenge.status === "pending" && isChallenger)) && <Button size="sm" variant={challenge.status === "pending" ? "outline" : "default"} className="h-7 gap-1 text-xs" onClick={() => onPlay(challenge)}>{myPoints !== null ? "View" : challenge.status === "pending" ? "Play now" : "Play"}<ChevronRight className="h-3 w-3"/></Button>}{challenge.status === "completed" && onRematch && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onRematch(challenge)}><RotateCcw className="h-3 w-3"/> Rematch</Button>}</div>
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
  minesweeperDifficulty?: MinesweeperDifficulty;
  slidePuzzleDifficulty?: SlidePuzzleDifficulty;
  slidePuzzleTileStyle?: SlidePuzzleTileStyle;
  slidePuzzleThemeId?: string | null;
  game2048Difficulty?: Game2048Difficulty;
  jumbleDifficulty?: JumbleDifficulty;
  snakeDifficulty?: SnakeDifficulty;
  oddImageLevel?: OddImageLevel;
  oddImageTheme?: string;
  quizSubject?: QuizSubject;
  quizLevel?: QuizLevel;
  rubiksPuzzle?: RubiksPuzzle;
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
  { value: 2, label: 'Easy · 2×4 · 4 pairs' },
  { value: 4, label: 'Medium · 4×4 · 8 pairs' },
  { value: 6, label: 'Hard · 8×4 · 16 pairs' },
  { value: 8, label: 'Expert · 8×8 · 32 pairs' },
];

const JIGSAW_SIZE_OPTIONS: { value: JigsawGridSize; label: string }[] = [
  { value: 2, label: 'Easy · 2×2 · 4 pieces' },
  { value: 3, label: 'Medium · 3×3 · 9 pieces' },
  { value: 4, label: 'Hard · 4×4 · 16 pieces' },
  { value: 5, label: 'Expert · 5×5 · 25 pieces' },
];

const JIGSAW_LEVEL_OPTIONS: { value: JigsawLevel; label: string }[] = [
  { value: 1, label: 'Guided' },
  { value: 2, label: 'Assisted' },
  { value: 3, label: 'Challenging' },
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
  const minesweeperLevels = (Object.keys(MINESWEEPER_LEVELS) as MinesweeperDifficulty[]).filter((level) => gameMode === "children" ? MINESWEEPER_LEVELS[level].mode === "baby" : gameMode === "adult" ? MINESWEEPER_LEVELS[level].mode === "adult" : true);
  const slidePuzzleLevels = (Object.keys(SLIDE_PUZZLE_LEVELS) as SlidePuzzleDifficulty[]).filter((level) => gameMode === "children" ? SLIDE_PUZZLE_LEVELS[level].mode === "baby" : gameMode === "adult" ? SLIDE_PUZZLE_LEVELS[level].mode === "adult" : true);
  const game2048Levels = (Object.keys(GAME_2048_LEVELS) as Game2048Difficulty[]).filter((level) => gameMode === "children" ? GAME_2048_LEVELS[level].mode === "baby" : gameMode === "adult" ? GAME_2048_LEVELS[level].mode === "adult" : true);
  const jumbleLevels = (Object.keys(JUMBLE_LEVELS) as JumbleDifficulty[]).filter((level) => gameMode === "children" ? JUMBLE_LEVELS[level].mode === "baby" : gameMode === "adult" ? JUMBLE_LEVELS[level].mode === "adult" : true);
  const snakeLevels = (Object.keys(SNAKE_LEVELS) as SnakeDifficulty[]).filter((level) => gameMode === "children" ? SNAKE_LEVELS[level].mode === "baby" : gameMode === "adult" ? SNAKE_LEVELS[level].mode === "adult" : true);
  const oddImageLevels = ODD_IMAGE_LEVEL_ORDER.filter((level) => gameMode === "children" ? ODD_IMAGE_LEVELS[level].mode === "baby" : gameMode === "adult" ? ODD_IMAGE_LEVELS[level].mode === "adult" : true);
  const quizGameSubject = quizSubjectForGameId(gameType);
  const quizSubject: QuizSubject = quizGameSubject ?? "science";
  const quizLevels = QUIZ_LEVELS.filter((level) => gameMode === "children" ? QUIZ_SUBJECTS[quizSubject].levels[level].mode === "baby" : gameMode === "adult" ? QUIZ_SUBJECTS[quizSubject].levels[level].mode === "adult" : true);
  const defaultSudokuSize = sudokuSizes[0]?.value ?? 9;
  const defaultMemorySize = memorySizes[0]?.value ?? 4;
  const defaultJigsawSize = jigsawSizes[0]?.value ?? 2;
  const defaultDiff = diffs[0]?.value ?? 'medium';
  const defaultJigsawLevel: JigsawLevel = 1;
  const defaultJigsawImageKey = 1;
  const defaultWordSearchDifficulty = wordSearchLevels[0] ?? "beginner";
  const defaultMinesweeperDifficulty = minesweeperLevels[0] ?? "beginner";
  const defaultSlidePuzzleDifficulty = slidePuzzleLevels[0] ?? "3x3";
  const defaultGame2048Difficulty = game2048Levels[0] ?? "4x4";
  const defaultJumbleDifficulty: JumbleDifficulty = jumbleLevels[0] ?? "medium";
  const defaultSnakeDifficulty: SnakeDifficulty = snakeLevels[0] ?? "classic";
  const defaultOddImageLevel: OddImageLevel = oddImageLevels[0] ?? "easy";
  const defaultQuizLevel: QuizLevel = "easy";
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDiff);
  const [sudokuGridSize, setSudokuGridSize] = useState<SudokuGridSize>(defaultSudokuSize);
  const [memoryGridSize, setMemoryGridSize] = useState<MemoryGridSize>(defaultMemorySize);
  const [jigsawGridSize, setJigsawGridSize] = useState<JigsawGridSize>(defaultJigsawSize);
  const [jigsawLevel, setJigsawLevel] = useState<JigsawLevel>(defaultJigsawLevel);
  const [jigsawImageKey, setJigsawImageKey] = useState<number>(defaultJigsawImageKey);
  const [wordSearchDifficulty, setWordSearchDifficulty] = useState<WordSearchDifficulty>(defaultWordSearchDifficulty);
  const [wordSearchTheme, setWordSearchTheme] = useState<WordSearchTheme>("animals");
  const [minesweeperDifficulty, setMinesweeperDifficulty] = useState<MinesweeperDifficulty>(defaultMinesweeperDifficulty);
  const [slidePuzzleDifficulty, setSlidePuzzleDifficulty] = useState<SlidePuzzleDifficulty>(defaultSlidePuzzleDifficulty);
  const [slidePuzzleTileStyle, setSlidePuzzleTileStyle] = useState<SlidePuzzleTileStyle>("numbers");
  const [slidePuzzleThemeId, setSlidePuzzleThemeId] = useState<string | null>(null);
  const [game2048Difficulty, setGame2048Difficulty] = useState<Game2048Difficulty>(defaultGame2048Difficulty);
  const [jumbleDifficulty, setJumbleDifficulty] = useState<JumbleDifficulty>(defaultJumbleDifficulty);
  const [snakeDifficulty, setSnakeDifficulty] = useState<SnakeDifficulty>(defaultSnakeDifficulty);
  const [oddImageLevel, setOddImageLevel] = useState<OddImageLevel>(defaultOddImageLevel);
  const [oddImageTheme, setOddImageTheme] = useState<string>("shapes");
  const [quizLevel, setQuizLevel] = useState<QuizLevel>(defaultQuizLevel);
  const [rubiksPuzzle, setRubiksPuzzle] = useState<RubiksPuzzle>("3x3");

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
      if (initialData.minesweeperDifficulty && minesweeperLevels.includes(initialData.minesweeperDifficulty)) setMinesweeperDifficulty(initialData.minesweeperDifficulty);
      if (initialData.slidePuzzleDifficulty && slidePuzzleLevels.includes(initialData.slidePuzzleDifficulty)) setSlidePuzzleDifficulty(initialData.slidePuzzleDifficulty);
      if (initialData.slidePuzzleTileStyle) setSlidePuzzleTileStyle(initialData.slidePuzzleTileStyle);
      if (initialData.slidePuzzleThemeId !== undefined) setSlidePuzzleThemeId(initialData.slidePuzzleThemeId);
      if (initialData.game2048Difficulty && game2048Levels.includes(initialData.game2048Difficulty)) setGame2048Difficulty(initialData.game2048Difficulty);
      if (initialData.jumbleDifficulty && jumbleLevels.includes(initialData.jumbleDifficulty)) setJumbleDifficulty(initialData.jumbleDifficulty);
      if (initialData.snakeDifficulty && snakeLevels.includes(initialData.snakeDifficulty)) setSnakeDifficulty(initialData.snakeDifficulty);
      if (initialData.oddImageLevel && oddImageLevels.includes(initialData.oddImageLevel)) setOddImageLevel(initialData.oddImageLevel);
      if (initialData.oddImageTheme) setOddImageTheme(initialData.oddImageTheme);
      if (initialData.quizSubject) setGameType(quizGameId(initialData.quizSubject));
      if (initialData.quizLevel) setQuizLevel(initialData.quizLevel);
      if (initialData.rubiksPuzzle && isRubiksPuzzle(initialData.rubiksPuzzle)) setRubiksPuzzle(initialData.rubiksPuzzle);
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

  const createMinesweeperMutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; difficulty: MinesweeperDifficulty }) =>
      customFetch<MinesweeperChallengeDetail>("/api/minesweeper-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["minesweeper-challenges"] });
      toast.success(`Minesweeper challenge sent to ${selected?.username}!`, { description: "Clear the shared minefield while they decide." });
      onClose();
      if (challenge.gameId) setLocation(`/minesweeper?start=1&gameId=${challenge.gameId}&challengeId=${challenge.id}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
    },
    onError: () => toast.error("Failed to send Minesweeper challenge"),
  });

  const createSlidePuzzleMutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; difficulty: SlidePuzzleDifficulty; tileStyle: SlidePuzzleTileStyle; themeId?: string | null }) =>
      customFetch<SlidePuzzleChallengeDetail>("/api/slide-puzzle-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["slide-puzzle-challenges"] });
      toast.success(`Slide Puzzle challenge sent to ${selected?.username}!`, { description: "Solve the shared scramble while they decide." });
      onClose();
      if (challenge.gameId) {
        const theme = challenge.themeId ? `&theme=${encodeURIComponent(challenge.themeId)}` : "";
        setLocation(`/slide-puzzle?play=1&challengeId=${challenge.id}&gameId=${challenge.gameId}&difficulty=${challenge.difficulty}&style=${challenge.tileStyle}${theme}&seed=${challenge.seed}`);
      }
    },
    onError: () => toast.error("Failed to send Slide Puzzle challenge"),
  });

  const createGame2048Mutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; difficulty: Game2048Difficulty }) =>
      customFetch<Game2048ChallengeDetail>("/api/game-2048-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["game-2048-challenges"] });
      toast.success(`2048 challenge sent to ${selected?.username}!`, { description: "Merge tiles on the shared board while they decide." });
      onClose();
      if (challenge.gameId) {
        setLocation(`/game-2048?play=1&challengeId=${challenge.id}&gameId=${challenge.gameId}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
      }
    },
    onError: () => toast.error("Failed to send 2048 challenge"),
  });

  const createJumbleMutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; difficulty: JumbleDifficulty }) =>
      customFetch<JumbleChallengeDetail>("/api/jumble-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["jumble-challenges"] });
      toast.success(`Jumble Words challenge sent to ${selected?.username}!`, { description: "Unscramble the shared words while they decide." });
      onClose();
      if (challenge.gameId) {
        setLocation(`/jumble?play=1&challengeId=${challenge.id}&gameId=${challenge.gameId}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
      }
    },
    onError: () => toast.error("Failed to send Jumble Words challenge"),
  });

  const createSnakeMutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; difficulty: SnakeDifficulty }) =>
      customFetch<SnakeChallengeDetail>("/api/snake-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["snake-challenges"] });
      toast.success(`Snake challenge sent to ${selected?.username}!`, { description: "Eat the same food while they decide." });
      onClose();
      if (challenge.gameId) {
        setLocation(`/snake?play=1&challengeId=${challenge.id}&gameId=${challenge.gameId}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
      }
    },
    onError: () => toast.error("Failed to send Snake challenge"),
  });

  const createOddImageMutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; level: OddImageLevel; theme: string }) =>
      customFetch<OddImageChallengeDetail>("/api/odd-image-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["odd-image-challenges"] });
      toast.success(`Odd Images challenge sent to ${selected?.username}!`, { description: "Find the shared odd images while they decide." });
      onClose();
      if (challenge.gameId) {
        setLocation(`/odd-images?play=1&challengeId=${challenge.id}&gameId=${challenge.gameId}&level=${challenge.level}&theme=${encodeURIComponent(challenge.theme)}&seed=${challenge.seed}`);
      }
    },
    onError: () => toast.error("Failed to send Odd Images challenge"),
  });

  const createRubiksMutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; puzzle: RubiksPuzzle }) =>
      customFetch<RubiksChallengeDetail>("/api/rubiks-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["rubiks-challenges"] });
      toast.success(`Rubik's Cube challenge sent to ${selected?.username}!`, { description: "Solve the shared scramble while they decide." });
      onClose();
      setLocation(`/rubiks?challengeId=${challenge.id}`);
    },
    onError: () => toast.error("Failed to send Rubik's Cube challenge"),
  });

  const createQuizMutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; subject: QuizSubject; level: QuizLevel }) =>
      customFetch<QuizChallengeDetail>("/api/quiz-challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-challenges"] });
      toast.success(`${QUIZ_SUBJECTS[challenge.subject]?.name ?? "Quiz"} challenge sent to ${selected?.username}!`, { description: "Answer the shared quiz while they decide." });
      onClose();
      if (challenge.gameId) {
        setLocation(`/quiz/${challenge.subject}?play=1&challengeId=${challenge.id}&gameId=${challenge.gameId}&level=${challenge.level}&seed=${challenge.seed}`);
      }
    },
    onError: () => toast.error("Failed to send Quiz challenge"),
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
    } else if (gameType === "word-search") {
      createWordSearchMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: wordSearchDifficulty, theme: wordSearchTheme });
    } else if (gameType === "minesweeper") {
      createMinesweeperMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: minesweeperDifficulty });
    } else if (gameType === "slide-puzzle") {
      const validDifficulty = slidePuzzleLevels.includes(slidePuzzleDifficulty) ? slidePuzzleDifficulty : (slidePuzzleLevels[0] ?? "3x3");
      createSlidePuzzleMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: validDifficulty, tileStyle: slidePuzzleTileStyle, themeId: slidePuzzleTileStyle === "icons" ? slidePuzzleThemeId ?? "shapes" : null });
    } else if (gameType === "game-2048") {
      const validDifficulty = game2048Levels.includes(game2048Difficulty) ? game2048Difficulty : (game2048Levels[0] ?? "4x4");
      createGame2048Mutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: validDifficulty });
    } else if (gameType === "jumble") {
      const validDifficulty = jumbleLevels.includes(jumbleDifficulty) ? jumbleDifficulty : (jumbleLevels[0] ?? "medium");
      createJumbleMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: validDifficulty });
    } else if (gameType === "snake") {
      const validDifficulty = snakeLevels.includes(snakeDifficulty) ? snakeDifficulty : (snakeLevels[0] ?? "classic");
      createSnakeMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty: validDifficulty });
    } else if (gameType === "odd-images") {
      const validLevel = oddImageLevels.includes(oddImageLevel) ? oddImageLevel : (oddImageLevels[0] ?? "easy");
      createOddImageMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, level: validLevel, theme: oddImageTheme });
    } else if (gameType === "rubiks") {
      createRubiksMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, puzzle: rubiksPuzzle });
    } else if (quizGameSubject) {
      const validLevel = quizLevels.includes(quizLevel) ? quizLevel : (quizLevels[0] ?? "easy");
      createQuizMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, subject: quizGameSubject, level: validLevel });
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
    createSudokuMutation.isPending || createMemoryMutation.isPending || createJigsawMutation.isPending || createWordSearchMutation.isPending || createMinesweeperMutation.isPending || createSlidePuzzleMutation.isPending || createGame2048Mutation.isPending || createJumbleMutation.isPending || createSnakeMutation.isPending || createOddImageMutation.isPending || createQuizMutation.isPending;
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
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Game</label>
                <Select value={gameType} onValueChange={(v) => setGameType(v as GameType)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sudoku">Sudoku</SelectItem>
                    <SelectItem value="memory">Memory Match</SelectItem>
                    <SelectItem value="jigsaw">Jigsaw</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Game</label>
                <Select value={gameType} onValueChange={(value) => setGameType(value as GameType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {([
                      ["sudoku", "Sudoku"],
                      ["memory", "Memory Match"],
                      ["jigsaw", "Jigsaw"],
                      ["word-search", "Word Search"],
                      ["minesweeper", "Minesweeper"],
                      ["slide-puzzle", "Slide Puzzle"],
                      ["game-2048", "2048"],
                      ["jumble", "Jumble Words"],
                      ["snake", "Snake"],
                      ["odd-images", "Odd Images"],
                      ["rubiks", "Rubik's Cube"],
                    ] as const).filter((entry) => RUBIKS_VISIBLE || entry[0] !== "rubiks").map(([id, label]) => {
                      const Icon = GAME_ICONS[id];
                      return <SelectItem key={id} value={id}><span className="flex items-center gap-2"><Icon className={`h-4 w-4 shrink-0 ${gameIconColor(id)}`} />{label}</span></SelectItem>;
                    })}
                    {(Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).map((id) => {
                      const gameId = quizGameId(id);
                      const Icon = GAME_ICONS[gameId];
                      const subject = QUIZ_SUBJECTS[id];
                      return <SelectItem key={gameId} value={gameId}><span className="flex items-center gap-2"><Icon className={`h-4 w-4 shrink-0 ${gameIconColor(gameId)}`} />{subject.name}</span></SelectItem>;
                    })}
                  </SelectContent>
                </Select>
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

              {gameType === "minesweeper" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Board</label>
                  <Select value={minesweeperDifficulty} onValueChange={(value) => setMinesweeperDifficulty(value as MinesweeperDifficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{minesweeperLevels.map((level) => <SelectItem key={level} value={level}>{MINESWEEPER_LEVELS[level].label} · {MINESWEEPER_LEVELS[level].size}×{MINESWEEPER_LEVELS[level].size} · {MINESWEEPER_LEVELS[level].mines} mines</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {gameType === "slide-puzzle" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Board</label>
                    <Select value={slidePuzzleDifficulty} onValueChange={(value) => setSlidePuzzleDifficulty(value as SlidePuzzleDifficulty)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{slidePuzzleLevels.map((level) => <SelectItem key={level} value={level}>{SLIDE_PUZZLE_LEVELS[level].label} · {SLIDE_PUZZLE_LEVELS[level].size}×{SLIDE_PUZZLE_LEVELS[level].size} · {SLIDE_PUZZLE_LEVELS[level].tiles} tiles</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="text-sm font-medium">Tile style</label><Select value={slidePuzzleTileStyle} onValueChange={(value) => setSlidePuzzleTileStyle(value as SlidePuzzleTileStyle)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SLIDE_PUZZLE_TILE_STYLES.map((style) => <SelectItem key={style.id} value={style.id}>{style.label}</SelectItem>)}</SelectContent></Select></div>
                    {slidePuzzleTileStyle === "icons" && <div className="space-y-1.5"><label className="text-sm font-medium">Picture set</label><Select value={slidePuzzleThemeId ?? "shapes"} onValueChange={(value) => setSlidePuzzleThemeId(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{IMAGE_THEMES.map((theme) => <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>)}</SelectContent></Select></div>}
                  </div>
                </div>
              )}

              {gameType === "game-2048" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Board</label>
                  <Select value={game2048Difficulty} onValueChange={(value) => setGame2048Difficulty(value as Game2048Difficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{game2048Levels.map((level) => <SelectItem key={level} value={level}>{GAME_2048_LEVELS[level].label} · {GAME_2048_LEVELS[level].size}×{GAME_2048_LEVELS[level].size} · target {GAME_2048_LEVELS[level].targetTile} · {GAME_2048_LEVELS[level].mode === "baby" ? "Kids" : "Adult"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {gameType === "jumble" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Level</label>
                  <Select value={jumbleDifficulty} onValueChange={(value) => setJumbleDifficulty(value as JumbleDifficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{jumbleLevels.map((level) => <SelectItem key={level} value={level}>{JUMBLE_LEVELS[level].label} · {JUMBLE_LEVELS[level].questions} words · {JUMBLE_LEVELS[level].mode === "baby" ? "Kids" : "Adult"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {gameType === "snake" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Level</label>
                  <Select value={snakeDifficulty} onValueChange={(value) => setSnakeDifficulty(value as SnakeDifficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{snakeLevels.map((level) => <SelectItem key={level} value={level}>{SNAKE_LEVELS[level].label} · {SNAKE_LEVELS[level].gridSize}×{SNAKE_LEVELS[level].gridSize} · endless · {SNAKE_LEVELS[level].mode === "baby" ? "Kids" : "Adult"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {gameType === "odd-images" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Level</label>
                    <Select value={oddImageLevel} onValueChange={(value) => setOddImageLevel(value as OddImageLevel)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{oddImageLevels.map((level) => <SelectItem key={level} value={level}>{ODD_IMAGE_LEVELS[level].label} · {ODD_IMAGE_LEVELS[level].gridSize}×{ODD_IMAGE_LEVELS[level].gridSize} · {ODD_IMAGE_LEVELS[level].questions} questions</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Image set</label>
                    <Select value={oddImageTheme} onValueChange={(value) => setOddImageTheme(value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{IMAGE_THEMES.map((theme) => <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {gameType === "rubiks" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Puzzle</label>
                  <Select value={rubiksPuzzle} onValueChange={(value) => setRubiksPuzzle(value as RubiksPuzzle)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{RUBIKS_LEVELS.map((level) => <SelectItem key={level.puzzle} value={level.puzzle}>{level.name} · {level.puzzle === "pyraminx" ? "Pyramid" : level.puzzle}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {quizGameSubject && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Level · {QUIZ_SUBJECTS[quizGameSubject].emoji} {QUIZ_SUBJECTS[quizGameSubject].name}</label>
                  <Select value={quizLevel} onValueChange={(value) => setQuizLevel(value as QuizLevel)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{quizLevels.map((level) => <SelectItem key={level} value={level}>{QUIZ_SUBJECTS[quizGameSubject].levels[level].label} · {QUIZ_SUBJECTS[quizGameSubject].levels[level].detail}</SelectItem>)}</SelectContent>
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
  const [location, setLocation] = useLocation();
  const queryParams = new URLSearchParams(location.split("?")[1] ?? "");
  const rematchChallengeId = Number(queryParams.get("rematchChallengeId") ?? "");
  const rematchDuelId = Number(queryParams.get("rematchDuelId") ?? "");
  usePageMeta({
    title: "Game Challenges & Duels | Play Brain Games . Online",
    description:
      "Create and join challenges for any of the thirteen games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes — compare scores, and compete with friends.",
    path: "/challenges",
  });
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(useSearch());
  const [showNew, setShowNew] = useState(false);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ChallengeTab>(() => {
    const tab = searchParams.get("tab");
    if (tab === "quiz") {
      const subjectParam = searchParams.get("subject");
      const subject = isQuizSubject(subjectParam) ? subjectParam : "science";
      return quizGameId(subject);
    }
    const quizTabSubject = quizSubjectForGameId(tab);
    if (quizTabSubject) return quizGameId(quizTabSubject);
    return tab === "recent" || tab === "sudoku" || tab === "memory" || tab === "jigsaw" || tab === "word-search" || tab === "minesweeper" || tab === "slide-puzzle" || tab === "game-2048" || tab === "jumble" || tab === "snake" || tab === "odd-images" || tab === "rubiks" ? tab : "recent";
  });
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

  const { data: minesweeperChallenges, isLoading: minesweeperLoading } = useQuery<MinesweeperChallengeDetail[]>({
    queryKey: ["minesweeper-challenges", profileId],
    queryFn: () => customFetch<MinesweeperChallengeDetail[]>(`/api/minesweeper-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: slidePuzzleChallenges, isLoading: slidePuzzleLoading } = useQuery<SlidePuzzleChallengeDetail[]>({
    queryKey: ["slide-puzzle-challenges", profileId],
    queryFn: () => customFetch<SlidePuzzleChallengeDetail[]>(`/api/slide-puzzle-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: game2048Challenges, isLoading: game2048Loading } = useQuery<Game2048ChallengeDetail[]>({
    queryKey: ["game-2048-challenges", profileId],
    queryFn: () => customFetch<Game2048ChallengeDetail[]>(`/api/game-2048-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: jumbleChallenges, isLoading: jumbleLoading } = useQuery<JumbleChallengeDetail[]>({
    queryKey: ["jumble-challenges", profileId],
    queryFn: () => customFetch<JumbleChallengeDetail[]>(`/api/jumble-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: snakeChallenges, isLoading: snakeLoading } = useQuery<SnakeChallengeDetail[]>({
    queryKey: ["snake-challenges", profileId],
    queryFn: () => customFetch<SnakeChallengeDetail[]>(`/api/snake-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: oddImageChallenges, isLoading: oddImageLoading } = useQuery<OddImageChallengeDetail[]>({
    queryKey: ["odd-image-challenges", profileId],
    queryFn: () => customFetch<OddImageChallengeDetail[]>(`/api/odd-image-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: rubiksChallenges, isLoading: rubiksLoading } = useQuery<RubiksChallengeDetail[]>({
    queryKey: ["rubiks-challenges", profileId],
    queryFn: () => customFetch<RubiksChallengeDetail[]>(`/api/rubiks-challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const { data: quizChallenges, isLoading: quizLoading } = useQuery<QuizChallengeDetail[]>({
    queryKey: ["quiz-challenges", profileId],
    queryFn: () => customFetch<QuizChallengeDetail[]>(`/api/quiz-challenges/for/${profileId}`),
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

  const respondMinesweeperMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<MinesweeperChallengeDetail & { gameId?: number }>(`/api/minesweeper-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["minesweeper-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        setLocation(`/minesweeper?start=1&gameId=${result.gameId}&challengeId=${result.id}&difficulty=${result.difficulty}&seed=${result.seed}`);
      } else if (vars.action === "decline") toast("Challenge declined.");
    },
    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondSlidePuzzleMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<SlidePuzzleChallengeDetail & { gameId?: number }>(`/api/slide-puzzle-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["slide-puzzle-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        const theme = result.themeId ? `&theme=${encodeURIComponent(result.themeId)}` : "";
        setLocation(`/slide-puzzle?play=1&challengeId=${result.id}&gameId=${result.gameId}&difficulty=${result.difficulty}&style=${result.tileStyle}${theme}&seed=${result.seed}`);
      } else if (vars.action === "decline") toast("Challenge declined.");
    },
    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondGame2048Mutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<Game2048ChallengeDetail & { gameId?: number }>(`/api/game-2048-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["game-2048-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        setLocation(`/game-2048?play=1&challengeId=${result.id}&gameId=${result.gameId}&difficulty=${result.difficulty}&seed=${result.seed}`);
      } else if (vars.action === "decline") toast("Challenge declined.");
    },
    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondJumbleMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<JumbleChallengeDetail & { gameId?: number }>(`/api/jumble-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["jumble-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        setLocation(`/jumble?play=1&challengeId=${result.id}&gameId=${result.gameId}&difficulty=${result.difficulty}&seed=${result.seed}`);
      } else if (vars.action === "decline") toast("Challenge declined.");
    },
    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondSnakeMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<SnakeChallengeDetail & { gameId?: number }>(`/api/snake-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["snake-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        setLocation(`/snake?play=1&challengeId=${result.id}&gameId=${result.gameId}&difficulty=${result.difficulty}&seed=${result.seed}`);
      } else if (vars.action === "decline") toast("Challenge declined.");
    },
    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondOddImageMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<OddImageChallengeDetail & { gameId?: number }>(`/api/odd-image-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["odd-image-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        setLocation(`/odd-images?play=1&challengeId=${result.id}&gameId=${result.gameId}&level=${result.level}&theme=${encodeURIComponent(result.theme)}&seed=${result.seed}`);
      } else if (vars.action === "decline") toast("Challenge declined.");
    },
    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondRubiksMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<RubiksChallengeDetail & { gameId?: number }>(`/api/rubiks-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["rubiks-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept") {
        setLocation(`/rubiks?challengeId=${result.id}`);
      } else if (vars.action === "decline") toast("Challenge declined.");
    },
    onError: (error: Error) => { setRespondingId(null); toast.error(error.message || "Failed to respond to challenge"); },
  });

  const respondQuizMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) => customFetch<QuizChallengeDetail & { gameId?: number }>(`/api/quiz-challenges/${id}/respond`, { method: "PATCH", data: { profileId, action } }),
    onSuccess: (result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-challenges"] });
      setRespondingId(null);
      if (vars.action === "accept" && result.gameId) {
        setLocation(`/quiz/${result.subject}?play=1&challengeId=${result.id}&gameId=${result.gameId}&level=${result.level}&seed=${result.seed}`);
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

  const handleMinesweeperAccept = useCallback((id: number) => { setRespondingId(id); respondMinesweeperMutation.mutate({ id, action: "accept" }); }, [respondMinesweeperMutation]);
  const handleMinesweeperDecline = useCallback((id: number) => { setRespondingId(id); respondMinesweeperMutation.mutate({ id, action: "decline" }); }, [respondMinesweeperMutation]);
  const handleMinesweeperPlay = useCallback((challenge: MinesweeperChallengeDetail) => {
    const gameId = challenge.challengerId === profileId ? challenge.challengerGameId : challenge.challengedGameId;
    if (gameId) setLocation(`/minesweeper?start=1&gameId=${gameId}&challengeId=${challenge.id}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
  }, [profileId, setLocation]);

  const handleMinesweeperRematch = useCallback((challenge: MinesweeperChallengeDetail) => {
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
      gameType: "minesweeper",
      minesweeperDifficulty: challenge.difficulty,
    });
    setShowNew(true);
  }, [profileId]);

  const handleSlidePuzzleAccept = useCallback((id: number) => { setRespondingId(id); respondSlidePuzzleMutation.mutate({ id, action: "accept" }); }, [respondSlidePuzzleMutation]);
  const handleSlidePuzzleDecline = useCallback((id: number) => { setRespondingId(id); respondSlidePuzzleMutation.mutate({ id, action: "decline" }); }, [respondSlidePuzzleMutation]);
  const handleSlidePuzzlePlay = useCallback((challenge: SlidePuzzleChallengeDetail) => {
    const gameId = challenge.challengerId === profileId ? challenge.challengerGameId : challenge.challengedGameId;
    if (gameId) {
      const theme = challenge.themeId ? `&theme=${encodeURIComponent(challenge.themeId)}` : "";
      setLocation(`/slide-puzzle?play=1&challengeId=${challenge.id}&gameId=${gameId}&difficulty=${challenge.difficulty}&style=${challenge.tileStyle}${theme}&seed=${challenge.seed}`);
    }
  }, [profileId, setLocation]);

  const handleSlidePuzzleRematch = useCallback((challenge: SlidePuzzleChallengeDetail) => {
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
      gameType: "slide-puzzle",
      slidePuzzleDifficulty: challenge.difficulty,
      slidePuzzleTileStyle: challenge.tileStyle,
      slidePuzzleThemeId: challenge.themeId,
    });
    setShowNew(true);
  }, [profileId]);

  const handleGame2048Accept = useCallback((id: number) => { setRespondingId(id); respondGame2048Mutation.mutate({ id, action: "accept" }); }, [respondGame2048Mutation]);
  const handleGame2048Decline = useCallback((id: number) => { setRespondingId(id); respondGame2048Mutation.mutate({ id, action: "decline" }); }, [respondGame2048Mutation]);
  const handleGame2048Play = useCallback((challenge: Game2048ChallengeDetail) => {
    const gameId = challenge.challengerId === profileId ? challenge.challengerGameId : challenge.challengedGameId;
    if (gameId) setLocation(`/game-2048?play=1&challengeId=${challenge.id}&gameId=${gameId}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
  }, [profileId, setLocation]);

  const handleGame2048Rematch = useCallback((challenge: Game2048ChallengeDetail) => {
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
      gameType: "game-2048",
      game2048Difficulty: challenge.difficulty,
    });
    setShowNew(true);
  }, [profileId]);

  const handleJumbleAccept = useCallback((id: number) => { setRespondingId(id); respondJumbleMutation.mutate({ id, action: "accept" }); }, [respondJumbleMutation]);
  const handleJumbleDecline = useCallback((id: number) => { setRespondingId(id); respondJumbleMutation.mutate({ id, action: "decline" }); }, [respondJumbleMutation]);
  const handleJumblePlay = useCallback((challenge: JumbleChallengeDetail) => {
    const gameId = challenge.challengerId === profileId ? challenge.challengerGameId : challenge.challengedGameId;
    if (gameId) setLocation(`/jumble?play=1&challengeId=${challenge.id}&gameId=${gameId}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
  }, [profileId, setLocation]);

  const handleJumbleRematch = useCallback((challenge: JumbleChallengeDetail) => {
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
      gameType: "jumble",
      jumbleDifficulty: challenge.difficulty,
    });
    setShowNew(true);
  }, [profileId]);

  const handleSnakeAccept = useCallback((id: number) => { setRespondingId(id); respondSnakeMutation.mutate({ id, action: "accept" }); }, [respondSnakeMutation]);
  const handleSnakeDecline = useCallback((id: number) => { setRespondingId(id); respondSnakeMutation.mutate({ id, action: "decline" }); }, [respondSnakeMutation]);
  const handleSnakePlay = useCallback((challenge: SnakeChallengeDetail) => {
    const gameId = challenge.challengerId === profileId ? challenge.challengerGameId : challenge.challengedGameId;
    if (gameId) setLocation(`/snake?play=1&challengeId=${challenge.id}&gameId=${gameId}&difficulty=${challenge.difficulty}&seed=${challenge.seed}`);
  }, [profileId, setLocation]);

  const handleSnakeRematch = useCallback((challenge: SnakeChallengeDetail) => {
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
      gameType: "snake",
      snakeDifficulty: challenge.difficulty,
    });
    setShowNew(true);
  }, [profileId]);

  const handleOddImageAccept = useCallback((id: number) => { setRespondingId(id); respondOddImageMutation.mutate({ id, action: "accept" }); }, [respondOddImageMutation]);
  const handleOddImageDecline = useCallback((id: number) => { setRespondingId(id); respondOddImageMutation.mutate({ id, action: "decline" }); }, [respondOddImageMutation]);
  const handleOddImagePlay = useCallback((challenge: OddImageChallengeDetail) => {
    const gameId = challenge.challengerId === profileId ? challenge.challengerGameId : challenge.challengedGameId;
    if (gameId) setLocation(`/odd-images?play=1&challengeId=${challenge.id}&gameId=${gameId}&level=${challenge.level}&theme=${encodeURIComponent(challenge.theme)}&seed=${challenge.seed}`);
  }, [profileId, setLocation]);

  const handleOddImageRematch = useCallback((challenge: OddImageChallengeDetail) => {
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
      gameType: "odd-images",
      oddImageLevel: challenge.level,
      oddImageTheme: challenge.theme,
    });
    setShowNew(true);
  }, [profileId]);

  const handleRubiksAccept = useCallback((id: number) => { setRespondingId(id); respondRubiksMutation.mutate({ id, action: "accept" }); }, [respondRubiksMutation]);
  const handleRubiksDecline = useCallback((id: number) => { setRespondingId(id); respondRubiksMutation.mutate({ id, action: "decline" }); }, [respondRubiksMutation]);
  const handleRubiksPlay = useCallback((challenge: RubiksChallengeDetail) => {
    setLocation(`/rubiks?challengeId=${challenge.id}`);
  }, [setLocation]);

  const handleRubiksRematch = useCallback((challenge: RubiksChallengeDetail) => {
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
      gameType: "rubiks",
      rubiksPuzzle: challenge.puzzle,
    });
    setShowNew(true);
  }, [profileId]);

  const handleQuizAccept = useCallback((id: number) => { setRespondingId(id); respondQuizMutation.mutate({ id, action: "accept" }); }, [respondQuizMutation]);
  const handleQuizDecline = useCallback((id: number) => { setRespondingId(id); respondQuizMutation.mutate({ id, action: "decline" }); }, [respondQuizMutation]);
  const handleQuizPlay = useCallback((challenge: QuizChallengeDetail) => {
    const gameId = challenge.challengerId === profileId ? challenge.challengerGameId : challenge.challengedGameId;
    if (gameId) setLocation(`/quiz/${challenge.subject}?play=1&challengeId=${challenge.id}&gameId=${gameId}&level=${challenge.level}&seed=${challenge.seed}`);
  }, [profileId, setLocation]);

  const handleQuizRematch = useCallback((challenge: QuizChallengeDetail) => {
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
      gameType: quizGameId(challenge.subject),
      quizSubject: challenge.subject,
      quizLevel: challenge.level,
    });
    setShowNew(true);
  }, [profileId]);

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
      (c) => c.status === "completed" || c.status === "declined" || c.status === "expired",
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
    duels?.filter((d) => d.status === "completed" || d.status === "declined" || d.status === "expired") ??
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
      (c) => c.status === "completed" || c.status === "declined" || c.status === "expired",
    ) ?? [];
  const wordSearchPending = wordSearchChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const wordSearchActive = wordSearchChallenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const wordSearchOutgoing = wordSearchChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const wordSearchFinished = wordSearchChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];
  const minesweeperPending = minesweeperChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const minesweeperActive = minesweeperChallenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const minesweeperOutgoing = minesweeperChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const minesweeperFinished = minesweeperChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];
  const slidePuzzlePending = slidePuzzleChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const slidePuzzleActive = slidePuzzleChallenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const slidePuzzleOutgoing = slidePuzzleChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const slidePuzzleFinished = slidePuzzleChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];
  const game2048Pending = game2048Challenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const game2048Active = game2048Challenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const game2048Outgoing = game2048Challenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const game2048Finished = game2048Challenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];
  const jumblePending = jumbleChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const jumbleActive = jumbleChallenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const jumbleOutgoing = jumbleChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const jumbleFinished = jumbleChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];
  const snakePending = snakeChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const snakeActive = snakeChallenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const snakeOutgoing = snakeChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const snakeFinished = snakeChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];
  const oddImagePending = oddImageChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const oddImageActive = oddImageChallenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const oddImageOutgoing = oddImageChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const oddImageFinished = oddImageChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];
  const rubiksPending = rubiksChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const rubiksActive = rubiksChallenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const rubiksOutgoing = rubiksChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const rubiksFinished = rubiksChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];
  const quizPending = quizChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengedId === profileId) ?? [];
  const quizActive = quizChallenges?.filter((challenge) => challenge.status === "accepted") ?? [];
  const quizOutgoing = quizChallenges?.filter((challenge) => challenge.status === "pending" && challenge.challengerId === profileId) ?? [];
  const quizFinished = quizChallenges?.filter((challenge) => challenge.status === "completed" || challenge.status === "declined" || challenge.status === "expired") ?? [];

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
  const minesweeperAlert = minesweeperPending.length + minesweeperActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;
  const slidePuzzleAlert = slidePuzzlePending.length + slidePuzzleActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;
  const game2048Alert = game2048Pending.length + game2048Active.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;
  const jumbleAlert = jumblePending.length + jumbleActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;
  const snakeAlert = snakePending.length + snakeActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;
  const oddImageAlert = oddImagePending.length + oddImageActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length;
  const rubiksAlert = RUBIKS_VISIBLE ? rubiksPending.length + rubiksActive.filter((challenge) => (challenge.challengerId === profileId ? challenge.challengerPoints : challenge.challengedPoints) == null).length : 0;
  const quizAlertFor = (subject: QuizSubject) =>
    quizPending.filter((c) => c.subject === subject).length +
    quizActive.filter((c) => c.subject === subject && (c.challengerId === profileId ? c.challengerPoints : c.challengedPoints) == null).length;
  const quizAlert = (Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).reduce((sum, s) => sum + quizAlertFor(s), 0);
  const totalAlert = sudokuAlert + memoryAlert + jigsawAlert + wordSearchAlert + minesweeperAlert + slidePuzzleAlert + game2048Alert + jumbleAlert + snakeAlert + oddImageAlert + rubiksAlert + quizAlert;

  // Merged cross-game feed for the "Recent" view, newest first.
  const recentItems = [
    ...(challenges ?? []).map((challenge) => ({ game: "sudoku" as const, createdAt: challenge.createdAt, challenge })),
    ...(duels ?? []).map((duel) => ({ game: "memory" as const, createdAt: duel.createdAt, duel })),
    ...(jigsawChallenges ?? []).map((challenge) => ({ game: "jigsaw" as const, createdAt: challenge.createdAt, challenge })),
    ...(wordSearchChallenges ?? []).map((challenge) => ({ game: "word-search" as const, createdAt: challenge.createdAt, challenge })),
    ...(minesweeperChallenges ?? []).map((challenge) => ({ game: "minesweeper" as const, createdAt: challenge.createdAt, challenge })),
    ...(slidePuzzleChallenges ?? []).map((challenge) => ({ game: "slide-puzzle" as const, createdAt: challenge.createdAt, challenge })),
    ...(game2048Challenges ?? []).map((challenge) => ({ game: "game-2048" as const, createdAt: challenge.createdAt, challenge })),
    ...(jumbleChallenges ?? []).map((challenge) => ({ game: "jumble" as const, createdAt: challenge.createdAt, challenge })),
    ...(snakeChallenges ?? []).map((challenge) => ({ game: "snake" as const, createdAt: challenge.createdAt, challenge })),
    ...(oddImageChallenges ?? []).map((challenge) => ({ game: "odd-images" as const, createdAt: challenge.createdAt, challenge })),
    ...(RUBIKS_VISIBLE ? rubiksChallenges ?? [] : []).map((challenge) => ({ game: "rubiks" as const, createdAt: challenge.createdAt, challenge })),
    ...(quizChallenges ?? []).map((challenge) => ({ game: quizGameId(challenge.subject), createdAt: challenge.createdAt, challenge })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);

  const renderRecentCard = (item: (typeof recentItems)[number]) => {
    if (!profileId) return null;
    const responding = "challenge" in item ? respondingId === item.challenge.id : respondingId === item.duel.id;
    switch (item.game) {
      case "sudoku":
        return <ChallengeCard key={`sudoku-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleAccept} onDecline={handleDecline} onPlay={handlePlay} onRematch={handleSudokuRematch} onShare={handleShare} isResponding={responding} />;
      case "memory":
        return <MemoryDuelCard key={`memory-${item.duel.id}`} duel={item.duel} myProfileId={profileId} onAccept={handleDuelAccept} onDecline={handleDuelDecline} onPlay={handleDuelPlay} onRematch={handleMemoryRematch} onShare={handleShare} isResponding={responding} />;
      case "jigsaw":
        return <JigsawChallengeCard key={`jigsaw-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleJigsawAccept} onDecline={handleJigsawDecline} onPlay={handleJigsawPlay} onRematch={handleJigsawRematch} onShare={handleShare} isResponding={responding} />;
      case "word-search":
        return <WordSearchChallengeCard key={`word-search-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleWordSearchAccept} onDecline={handleWordSearchDecline} onPlay={handleWordSearchPlay} isResponding={responding} />;
      case "minesweeper":
        return <MinesweeperChallengeCard key={`minesweeper-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleMinesweeperAccept} onDecline={handleMinesweeperDecline} onPlay={handleMinesweeperPlay} onRematch={handleMinesweeperRematch} isResponding={responding} />;
      case "slide-puzzle":
        return <SlidePuzzleChallengeCard key={`slide-puzzle-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleSlidePuzzleAccept} onDecline={handleSlidePuzzleDecline} onPlay={handleSlidePuzzlePlay} onRematch={handleSlidePuzzleRematch} isResponding={responding} />;
      case "game-2048":
        return <Game2048ChallengeCard key={`game-2048-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleGame2048Accept} onDecline={handleGame2048Decline} onPlay={handleGame2048Play} onRematch={handleGame2048Rematch} isResponding={responding} />;
      case "jumble":
        return <JumbleChallengeCard key={`jumble-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleJumbleAccept} onDecline={handleJumbleDecline} onPlay={handleJumblePlay} onRematch={handleJumbleRematch} isResponding={responding} />;
      case "snake":
        return <SnakeChallengeCard key={`snake-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleSnakeAccept} onDecline={handleSnakeDecline} onPlay={handleSnakePlay} onRematch={handleSnakeRematch} isResponding={responding} />;
      case "odd-images":
        return <OddImageChallengeCard key={`odd-images-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleOddImageAccept} onDecline={handleOddImageDecline} onPlay={handleOddImagePlay} onRematch={handleOddImageRematch} isResponding={responding} />;
      case "rubiks":
        return <RubiksChallengeCard key={`rubiks-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleRubiksAccept} onDecline={handleRubiksDecline} onPlay={handleRubiksPlay} onRematch={handleRubiksRematch} isResponding={responding} />;
      case "science-quiz":
      case "maths-quiz":
      case "gk-quiz":
        return <QuizChallengeCard key={`quiz-${item.challenge.id}`} challenge={item.challenge} myProfileId={profileId} onAccept={handleQuizAccept} onDecline={handleQuizDecline} onPlay={handleQuizPlay} onRematch={handleQuizRematch} isResponding={responding} />;
    }
  };

  // For "Recent", only show the skeleton until at least one game feed has
  // returned data. A single failing/refetching endpoint must not blank the
  // whole merged list every poll cycle.
  const recentHasData =
    challenges != null || duels != null || jigsawChallenges != null ||
    wordSearchChallenges != null || minesweeperChallenges != null ||
    slidePuzzleChallenges != null || game2048Challenges != null || jumbleChallenges != null || snakeChallenges != null || oddImageChallenges != null || rubiksChallenges != null || quizChallenges != null;
  const isLoading = activeTab === "recent"
    ? !recentHasData && (challengesLoading || duelsLoading || jigsawLoading || wordSearchLoading || minesweeperLoading || slidePuzzleLoading || game2048Loading || jumbleLoading || snakeLoading || oddImageLoading || rubiksLoading || quizLoading)
    : activeTab === "sudoku" ? challengesLoading : activeTab === "memory" ? duelsLoading : activeTab === "jigsaw" ? jigsawLoading : activeTab === "word-search" ? wordSearchLoading : activeTab === "minesweeper" ? minesweeperLoading : activeTab === "slide-puzzle" ? slidePuzzleLoading : activeTab === "game-2048" ? game2048Loading : activeTab === "jumble" ? jumbleLoading : activeTab === "snake" ? snakeLoading : activeTab === "odd-images" ? oddImageLoading : activeTab === "rubiks" ? rubiksLoading : quizLoading;

  const activeQuizSubject = quizSubjectForGameId(activeTab);
  const quizTabChallenges = activeQuizSubject ? (quizChallenges ?? []).filter((c) => c.subject === activeQuizSubject) : [];
  const quizTabPending = quizTabChallenges.filter((c) => c.status === "pending" && c.challengedId === profileId);
  const quizTabActive = quizTabChallenges.filter((c) => c.status === "accepted");
  const quizTabOutgoing = quizTabChallenges.filter((c) => c.status === "pending" && c.challengerId === profileId);
  const quizTabFinished = quizTabChallenges.filter((c) => c.status === "completed" || c.status === "declined" || c.status === "expired");
  const activeQuizSubjectConfig = activeQuizSubject ? QUIZ_SUBJECTS[activeQuizSubject] : null;

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
      <div className="font-size-mobile-safe flex items-center justify-between gap-3 bg-card rounded-2xl px-5 py-4 border border-border">
        <div className="space-y-0.5 min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight leading-tight">
            Challenges
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Beat your opponent&apos;s score to win 10 gems. Unaccepted challenges expire after 7 days and disappear 7 days later; accepted but unfinished challenges expire 14 days after being sent.
          </p>
        </div>
        <div className="font-size-mobile-actions flex items-center gap-1.5 shrink-0">
          <Button size="sm" className="gap-1.5" onClick={openNewChallenge}>
            <Swords className="w-4 h-4" />
            Challenge
          </Button>
        </div>
      </div>

      {/* Game selector */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Swords className="h-3.5 w-3.5" /> Challenges
        </span>
        <Select value={activeTab} onValueChange={(value) => setActiveTab(value as ChallengeTab)}>
          <SelectTrigger className="h-9 flex-1 bg-background" aria-label="Challenge game">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent"><span className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-muted-foreground" />Recent{totalAlert > 0 ? ` (${totalAlert})` : ""}</span></SelectItem>
            {([
              ["sudoku", "Sudoku", sudokuAlert],
              ["memory", "Memory Match", memoryAlert],
              ["jigsaw", "Jigsaw", jigsawAlert],
              ["word-search", "Word Search", wordSearchAlert],
              ["minesweeper", "Minesweeper", minesweeperAlert],
              ["slide-puzzle", "Slide Puzzle", slidePuzzleAlert],
              ["game-2048", "2048", game2048Alert],
              ["jumble", "Jumble Words", jumbleAlert],
              ["snake", "Snake", snakeAlert],
              ["odd-images", "Odd Images", oddImageAlert],
              ["rubiks", "Rubik's Cube", rubiksAlert],
            ] as const).filter((entry) => RUBIKS_VISIBLE || entry[0] !== "rubiks").map(([id, label, alert]) => {
              const Icon = GAME_ICONS[id];
              return <SelectItem key={id} value={id}><span className="flex items-center gap-2"><Icon className={`h-4 w-4 shrink-0 ${gameIconColor(id)}`} />{label}{alert > 0 ? ` (${alert})` : ""}</span></SelectItem>;
            })}
            {(Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).map((id) => {
              const gameId = quizGameId(id);
              const Icon = GAME_ICONS[gameId];
              const subject = QUIZ_SUBJECTS[id];
              const alert = quizAlertFor(id);
              return <SelectItem key={gameId} value={gameId}><span className="flex items-center gap-2"><Icon className={`h-4 w-4 shrink-0 ${gameIconColor(gameId)}`} />{subject.shortName}{alert > 0 ? ` (${alert})` : ""}</span></SelectItem>;
            })}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : activeTab === "recent" ? (
        <div className="space-y-3">
          {recentItems.length > 0 ? (
            <>
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 w-fit shadow-sm">
                <Clock className="h-3.5 w-3.5" /> Recent activity ({recentItems.length})
              </h2>
              {recentItems.map((item) => renderRecentCard(item))}
            </>
          ) : (
            <Card>
              <CardContent className="pt-10 pb-10 flex flex-col items-center gap-3 text-center">
                <Swords className="w-12 h-12 text-muted-foreground/30" />
                <p className="font-semibold text-lg">No challenges yet</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Challenge another player in any game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, or the Science, Maths & GK quizzes. Winner takes 10 gems!
                </p>
                <Button className="mt-2 gap-2" onClick={openNewChallenge}>
                  <Swords className="w-4 h-4" /> Send your first challenge
                </Button>
              </CardContent>
            </Card>
          )}
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
      ) : activeTab === "minesweeper" ? (
        <div className="space-y-6">
          {minesweeperPending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({minesweeperPending.length})</h2>{minesweeperPending.map((challenge) => <MinesweeperChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleMinesweeperAccept} onDecline={handleMinesweeperDecline} onPlay={handleMinesweeperPlay} onRematch={handleMinesweeperRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {minesweeperActive.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({minesweeperActive.length})</h2>{minesweeperActive.map((challenge) => <MinesweeperChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleMinesweeperAccept} onDecline={handleMinesweeperDecline} onPlay={handleMinesweeperPlay} onRematch={handleMinesweeperRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {minesweeperOutgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({minesweeperOutgoing.length})</h2>{minesweeperOutgoing.map((challenge) => <MinesweeperChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleMinesweeperAccept} onDecline={handleMinesweeperDecline} onPlay={handleMinesweeperPlay} onRematch={handleMinesweeperRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {minesweeperFinished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{minesweeperFinished.map((challenge) => <MinesweeperChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleMinesweeperAccept} onDecline={handleMinesweeperDecline} onPlay={handleMinesweeperPlay} onRematch={handleMinesweeperRematch} isResponding={false}/>)}</section>}
          {(!minesweeperChallenges || minesweeperChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><Bomb className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Minesweeper challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to clear the same minefield and compare points.</p><Button className="mt-2 gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a Minesweeper challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "slide-puzzle" ? (
        <div className="space-y-6">
          {slidePuzzlePending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({slidePuzzlePending.length})</h2>{slidePuzzlePending.map((challenge) => <SlidePuzzleChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleSlidePuzzleAccept} onDecline={handleSlidePuzzleDecline} onPlay={handleSlidePuzzlePlay} onRematch={handleSlidePuzzleRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {slidePuzzleActive.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({slidePuzzleActive.length})</h2>{slidePuzzleActive.map((challenge) => <SlidePuzzleChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleSlidePuzzleAccept} onDecline={handleSlidePuzzleDecline} onPlay={handleSlidePuzzlePlay} onRematch={handleSlidePuzzleRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {slidePuzzleOutgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({slidePuzzleOutgoing.length})</h2>{slidePuzzleOutgoing.map((challenge) => <SlidePuzzleChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleSlidePuzzleAccept} onDecline={handleSlidePuzzleDecline} onPlay={handleSlidePuzzlePlay} onRematch={handleSlidePuzzleRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {slidePuzzleFinished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{slidePuzzleFinished.map((challenge) => <SlidePuzzleChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleSlidePuzzleAccept} onDecline={handleSlidePuzzleDecline} onPlay={handleSlidePuzzlePlay} onRematch={handleSlidePuzzleRematch} isResponding={false}/>)}</section>}
          {(!slidePuzzleChallenges || slidePuzzleChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><Grid3x3 className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Slide Puzzle challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to solve the same scramble and compare points.</p><Button className="mt-2 gap-2 bg-sky-600 hover:bg-sky-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a Slide Puzzle challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "game-2048" ? (
        <div className="space-y-6">
          {game2048Pending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({game2048Pending.length})</h2>{game2048Pending.map((challenge) => <Game2048ChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleGame2048Accept} onDecline={handleGame2048Decline} onPlay={handleGame2048Play} onRematch={handleGame2048Rematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {game2048Active.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({game2048Active.length})</h2>{game2048Active.map((challenge) => <Game2048ChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleGame2048Accept} onDecline={handleGame2048Decline} onPlay={handleGame2048Play} onRematch={handleGame2048Rematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {game2048Outgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({game2048Outgoing.length})</h2>{game2048Outgoing.map((challenge) => <Game2048ChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleGame2048Accept} onDecline={handleGame2048Decline} onPlay={handleGame2048Play} onRematch={handleGame2048Rematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {game2048Finished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{game2048Finished.map((challenge) => <Game2048ChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleGame2048Accept} onDecline={handleGame2048Decline} onPlay={handleGame2048Play} onRematch={handleGame2048Rematch} isResponding={false}/>)}</section>}
          {(!game2048Challenges || game2048Challenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><Grid3x3 className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No 2048 challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to merge tiles on the same board and compare points.</p><Button className="mt-2 gap-2 bg-orange-600 hover:bg-orange-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a 2048 challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "jumble" ? (
        <div className="space-y-6">
          {jumblePending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({jumblePending.length})</h2>{jumblePending.map((challenge) => <JumbleChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleJumbleAccept} onDecline={handleJumbleDecline} onPlay={handleJumblePlay} onRematch={handleJumbleRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {jumbleActive.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({jumbleActive.length})</h2>{jumbleActive.map((challenge) => <JumbleChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleJumbleAccept} onDecline={handleJumbleDecline} onPlay={handleJumblePlay} onRematch={handleJumbleRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {jumbleOutgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({jumbleOutgoing.length})</h2>{jumbleOutgoing.map((challenge) => <JumbleChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleJumbleAccept} onDecline={handleJumbleDecline} onPlay={handleJumblePlay} onRematch={handleJumbleRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {jumbleFinished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{jumbleFinished.map((challenge) => <JumbleChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleJumbleAccept} onDecline={handleJumbleDecline} onPlay={handleJumblePlay} onRematch={handleJumbleRematch} isResponding={false}/>)}</section>}
          {(!jumbleChallenges || jumbleChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><LayoutGrid className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Jumble Words challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to unscramble the same words and compare points.</p><Button className="mt-2 gap-2 bg-cyan-600 hover:bg-cyan-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a Jumble Words challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "snake" ? (
        <div className="space-y-6">
          {snakePending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({snakePending.length})</h2>{snakePending.map((challenge) => <SnakeChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleSnakeAccept} onDecline={handleSnakeDecline} onPlay={handleSnakePlay} onRematch={handleSnakeRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {snakeActive.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({snakeActive.length})</h2>{snakeActive.map((challenge) => <SnakeChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleSnakeAccept} onDecline={handleSnakeDecline} onPlay={handleSnakePlay} onRematch={handleSnakeRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {snakeOutgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({snakeOutgoing.length})</h2>{snakeOutgoing.map((challenge) => <SnakeChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleSnakeAccept} onDecline={handleSnakeDecline} onPlay={handleSnakePlay} onRematch={handleSnakeRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {snakeFinished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{snakeFinished.map((challenge) => <SnakeChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleSnakeAccept} onDecline={handleSnakeDecline} onPlay={handleSnakePlay} onRematch={handleSnakeRematch} isResponding={false}/>)}</section>}
          {(!snakeChallenges || snakeChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><LayoutGrid className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Snake challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to eat the same food and compare points.</p><Button className="mt-2 gap-2 bg-green-600 hover:bg-green-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a Snake challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "odd-images" ? (
        <div className="space-y-6">
          {oddImagePending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({oddImagePending.length})</h2>{oddImagePending.map((challenge) => <OddImageChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleOddImageAccept} onDecline={handleOddImageDecline} onPlay={handleOddImagePlay} onRematch={handleOddImageRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {oddImageActive.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({oddImageActive.length})</h2>{oddImageActive.map((challenge) => <OddImageChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleOddImageAccept} onDecline={handleOddImageDecline} onPlay={handleOddImagePlay} onRematch={handleOddImageRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {oddImageOutgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({oddImageOutgoing.length})</h2>{oddImageOutgoing.map((challenge) => <OddImageChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleOddImageAccept} onDecline={handleOddImageDecline} onPlay={handleOddImagePlay} onRematch={handleOddImageRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {oddImageFinished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{oddImageFinished.map((challenge) => <OddImageChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleOddImageAccept} onDecline={handleOddImageDecline} onPlay={handleOddImagePlay} onRematch={handleOddImageRematch} isResponding={false}/>)}</section>}
          {(!oddImageChallenges || oddImageChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><Images className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Odd Images challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to find the same odd images and compare points.</p><Button className="mt-2 gap-2 bg-teal-600 hover:bg-teal-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send an Odd Images challenge</Button></CardContent></Card>}
        </div>
      ) : activeTab === "rubiks" ? (
        <div className="space-y-6">
          {rubiksPending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({rubiksPending.length})</h2>{rubiksPending.map((challenge) => <RubiksChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleRubiksAccept} onDecline={handleRubiksDecline} onPlay={handleRubiksPlay} onRematch={handleRubiksRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {rubiksActive.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({rubiksActive.length})</h2>{rubiksActive.map((challenge) => <RubiksChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleRubiksAccept} onDecline={handleRubiksDecline} onPlay={handleRubiksPlay} onRematch={handleRubiksRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {rubiksOutgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({rubiksOutgoing.length})</h2>{rubiksOutgoing.map((challenge) => <RubiksChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleRubiksAccept} onDecline={handleRubiksDecline} onPlay={handleRubiksPlay} onRematch={handleRubiksRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {rubiksFinished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{rubiksFinished.map((challenge) => <RubiksChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleRubiksAccept} onDecline={handleRubiksDecline} onPlay={handleRubiksPlay} onRematch={handleRubiksRematch} isResponding={false}/>)}</section>}
          {(!rubiksChallenges || rubiksChallenges.length === 0) && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><Box className="h-12 w-12 text-muted-foreground/30"/><p className="text-lg font-semibold">No Rubik's Cube challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to solve the same scramble and compare points.</p><Button className="mt-2 gap-2 bg-rose-600 hover:bg-rose-700" onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a Rubik's Cube challenge</Button></CardContent></Card>}
        </div>
      ) : activeQuizSubject && activeQuizSubjectConfig ? (
        <div className="space-y-6">
          {quizTabPending.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>Waiting for you ({quizTabPending.length})</h2>{quizTabPending.map((challenge) => <QuizChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleQuizAccept} onDecline={handleQuizDecline} onPlay={handleQuizPlay} onRematch={handleQuizRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {quizTabActive.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>In Progress ({quizTabActive.length})</h2>{quizTabActive.map((challenge) => <QuizChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleQuizAccept} onDecline={handleQuizDecline} onPlay={handleQuizPlay} onRematch={handleQuizRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {quizTabOutgoing.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><Clock className="h-3.5 w-3.5"/>Waiting for them ({quizTabOutgoing.length})</h2>{quizTabOutgoing.map((challenge) => <QuizChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleQuizAccept} onDecline={handleQuizDecline} onPlay={handleQuizPlay} onRematch={handleQuizRematch} isResponding={respondingId === challenge.id}/>)}</section>}
          {quizTabFinished.length > 0 && <section className="space-y-3"><h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 w-fit shadow-sm"><CheckCircle2 className="h-3.5 w-3.5"/>Finished</h2>{quizTabFinished.map((challenge) => <QuizChallengeCard key={challenge.id} challenge={challenge} myProfileId={profileId!} onAccept={handleQuizAccept} onDecline={handleQuizDecline} onPlay={handleQuizPlay} onRematch={handleQuizRematch} isResponding={false}/>)}</section>}
          {quizTabChallenges.length === 0 && <Card><CardContent className="flex flex-col items-center gap-3 pb-10 pt-10 text-center"><span className="text-4xl">{activeQuizSubjectConfig.emoji}</span><p className="text-lg font-semibold">No {activeQuizSubjectConfig.shortName} challenges yet</p><p className="max-w-xs text-sm text-muted-foreground">Challenge a player to answer the same {activeQuizSubjectConfig.shortName.toLowerCase()} quiz and compare points.</p><Button className={`mt-2 gap-2 ${activeQuizSubjectConfig.theme.btn}`} onClick={openNewChallenge}><Swords className="h-4 w-4"/>Send a {activeQuizSubjectConfig.shortName} challenge</Button></CardContent></Card>}
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
            select any game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, or a quiz — to challenge another player on the same puzzle or questions.
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
              without signing in. Unaccepted invitations expire after 7 days and
              are removed from the list 7 days later. Accepted challenges that
              are still unfinished expire 14 days after being sent and disappear;
              completed challenges stay visible. If one expires, its link still
              lets players start a solo game or send a fresh challenge.
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
