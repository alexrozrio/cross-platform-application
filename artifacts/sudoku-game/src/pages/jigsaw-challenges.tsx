import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Clock3, Copy, Puzzle, Share2, Trophy, XCircle } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { appShareUrlForPath } from "@/lib/app-links";
import { toast } from "sonner";

type Challenge = {
  id: number;
  challengerId: number;
  challengedId: number | null;
  challengerUsername: string;
  challengedUsername: string | null;
  shareToken: string;
  gridSize: number;
  level: number;
  imageKey: number;
  status: "pending" | "accepted" | "declined" | "completed" | "expired";
  challengerGameId: number | null;
  challengedGameId: number | null;
  challengerPoints: number | null;
  challengedPoints: number | null;
  winnerId: number | null;
  createdAt: string;
};

function shareUrl(token: string) {
  return appShareUrlForPath(`/jigsaw-invite/${token}`);
}

export default function JigsawChallengesPage() {
  const { profileId } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  usePageMeta({
    title: "Jigsaw Friend Challenges | Play Brain Games . Online",
    description: "Create a Jigsaw puzzle challenge, invite a friend, and compare results.",
    path: "/jigsaw-challenges",
  });

  const challengesQuery = useQuery({
    queryKey: [`/api/jigsaw-challenges/for/${profileId}`],
    queryFn: () => customFetch<Challenge[]>(`/api/jigsaw-challenges/for/${profileId}`),
    enabled: Boolean(profileId),
  });
  const respond = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) =>
      customFetch<{ gameId?: number }>(`/api/jigsaw-challenges/${id}/respond`, {
        method: "POST",
        body: JSON.stringify({ profileId, action }),
      }),
    onSuccess: (result, variables) => {
      void queryClient.invalidateQueries({ queryKey: [`/api/jigsaw-challenges/for/${profileId}`] });
      if (variables.action === "accept" && result.gameId) {
        const challenge = challengesQuery.data?.find((item) => item.id === variables.id);
        if (challenge) {
          setLocation(`/jigsaw?gridSize=${challenge.gridSize}&level=${challenge.level}&imageKey=${challenge.imageKey}&gameId=${result.gameId}&challengeId=${challenge.id}&shareToken=${challenge.shareToken}`);
        }
      } else {
        toast.success("Challenge declined.");
      }
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update the challenge."),
  });

  const share = async (challenge: Challenge) => {
    const url = shareUrl(challenge.shareToken);
    const text = `Join my ${challenge.gridSize}×${challenge.gridSize} Jigsaw challenge.`;
    try {
      if (navigator.share) await navigator.share({ title: "Jigsaw challenge", text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Challenge link copied.");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Challenge link copied.");
      } catch {
        toast.error("Could not share the challenge link.");
      }
    }
  };

  const play = (challenge: Challenge) => {
    const gameId = profileId === challenge.challengerId
      ? challenge.challengerGameId
      : challenge.challengedGameId;
    if (!gameId) return;
    setLocation(`/jigsaw?gridSize=${challenge.gridSize}&level=${challenge.level}&imageKey=${challenge.imageKey}&gameId=${gameId}&challengeId=${challenge.id}&shareToken=${challenge.shareToken}`);
  };

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 px-4 pb-12 pt-5 sm:px-7">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/challenges" className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> All challenges</Link>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/jigsaw-challenge">Daily challenge</Link></Button>
          <Button asChild className="gap-2 bg-amber-700 text-white hover:bg-amber-800"><Link href="/jigsaw"><Puzzle size={15} /> New Jigsaw challenge</Link></Button>
        </div>
      </header>

      <section className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-emerald-50 p-5 dark:border-amber-900/40 dark:from-amber-950/30 dark:to-emerald-950/20 sm:p-7">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-amber-800 dark:text-amber-300"><Share2 size={15} /> Friend challenges</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">Build the same picture.</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Choose a board and level, send the invite link, then compare points after both players finish.</p>
      </section>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-600" /> Your Jigsaw challenges</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {challengesQuery.isLoading ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24 w-full" />)
            : challengesQuery.isError ? <p className="rounded-xl bg-muted/50 p-4 text-center text-sm text-muted-foreground">Challenge records could not be loaded.</p>
              : (challengesQuery.data ?? []).length === 0 ? (
                <div className="rounded-xl bg-muted/40 p-6 text-center">
                  <Puzzle className="mx-auto h-8 w-8 text-amber-600" />
                  <p className="mt-2 font-semibold">No Jigsaw challenges yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Create one and send its invite link to a friend.</p>
                </div>
              ) : (challengesQuery.data ?? []).map((challenge) => {
                const isChallenger = challenge.challengerId === profileId;
                const opponent = isChallenger ? challenge.challengedUsername ?? "A friend" : challenge.challengerUsername;
                const ownGameId = isChallenger ? challenge.challengerGameId : challenge.challengedGameId;
                return (
                  <article key={challenge.id} className="rounded-2xl border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{isChallenger ? `You challenged ${opponent}` : `${opponent} challenged you`}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{challenge.gridSize}×{challenge.gridSize} · Level {challenge.level} · Picture #{challenge.imageKey}</p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold capitalize">{challenge.status}</span>
                    </div>
                    {(challenge.status === "accepted" || challenge.status === "completed") && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Scores: {challenge.challengerPoints ?? "—"} – {challenge.challengedPoints ?? "—"}
                        {challenge.status === "completed" && challenge.winnerId === profileId && <span className="ml-2 inline-flex items-center gap-1 font-semibold text-amber-700"><Trophy size={13} /> You won</span>}
                        {challenge.status === "completed" && challenge.winnerId === null && <span className="ml-2">Tie</span>}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {challenge.status === "pending" && !isChallenger && (
                        <>
                          <Button size="sm" onClick={() => respond.mutate({ id: challenge.id, action: "accept" })} disabled={respond.isPending} className="gap-1.5"><CheckCircle2 size={14} /> Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => respond.mutate({ id: challenge.id, action: "decline" })} disabled={respond.isPending} className="gap-1.5"><XCircle size={14} /> Decline</Button>
                        </>
                      )}
                      {challenge.status === "pending" && isChallenger && (
                        <Button size="sm" variant="outline" onClick={() => void share(challenge)} className="gap-1.5"><Copy size={14} /> Share invite</Button>
                      )}
                      {challenge.status === "accepted" && ownGameId && (
                        <Button size="sm" onClick={() => play(challenge)} className="gap-1.5"><Puzzle size={14} /> Play your side</Button>
                      )}
                      {challenge.status === "pending" && isChallenger && challenge.challengerGameId && (
                        <Button size="sm" variant="outline" onClick={() => play(challenge)} className="gap-1.5"><Puzzle size={14} /> Play your side</Button>
                      )}
                      <span className="ml-auto flex items-center gap-1 self-center text-xs text-muted-foreground"><Clock3 size={13} /> {new Date(challenge.createdAt).toLocaleDateString()}</span>
                    </div>
                  </article>
                );
              })}
        </CardContent>
      </Card>
    </main>
  );
}
