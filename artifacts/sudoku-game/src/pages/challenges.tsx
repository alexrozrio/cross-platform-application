import React, { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  User,
  ChevronRight,
  Crown,
  Minus,
} from "lucide-react";
import { toast } from "sonner";

type Difficulty = "easy" | "medium" | "hard" | "expert";
type GridSize = 3 | 4 | 9 | 16;
type ChallengeStatus = "pending" | "accepted" | "declined" | "completed";

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
  challengerPoints: number | null;
  challengedPoints: number | null;
  difficulty: Difficulty;
  gridSize: number;
  createdAt: string;
}

interface ProfileSummary {
  id: number;
  username: string;
  avatar: string | null;
  gems: number;
}

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  hard: "bg-orange-100 text-orange-700 border-orange-200",
  expert: "bg-red-100 text-red-700 border-red-200",
};

const GRID_LABELS: Record<number, string> = {
  3: "3×3",
  4: "4×4",
  9: "9×9",
  16: "16×16",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Avatar({ src, name, size = 8 }: { src: string | null; name: string; size?: number }) {
  const s = `w-${size} h-${size}`;
  if (src) {
    return <img src={src} alt={name} className={`${s} rounded-full object-cover ring-2 ring-border shrink-0`} />;
  }
  return (
    <div className={`${s} rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-border`}>
      <span className="text-primary font-bold text-xs">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: ChallengeStatus }) {
  if (status === "pending") return <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 text-xs">Pending</Badge>;
  if (status === "accepted") return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 text-xs">In Progress</Badge>;
  if (status === "declined") return <Badge variant="outline" className="text-slate-500 border-slate-300 bg-slate-50 text-xs">Declined</Badge>;
  return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 text-xs">Completed</Badge>;
}

function ChallengeCard({
  challenge,
  myProfileId,
  onAccept,
  onDecline,
  onPlay,
  isResponding,
}: {
  challenge: ChallengeDetail;
  myProfileId: number;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  onPlay: (gameId: number) => void;
  isResponding: boolean;
}) {
  const isChallenger = challenge.challengerId === myProfileId;
  const opponent = isChallenger ? challenge.challengedUsername : challenge.challengerUsername;
  const opponentAvatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
  const myPoints = isChallenger ? challenge.challengerPoints : challenge.challengedPoints;
  const theirPoints = isChallenger ? challenge.challengedPoints : challenge.challengerPoints;
  const myGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
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
                {challenge.status === "completed" && (
                  <span className={`text-xs font-bold flex items-center gap-1 ${isWinner ? "text-yellow-600" : isTie ? "text-slate-500" : "text-red-500"}`}>
                    {isWinner ? <><Crown className="w-3 h-3" /> Won +10 💎</> : isTie ? <><Minus className="w-3 h-3" /> Tie</> : <><XCircle className="w-3 h-3" /> Lost</>}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize ${DIFF_COLORS[challenge.difficulty]}`}>
                  {challenge.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">{GRID_LABELS[challenge.gridSize]}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(challenge.createdAt)}</span>
                {isChallenger ? (
                  <span className="text-[10px] text-muted-foreground italic">You challenged</span>
                ) : (
                  <span className="text-[10px] text-blue-600 font-medium">Challenged you</span>
                )}
              </div>

              {/* Points display for in-progress or completed */}
              {(challenge.status === "accepted" || challenge.status === "completed") && (
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-muted-foreground">You: <span className="font-bold text-foreground">{myPoints != null ? myPoints.toLocaleString() : "—"}</span></span>
                  <span className="text-muted-foreground">Them: <span className="font-bold text-foreground">{theirPoints != null ? theirPoints.toLocaleString() : "—"}</span></span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={challenge.status} />

            {/* Actions */}
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
                {myPoints != null ? "View" : "Play"} <ChevronRight className="w-3 h-3" />
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

function NewChallengeDialog({
  open,
  onClose,
  myProfileId,
}: {
  open: boolean;
  onClose: () => void;
  myProfileId: number;
}) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProfileSummary | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gridSize, setGridSize] = useState<GridSize>(9);

  const { data: results, isFetching } = useQuery<ProfileSummary[]>({
    queryKey: ["profile-search", search, myProfileId],
    queryFn: () =>
      customFetch<ProfileSummary[]>(`/api/profiles/search?q=${encodeURIComponent(search)}&exclude=${myProfileId}`),
    enabled: search.length >= 2,
    staleTime: 5000,
  });

  const createMutation = useMutation({
    mutationFn: (data: { challengerId: number; challengedId: number; difficulty: Difficulty; gridSize: GridSize }) =>
      customFetch<ChallengeDetail>("/api/challenges", { method: "POST", data }),
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success(`Challenge sent to ${selected?.username}!`, {
        description: "You can start playing now — they'll join once they accept.",
      });
      onClose();
      if (challenge.challengerGameId) {
        setLocation(`/game/${challenge.challengerGameId}`);
      }
    },
    onError: () => toast.error("Failed to send challenge"),
  });

  const handleSend = () => {
    if (!selected) return;
    createMutation.mutate({ challengerId: myProfileId, challengedId: selected.id, difficulty, gridSize });
  };

  const handleClose = () => {
    setSearch("");
    setSelected(null);
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
              <label className="text-sm font-medium text-foreground">Search by username</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Type a username…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
                {isFetching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
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
                          <Gem className="w-3 h-3 text-cyan-500" />{p.gems?.toLocaleString() ?? 0} gems
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {search.length >= 2 && !isFetching && results?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-3">No players found</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <Avatar src={selected.avatar} name={selected.username} size={10} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{selected.username}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Gem className="w-3 h-3 text-cyan-500" />{selected.gems?.toLocaleString() ?? 0} gems
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelected(null)}>
                  Change
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Grid Size</label>
                  <Select value={String(gridSize)} onValueChange={(v) => setGridSize(Number(v) as GridSize)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3×3 Baby</SelectItem>
                      <SelectItem value="4">4×4 Mini</SelectItem>
                      <SelectItem value="9">9×9 Classic</SelectItem>
                      <SelectItem value="16">16×16 Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
                <Trophy className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                <span>Winner gets <strong>10 gems</strong> — whoever scores more points wins!</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          {selected && (
            <Button
              onClick={handleSend}
              disabled={createMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
              ) : (
                <><Swords className="w-4 h-4" />Send Challenge</>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Challenges() {
  const { profileId } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [respondingId, setRespondingId] = useState<number | null>(null);

  const { data: challenges, isLoading } = useQuery<ChallengeDetail[]>({
    queryKey: ["challenges", profileId],
    queryFn: () => customFetch<ChallengeDetail[]>(`/api/challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 10000,
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) =>
      customFetch<ChallengeDetail>(`/api/challenges/${id}/respond`, {
        method: "PATCH",
        data: { action, profileId },
      }),
    onSuccess: (challenge, vars) => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      setRespondingId(null);
      if (vars.action === "accept") {
        toast.success("Challenge accepted! Let's go!");
        if (challenge.challengedGameId) {
          setLocation(`/game/${challenge.challengedGameId}`);
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

  const handleAccept = useCallback((id: number) => {
    setRespondingId(id);
    respondMutation.mutate({ id, action: "accept" });
  }, [respondMutation]);

  const handleDecline = useCallback((id: number) => {
    setRespondingId(id);
    respondMutation.mutate({ id, action: "decline" });
  }, [respondMutation]);

  const handlePlay = useCallback((gameId: number) => {
    setLocation(`/game/${gameId}`);
  }, [setLocation]);

  const pending = challenges?.filter((c) => c.status === "pending" && c.challengedId === profileId) ?? [];
  const active = challenges?.filter((c) => c.status === "accepted") ?? [];
  const finished = challenges?.filter((c) => c.status === "completed" || c.status === "declined") ?? [];

  if (!profileId) {
    return (
      <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Challenges</h1>
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

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground">Beat your opponent's score to win 10 gems.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setShowNew(true)}>
          <Swords className="w-4 h-4" />
          Challenge
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Incoming pending */}
          {pending.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
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

          {/* Active / in-progress */}
          {active.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
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

          {/* Outgoing pending */}
          {challenges?.filter((c) => c.status === "pending" && c.challengerId === profileId).map((c) => c) && (
            (() => {
              const outgoing = challenges?.filter((c) => c.status === "pending" && c.challengerId === profileId) ?? [];
              if (outgoing.length === 0) return null;
              return (
                <section className="space-y-3" key="outgoing">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Waiting for them ({outgoing.length})
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
              );
            })()
          )}

          {/* Finished */}
          {finished.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Finished
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
                <p className="font-semibold text-lg">No challenges yet</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Challenge another player to a head-to-head Sudoku battle. Winner takes 10 gems!
                </p>
                <Button className="mt-2 gap-2" onClick={() => setShowNew(true)}>
                  <Swords className="w-4 h-4" />
                  Send your first challenge
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
      />
    </div>
  );
}
