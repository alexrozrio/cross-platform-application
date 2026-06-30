import React from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { ACHIEVEMENT_META, type AchievementsData } from "@/lib/achievement-utils";
import { Trophy, Gamepad2, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface PublicProfileProps {
  profileId: string;
}

type PublicProfile = {
  id: number;
  username: string;
  avatar: string | null;
  displayName?: string | null;
  gems: number;
  xp?: number;
};

export default function PublicProfilePage({ profileId }: PublicProfileProps) {
  const id = parseInt(profileId);

  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery<PublicProfile>({
    queryKey: [`/api/profiles/${id}`],
    queryFn: () => customFetch<PublicProfile>(`/api/profiles/${id}`),
    enabled: !isNaN(id),
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery<AchievementsData>({
    queryKey: [`/api/achievements/${id}`],
    queryFn: () => customFetch<AchievementsData>(`/api/achievements/${id}`),
    enabled: !isNaN(id),
  });

  const isLoading = profileLoading || achievementsLoading;

  if (isNaN(id) || profileError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">Player not found</h1>
          <p className="text-sm text-muted-foreground">This profile doesn't exist or has been removed.</p>
          <Link href="/">
            <Button className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              Back to Game Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const unlockedAchievements = achievements
    ? ACHIEVEMENT_META.filter((m) => achievements[m.id]?.unlocked)
    : [];

  const sudokuUnlocked = unlockedAchievements.filter((a) => a.game === "sudoku");
  const memoryUnlocked = unlockedAchievements.filter((a) => a.game === "memory");
  const displayName = profile?.displayName || profile?.username;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* ── Profile header ── */}
      <div className="text-center space-y-4">
        {isLoading ? (
          <div className="w-24 h-24 rounded-full bg-muted animate-pulse mx-auto" />
        ) : profile?.avatar ? (
          <img
            src={profile.avatar}
            alt={displayName}
            className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-amber-300/60 shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl font-bold text-white mx-auto shadow-lg ring-4 ring-amber-300/60">
            {displayName?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        <div>
          {isLoading ? (
            <div className="h-8 w-40 bg-muted animate-pulse rounded mx-auto" />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? (
              <span className="inline-block h-4 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <>
                {unlockedAchievements.length} achievement
                {unlockedAchievements.length !== 1 ? "s" : ""} unlocked
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Achievement grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : unlockedAchievements.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No achievements yet</p>
          <p className="text-sm mt-1">Play some games to earn badges!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sudokuUnlocked.length > 0 && (
            <section>
              <div className="flex items-center gap-1.5 mb-3">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sudoku
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sudokuUnlocked.map((a) => (
                  <AchievementCard key={a.id} emoji={a.emoji} title={a.title} description={a.description} />
                ))}
              </div>
            </section>
          )}

          {memoryUnlocked.length > 0 && (
            <section>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-xs">🧠</span>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Memory Match
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {memoryUnlocked.map((a) => (
                  <AchievementCard key={a.id} emoji={a.emoji} title={a.title} description={a.description} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── CTA ── */}
      <div className="text-center pt-6 border-t border-border/60 space-y-3">
        <p className="text-sm text-muted-foreground">Think you can beat them?</p>
        <Link href="/">
          <Button size="lg" className="gap-2 rounded-xl">
            <Gamepad2 className="w-4 h-4" />
            Play on Game Hub
          </Button>
        </Link>
      </div>
    </div>
  );
}

function AchievementCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col items-center gap-2 text-center shadow-sm hover:shadow-md transition-shadow">
      <span className="text-3xl leading-none">{emoji}</span>
      <div>
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>
    </div>
  );
}
