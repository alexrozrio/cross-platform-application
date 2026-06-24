import React from "react";
import { useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { useAuth } from "@/hooks/use-auth";
import {
  useGetProfile,
  useUpdateProfile,
  useGetProfileBadges,
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  LogIn,
  LogOut,
  User,
  Smartphone,
  Share2,
  Trophy,
  Gem,
  Flame,
  Star,
  Info,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { BADGE_META, formatPeriodLabel } from "@/lib/badge-utils";
import { BadgeShareSheet } from "@/components/badge-share-sheet";
import { LevelCard, RankGuide } from "@/components/level-badge";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastChallengeDate: string | null;
  completedToday: boolean;
}

const profileSchema = z.object({
  username: z.string().min(2, "At least 2 characters").max(30),
  highlightErrors: z.boolean().default(true),
  showTimer: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { profileId } = useAuth();
  const { data: profile, isLoading } = useGetProfile(profileId as number, {
    query: { enabled: !!profileId },
  });
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      highlightErrors: true,
      showTimer: true,
    },
    values: profile
      ? {
          username: profile.username,
          highlightErrors: profile.highlightErrors ?? true,
          showTimer: profile.showTimer ?? true,
        }
      : undefined,
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profileId) return;
    try {
      await updateProfile.mutateAsync({ id: profileId, data });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const { data: badges } = useGetProfileBadges(profileId as number, {
    query: { enabled: !!profileId },
  });

  const { data: streak } = useQuery<StreakData>({
    queryKey: ["daily-challenge-streak", profileId],
    queryFn: () => customFetch<StreakData>(`/api/daily-challenge/streak/${profileId}`),
    enabled: !!profileId,
  });

  const [shareSheetToken, setShareSheetToken] = React.useState<string | null>(null);
  const shareSheetBadge = badges?.find((b) => b.shareToken === shareSheetToken);
  const shareSheetMeta = shareSheetBadge ? (BADGE_META[shareSheetBadge.badgeType] ?? BADGE_META["weekly_1st"]) : null;
  const shareSheetUrl = shareSheetToken
    ? `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/badges/${shareSheetToken}`
    : "";

  if (!isLoaded || isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-serif font-bold tracking-tight">
          Account
        </h1>
        <p className="text-muted-foreground">
          Manage your identity and game preferences.
        </p>
      </div>

      {/* Identity card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {isSignedIn ? (
              <User className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
            {isSignedIn ? "Signed-in Account" : "Anonymous (Device)"}
          </CardTitle>
          {!isSignedIn && (
            <CardDescription className="text-xs">
              Sign in with Google or Facebook to sync your progress across
              devices.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              {user.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover border-2 border-border"
                />
              )}
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {user.fullName || user.firstName}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {user.externalAccounts.map((acc) => (
                    <Badge
                      key={acc.id}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {acc.provider}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl">
                🎮
              </div>
              <div>
                <p className="font-semibold">{profile?.username}</p>
                <p className="text-xs text-muted-foreground">
                  Playing on this device only
                </p>
              </div>
            </div>
          )}

          {isSignedIn ? (
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          ) : (
            <Button
              className="w-full gap-2"
              onClick={() => setLocation("/sign-in")}
            >
              <LogIn className="w-4 h-4" />
              Sign in with Google or Facebook
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Level / Rank card */}
      {profileId && profile && (
        <>
          <LevelCard xp={profile.xp ?? 0} />
          <RankGuide currentXp={profile.xp ?? 0} />
        </>
      )}

      {/* Gems balance */}
      {profileId && profile && (
        <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40 border-cyan-200 dark:border-cyan-800">
          <CardContent className="pt-5 pb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center">
                <Gem className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">
                  Gem Balance
                </p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">
                  Earned by completing puzzles. Earn 5000 points to get a Gem
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-cyan-700 dark:text-cyan-300 tabular-nums">
                {(profile.gems ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-cyan-500 dark:text-cyan-500 mt-0.5">
                💎 gems
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Challenge Streak */}
      {profileId && streak !== undefined && (
        <Card
          className="cursor-pointer hover:border-orange-300 transition-colors border-orange-200/70 bg-gradient-to-br from-orange-50 to-amber-50"
          onClick={() => setLocation("/daily-challenge")}
        >
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <p className="text-sm font-semibold text-orange-800">Daily Streak</p>
              </div>
              <span className="text-xs text-orange-500 underline underline-offset-2">Play today →</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-black text-orange-600">{streak.currentStreak}</p>
                <p className="text-xs text-muted-foreground">current</p>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{streak.longestStreak}</p>
                <p className="text-xs text-muted-foreground">best</p>
              </div>
              <div>
                <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${streak.completedToday ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {streak.completedToday ? "✓ Done" : "Pending"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      {profileId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Tournament Badges
            </CardTitle>
            {(!badges || badges.length === 0) && (
              <CardDescription className="text-xs">
                Finish in the top 3 of a weekly or monthly tournament to earn
                badges.
              </CardDescription>
            )}
          </CardHeader>
          {badges && badges.length > 0 && (
            <CardContent className="space-y-3">
              {badges.map((badge) => {
                const meta =
                  BADGE_META[badge.badgeType] ?? BADGE_META["weekly_1st"];
                return (
                  <div
                    key={badge.id}
                    className={`flex items-center justify-between rounded-xl border-2 p-3 ${meta.borderColor}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${meta.bg}`}
                      >
                        {meta.emoji}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${meta.color}`}>
                          {meta.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPeriodLabel(badge.tournamentPeriod)} ·{" "}
                          {badge.totalPoints.toLocaleString()} pts
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-xs h-8"
                      onClick={() => setShareSheetToken(badge.shareToken)}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>
      )}

      {/* Game preferences */}
      {profileId && (
        <Card>
          <CardHeader>
            <CardTitle>Game Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter display name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="highlightErrors"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel className="text-base">
                          Highlight Errors
                        </FormLabel>
                        <FormDescription>
                          Show feedback on incorrect placement.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="showTimer"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel className="text-base">Show Timer</FormLabel>
                        <FormDescription>
                          Display elapsed time during gameplay.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? "Saving…" : "Save Preferences"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      {shareSheetBadge && shareSheetMeta && (
        <BadgeShareSheet
          open={!!shareSheetToken}
          onClose={() => setShareSheetToken(null)}
          shareUrl={shareSheetUrl}
          badgeTitle={shareSheetMeta.title}
          username={profile?.username ?? "Player"}
          points={shareSheetBadge.totalPoints}
          period={formatPeriodLabel(shareSheetBadge.tournamentPeriod)}
        />
      )}

      {/* Legal / info footer */}
      <div className="border-t pt-6 pb-4 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setLocation("/about")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Info className="w-3.5 h-3.5" /> About
          </button>
          <span className="text-border">·</span>
          <button
            onClick={() => setLocation("/privacy")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy
          </button>
          <span className="text-border">·</span>
          <button
            onClick={() => setLocation("/terms")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Terms
          </button>
        </div>
        <p className="text-xs text-muted-foreground/60">© {new Date().getFullYear()} Sudoku Game. All rights reserved.</p>
      </div>
    </div>
  );
}
