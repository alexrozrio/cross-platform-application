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
import {
  Swords,
  Trophy,
  Clock,
  Search,
  Gem,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Crown,
  Minus,
  Brain,
  Grid2x2,
  Zap,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { LevelBadge } from "@/components/level-badge";

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard" | "expert";
type SudokuGridSize = 3 | 4 | 9 | 16;
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
  isResponding,
}: {
  challenge: ChallengeDetail;
  myProfileId: number;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  onPlay: (gameId: number) => void;
  onRematch?: (c: ChallengeDetail) => void;
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
                challenge.status === "completed") && (
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
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => onPlay(myGameId)}
              >
                Play now <ChevronRight className="w-3 h-3" />
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
  isResponding,
}: {
  duel: MemoryDuelDetail;
  myProfileId: number;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  onPlay: (duel: MemoryDuelDetail) => void;
  onRematch?: (d: MemoryDuelDetail) => void;
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

              {(duel.status === "accepted" || duel.status === "completed") && (
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
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => onPlay(duel)}
              >
                Play now <ChevronRight className="w-3 h-3" />
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
    gameMode === 'children' ? [3, 4].includes(o.value) :
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
}: {
  open: boolean;
  onClose: () => void;
  myProfileId: number;
  gameMode: GameMode;
  initialData?: RematchData;
}) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
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
        description:
          "You can start playing now — they'll join once they accept.",
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
      customFetch<MemoryDuelDetail>("/api/memory-duels", {
        method: "POST",
        data,
      }),
    onSuccess: (duel) => {
      queryClient.invalidateQueries({ queryKey: ["memory-duels"] });
      toast.success(`Memory Match challenge sent to ${selected?.username}!`, {
        description:
          "You can start playing now — they'll join once they accept.",
      });
      onClose();
      if (duel.challengerGameId) {
        setLocation(
          `/memory?duelGameId=${duel.challengerGameId}&gridSize=${duel.gridSize}`,
        );
      }
    },
    onError: () => toast.error("Failed to send challenge"),
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

  const isPending =
    createSudokuMutation.isPending || createMemoryMutation.isPending;

  const handleClose = () => {
    setSearch("");
    setSelected(null);
    setGameType("sudoku");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Challenge a Player
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!selected ? (
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
          {selected && (
            <Button onClick={handleSend} disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4" />
                  Send Challenge
                </>
              )}
            </Button>
          )}
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

  const { data: profile } = useGetProfile(profileId as number, {
    query: { enabled: !!profileId },
  });
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
        toast.success("Challenge accepted! Let's go!");
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
        toast.success("Memory duel accepted! Let's play!");
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
        <div className="space-y-1">
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
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-bold tracking-tight">
            Challenges
          </h1>
          <p className="text-muted-foreground">
            Beat your opponent's score to win 10 gems.
          </p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setShowNew(true)}>
          <Swords className="w-4 h-4" />
          Challenge
        </Button>
      </div>
      <div className="flex gap-2">
        <Link
          href="/sudoku"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-primary" />
          Play Sudoku
        </Link>
        <Link
          href="/memory"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Brain className="w-3.5 h-3.5 text-primary" />
          Play Memory
        </Link>
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
          Memory Match
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
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
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
                  isResponding={respondingId === c.id}
                />
              ))}
            </section>
          )}
          {active.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
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
                  isResponding={respondingId === c.id}
                />
              ))}
            </section>
          )}
          {outgoing.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
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
                  isResponding={respondingId === c.id}
                />
              ))}
            </section>
          )}
          {finished.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
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
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
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
                  isResponding={respondingId === d.id}
                />
              ))}
            </section>
          )}
          {duelActive.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
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
                  isResponding={respondingId === d.id}
                />
              ))}
            </section>
          )}
          {duelOutgoing.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
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
                  isResponding={respondingId === d.id}
                />
              ))}
            </section>
          )}
          {duelFinished.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
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
      />
    </div>
  );
}
