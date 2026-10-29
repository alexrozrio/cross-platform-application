import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Clock3, Copy, Puzzle, Trophy, XCircle } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { appShareUrlForPath } from "@/lib/app-links";
import { toast } from "sonner";

type JigsawChallenge = {
  id: number;
  challengerId: number;
  challengedId: number | null;
  challengerUsername: string;
  challengedUsername: string | null;
  challengerPoints: number | null;
  challengedPoints: number | null;
  shareToken: string;
  gridSize: number;
  level: number;
  imageKey: number;
  status: "pending" | "accepted" | "declined" | "completed" | "expired";
  challengerGameId: number | null;
  challengedGameId: number | null;
  winnerId: number | null;
  expiresAt: string;
};

export default function JigsawInvitePage({ token }: { token: string }) {
  const { profileId } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  usePageMeta({
    title: "Jigsaw Friend Challenge | Play Brain Games . Online",
    description: "Accept a Jigsaw puzzle challenge and compete with a friend.",
    path: `/jigsaw-invite/${token}`,
  });
  const challengeQuery = useQuery({
    queryKey: [`/api/jigsaw-challenges/invite/${token}`],
    queryFn: () => customFetch<JigsawChallenge>(`/api/jigsaw-challenges/invite/${encodeURIComponent(token)}`),
    retry: false,
  });

  const respond = useMutation({
    mutationFn: (action: "accept" | "decline") => customFetch<{ gameId?: number; status: string }>(
      `/api/jigsaw-challenges/${challengeQuery.data?.id}/respond`,
      { method: "POST", body: JSON.stringify({ profileId, action }) },
    ),
    onSuccess: (result, action) => {
      void queryClient.invalidateQueries({ queryKey: [`/api/jigsaw-challenges/for/${profileId}`] });
      if (action === "accept" && result.gameId && challengeQuery.data) {
        const challenge = challengeQuery.data;
        setLocation(`/jigsaw?gridSize=${challenge.gridSize}&level=${challenge.level}&imageKey=${challenge.imageKey}&gameId=${result.gameId}&challengeId=${challenge.id}&shareToken=${challenge.shareToken}`);
      } else {
        void challengeQuery.refetch();
        toast.success("Challenge declined.");
      }
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not respond to this challenge."),
  });

  const challenge = challengeQuery.data;
  const isChallenger = Boolean(challenge && profileId === challenge.challengerId);
  const ownGameId = challenge
    ? isChallenger ? challenge.challengerGameId : profileId === challenge.challengedId ? challenge.challengedGameId : null
    : null;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(appShareUrlForPath(`/jigsaw-invite/${token}`));
      toast.success("Challenge link copied.");
    } catch {
      toast.error("Could not copy the challenge link.");
    }
  };

  if (challengeQuery.isLoading) {
    return <main className="mx-auto max-w-2xl space-y-4 px-4 py-8"><Skeleton className="h-12 w-48" /><Skeleton className="h-64 w-full" /></main>;
  }

  if (!challenge) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card><CardContent className="space-y-4 p-6 text-center">
          <XCircle className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="font-serif text-2xl font-bold">Challenge unavailable</h1>
          <p className="text-sm text-muted-foreground">{challengeQuery.error instanceof Error ? challengeQuery.error.message : "This Jigsaw challenge link may have expired."}</p>
          <Button asChild><Link href="/jigsaw">Play Jigsaw</Link></Button>
        </CardContent></Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-4 pb-12 pt-5 sm:px-7">
      <Link href="/challenges" className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Challenges</Link>
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-100 p-6 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-emerald-950/30 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-amber-800 dark:text-amber-300"><Puzzle size={15} /> Jigsaw friend challenge</p>
          <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{challenge.challengerUsername} challenges you</h1>
          <p className="mt-2 text-sm text-muted-foreground">Rebuild the same picture and compare your score.</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl border bg-white/70 p-3 dark:bg-background/60"><p className="text-xs text-muted-foreground">Board</p><p className="mt-1 font-bold">{challenge.gridSize}×{challenge.gridSize}</p></div>
            <div className="rounded-xl border bg-white/70 p-3 dark:bg-background/60"><p className="text-xs text-muted-foreground">Level</p><p className="mt-1 font-bold">{challenge.level}</p></div>
            <div className="rounded-xl border bg-white/70 p-3 dark:bg-background/60"><p className="text-xs text-muted-foreground">Picture</p><p className="mt-1 font-bold">#{challenge.imageKey}</p></div>
          </div>
        </div>
        <CardContent className="space-y-4 p-5 sm:p-6">
          {challenge.status === "completed" ? (
            <div className="rounded-xl border bg-muted/40 p-4 text-center">
              <Trophy className="mx-auto h-7 w-7 text-amber-600" />
              <p className="mt-2 font-semibold">{challenge.winnerId === null ? "It's a tie." : challenge.winnerId === profileId ? "You won this challenge." : "Challenge complete."}</p>
              <p className="mt-1 text-sm text-muted-foreground">Scores: {challenge.challengerPoints ?? "—"} – {challenge.challengedPoints ?? "—"}</p>
            </div>
          ) : challenge.status === "pending" && !isChallenger ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => respond.mutate("accept")} disabled={!profileId || respond.isPending} className="flex-1 gap-2 bg-amber-700 text-white hover:bg-amber-800"><CheckCircle2 size={16} /> Accept and play</Button>
              <Button variant="outline" onClick={() => respond.mutate("decline")} disabled={!profileId || respond.isPending} className="gap-2"><XCircle size={16} /> Decline</Button>
            </div>
          ) : challenge.status === "pending" && isChallenger ? (
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><Clock3 size={15} /> Waiting for a friend to accept.</p>
              <div className="flex flex-wrap gap-2">
                {challenge.challengerGameId && <Button asChild className="flex-1"><Link href={`/jigsaw?gridSize=${challenge.gridSize}&level=${challenge.level}&imageKey=${challenge.imageKey}&gameId=${challenge.challengerGameId}&challengeId=${challenge.id}&shareToken=${challenge.shareToken}`}>Play your side</Link></Button>}
                <Button variant="outline" onClick={() => void copyInvite()} className="gap-2"><Copy size={15} /> Copy invite</Button>
              </div>
            </div>
          ) : challenge.status === "accepted" && ownGameId ? (
            <Button asChild className="w-full"><Link href={`/jigsaw?gridSize=${challenge.gridSize}&level=${challenge.level}&imageKey=${challenge.imageKey}&gameId=${ownGameId}&challengeId=${challenge.id}&shareToken=${challenge.shareToken}`}>Continue challenge</Link></Button>
          ) : (
            <p className="rounded-xl bg-muted/50 p-4 text-center text-sm text-muted-foreground">This challenge is {challenge.status}. It can no longer be joined.</p>
          )}
          <Button variant="ghost" onClick={() => void copyInvite()} className="w-full gap-2 text-muted-foreground"><Copy size={15} /> Copy invite link</Button>
        </CardContent>
      </Card>
    </main>
  );
}
