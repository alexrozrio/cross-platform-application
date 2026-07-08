import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-base-url";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, User, Home, BarChart2, Palette, LogIn, LogOut, Gem, Swords } from "lucide-react";
import { useFontTheme } from "@/hooks/use-font-theme";
import { useChallengeNotifications, usePendingChallengeCount } from "@/hooks/use-challenge-notifications";
import { useLevelUpWatcher } from "@/hooks/use-level-up";
import { useAchievementNotifier } from "@/hooks/use-achievement-notifier";
import { useBadgeNotifier } from "@/hooks/use-badge-notifier";
import { AchievementUnlockModal } from "@/components/achievement-unlock-modal";

export function applyAppTheme(theme: string) {
  document.documentElement.setAttribute("data-theme", theme);
  if (theme === "dark" || theme === "midnight") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}


function NotifBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none shadow-sm">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { profileId, isSignedIn, replitUser } = useAuth();
  const { data: profile } = useGetProfile(profileId as number, { query: { enabled: !!profileId } });
  const pendingCount = usePendingChallengeCount(profileId);

  useFontTheme();
  useChallengeNotifications(profileId);
  useLevelUpWatcher(profileId);
  useBadgeNotifier(profileId);
  const { newlyUnlocked, dismiss } = useAchievementNotifier(profileId);

  React.useEffect(() => {
    applyAppTheme(profile?.theme ?? "light");
  }, [profile?.theme]);

  const navItems = [
    { href: "/", label: "Home", shortLabel: "Home", icon: Home, badge: 0, tooltip: "Play Sudoku & Memory Match — earn XP and climb the ranks" },
    { href: "/leaderboard", label: "Leaderboard", shortLabel: "Ranks", icon: Trophy, badge: 0, tooltip: "See the top players — complete games to rise up the rankings" },
    { href: "/challenges", label: "Challenges", shortLabel: "Duels", icon: Swords, badge: pendingCount, tooltip: "Challenge others to a duel — win to earn 10 💎 gems" },
    { href: "/stats", label: "Stats", shortLabel: "Stats", icon: BarChart2, badge: 0, tooltip: "Your game history, win streaks, and personal bests" },
    { href: "/themes", label: "Themes", shortLabel: "Themes", icon: Palette, badge: 0, tooltip: "Unlock new board themes and fonts with your gems" },
    { href: "/profile", label: isSignedIn ? (replitUser?.firstName || "Account") : "Profile", shortLabel: isSignedIn ? "Account" : "Profile", icon: User, badge: 0, tooltip: "Your profile, XP rank, badges, and game settings" },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  const handleSignInOut = () => {
    if (isSignedIn) {
      window.location.href = apiUrl("/api/logout");
    } else {
      window.location.href = apiUrl("/api/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200" style={{ minHeight: "100svh" }}>
      <AchievementUnlockModal achievements={newlyUnlocked} onDismiss={dismiss} profileId={profileId} />
      <header className="border-b bg-card py-4 px-6 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-primary">
          Brain Games 4 All
        </Link>

        {/* Gems badge */}
        {profileId && profile?.gems !== undefined && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-800 ml-2 mr-auto">
            <Gem className="w-3.5 h-3.5" />
            <span>{profile.gems.toLocaleString()}</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1">
          <TooltipProvider delayDuration={400}>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        size="sm"
                        className="gap-2 relative"
                      >
                        <span className="relative inline-flex">
                          {isSignedIn && item.href === "/profile" && replitUser?.profileImageUrl ? (
                            <img src={replitUser.profileImageUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
                          ) : (
                            <item.icon className="h-4 w-4" />
                          )}
                          <NotifBadge count={item.badge} />
                        </span>
                        {item.label}
                        {item.badge > 0 && (
                          <span className="sr-only">{item.badge} pending</span>
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {item.tooltip}
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isSignedIn ? "ghost" : "outline"}
                  size="sm"
                  className="gap-2 ml-1 text-muted-foreground"
                  onClick={handleSignInOut}
                >
                  {isSignedIn ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {isSignedIn ? "Sign out" : "Sign in"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isSignedIn ? "Sign out of your account" : "Sign in to save progress and earn rewards"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-2 py-4 sm:px-4 md:px-8 md:py-8 flex flex-col pb-20 md:pb-8">
        {children}
      </main>

      <nav className="md:hidden border-t bg-card pt-2 px-2 flex items-center justify-around fixed bottom-0 left-0 right-0 z-10" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={item.tooltip}
            className="flex flex-col items-center gap-0.5 text-xs min-w-[48px] py-1"
          >
            <div className={`relative p-1.5 rounded-xl ${isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
              {isSignedIn && item.href === "/profile" && replitUser?.profileImageUrl ? (
                <img src={replitUser.profileImageUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              <NotifBadge count={item.badge} />
            </div>
            <span className={`text-[10px] ${isActive(item.href) ? "font-semibold text-primary" : "text-muted-foreground"}`}>
              {item.shortLabel}
            </span>
          </Link>
        ))}
        {/* Sign in / out pill */}
        <button
          className="flex flex-col items-center gap-0.5 text-xs min-w-[48px] py-1"
          onClick={handleSignInOut}
        >
          <div className="p-1.5 rounded-xl text-muted-foreground">
            {isSignedIn ? <LogOut className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {isSignedIn ? "Sign out" : "Sign in"}
          </span>
        </button>
      </nav>
    </div>
  );
}
