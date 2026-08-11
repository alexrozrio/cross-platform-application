import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-base-url";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, User, Home, Palette, LogIn, LogOut, Gem, Swords } from "lucide-react";
import { useFontTheme } from "@/hooks/use-font-theme";
import { useFontSize } from "@/hooks/use-font-size";
import { useChallengeNotifications, usePendingChallengeCount } from "@/hooks/use-challenge-notifications";
import { useLevelUpWatcher } from "@/hooks/use-level-up";
import { useAchievementNotifier } from "@/hooks/use-achievement-notifier";
import { useBadgeNotifier } from "@/hooks/use-badge-notifier";
import { AchievementUnlockModal } from "@/components/achievement-unlock-modal";
import { TournamentWinModal } from "@/components/tournament-win-modal";
import { useThemeBg } from "@/hooks/use-theme-bg";

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
  // Game routes keep the header/nav chrome visible, just shrunk down, so
  // there's still room to reach Home/Leaderboard/etc. while playing. The
  // extra vertical space needed for the board comes from letting the
  // mobile browser's own address bar collapse (see Game's scroll-nudge).
  const isGameRoute = location.startsWith("/game/");
  const isOfflineGame = location.startsWith("/game/0");
  const { profileId, isSignedIn, replitUser } = useAuth();
  const { data: profile } = useGetProfile(profileId as number, { query: { enabled: !!profileId } });
  const pendingCount = usePendingChallengeCount(profileId);

  // Track the active colour theme; updated immediately on selection (before profile refetch)
  const [activeBgTheme, setActiveBgTheme] = React.useState(profile?.theme ?? 'light');
  React.useEffect(() => {
    if (profile?.theme) setActiveBgTheme(profile.theme);
  }, [profile?.theme]);
  React.useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id) setActiveBgTheme(id);
    };
    window.addEventListener('brain-games-theme-selected', handler);
    return () => window.removeEventListener('brain-games-theme-selected', handler);
  }, []);

  const { effectiveBg } = useThemeBg(activeBgTheme);

  useFontTheme();
  useFontSize();
  useChallengeNotifications(profileId);
  useLevelUpWatcher(profileId);
  const { pendingBadges, dismissBadge } = useBadgeNotifier(profileId);
  const { newlyUnlocked, dismiss } = useAchievementNotifier(profileId);

  React.useEffect(() => {
    applyAppTheme(profile?.theme ?? "light");
  }, [profile?.theme]);

  const navItems = [
    { href: "/", label: "Home", shortLabel: "Home", icon: Home, badge: 0, tooltip: "Play Sudoku & Memory Match — earn XP and climb the ranks",
      iconCls: "text-sky-400", activeIconCls: "text-sky-600 dark:text-sky-400", activeBgCls: "bg-sky-100 dark:bg-sky-900/40" },
    { href: "/leaderboard", label: "Leaderboard", shortLabel: "Ranks", icon: Trophy, badge: 0, tooltip: "See the top players — complete games to rise up the rankings",
      iconCls: "text-amber-400", activeIconCls: "text-amber-600 dark:text-amber-400", activeBgCls: "bg-amber-100 dark:bg-amber-900/40" },
    { href: "/challenges", label: "Challenges", shortLabel: "Duels", icon: Swords, badge: pendingCount, tooltip: "Challenge others to a duel — win to earn 10 💎 gems",
      iconCls: "text-rose-400", activeIconCls: "text-rose-600 dark:text-rose-400", activeBgCls: "bg-rose-100 dark:bg-rose-900/40" },
    { href: "/themes", label: "Themes", shortLabel: "Themes", icon: Palette, badge: 0, tooltip: "Unlock new board themes and fonts with your gems",
      iconCls: "text-violet-400", activeIconCls: "text-violet-600 dark:text-violet-400", activeBgCls: "bg-violet-100 dark:bg-violet-900/40" },
    { href: "/profile", label: isSignedIn ? (replitUser?.firstName || "Account") : "Profile", shortLabel: isSignedIn ? "Account" : "Profile", icon: User, badge: 0, tooltip: "Your profile, XP rank, badges, and game settings",
      iconCls: "text-emerald-400", activeIconCls: "text-emerald-600 dark:text-emerald-400", activeBgCls: "bg-emerald-100 dark:bg-emerald-900/40" },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  const handleSignInOut = () => {
    const from = encodeURIComponent(window.location.origin);
    if (isSignedIn) {
      window.location.href = apiUrl(`/api/logout?from=${from}`);
    } else {
      window.location.href = apiUrl(`/api/login?from=${from}`);
    }
  };

  return (
    <div className="flex flex-col text-foreground transition-colors duration-200" style={{ minHeight: "100dvh", backgroundColor: effectiveBg ? 'transparent' : 'var(--background)' }}>
      {/* Theme background image layers — fixed behind all content */}
      {effectiveBg && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 bg-cover bg-center bg-no-repeat"
            style={{ zIndex: -2, backgroundImage: `url(${effectiveBg})` }}
          />
          {/* Colour wash — 88% opacity keeps the theme image subtle in the background */}
          <div
            aria-hidden
            className="fixed inset-0"
            style={{ zIndex: -1, background: 'var(--background)', opacity: 0.88 }}
          />
        </>
      )}
      <TournamentWinModal badges={pendingBadges} onDismiss={dismissBadge} />
      <AchievementUnlockModal achievements={newlyUnlocked} onDismiss={dismiss} profileId={profileId} />
      <header className={[
        "border-b bg-card flex items-center justify-between sticky top-0 z-10",
        isGameRoute ? "py-1.5 px-3 md:py-4 md:px-6" : "py-4 px-6",
      ].join(" ")}>
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/brain-games-logo.png"
            alt="Brain Games 4 All"
            className={[
              "shrink-0",
              isGameRoute ? "h-6 w-6 md:h-9 md:w-9" : "h-9 w-9",
            ].join(" ")}
          />
          <span className={[
            "font-serif font-bold tracking-tight text-primary",
            isGameRoute ? "text-base md:text-2xl" : "text-2xl",
          ].join(" ")}>
            Brain Games 4 All
          </span>
        </Link>

        {/* Gems badge + offline status */}
        {(profileId && profile?.gems !== undefined) || isOfflineGame ? (
          <div className="flex items-center gap-2 ml-2 mr-auto">
            {profileId && profile?.gems !== undefined && (
              <div className={[
                "flex items-center gap-1.5 font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 rounded-full border border-cyan-200 dark:border-cyan-800",
                isGameRoute ? "text-xs px-2 py-0.5 md:text-sm md:px-3 md:py-1" : "text-sm px-3 py-1",
              ].join(" ")}>
                <Gem className="w-3.5 h-3.5" />
                <span>{profile.gems.toLocaleString()}</span>
              </div>
            )}
            {isOfflineGame && (
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                Offline
              </span>
            )}
          </div>
        ) : null}

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
                            <item.icon className={`h-4 w-4 ${isActive(item.href) ? item.activeIconCls : item.iconCls}`} />
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
                  className="gap-2 ml-1"
                  onClick={handleSignInOut}
                >
                  {isSignedIn
                    ? <LogOut className="h-4 w-4 text-slate-400" />
                    : <LogIn className="h-4 w-4 text-teal-500" />}
                  <span className={isSignedIn ? "text-muted-foreground" : "text-teal-600 dark:text-teal-400"}>
                    {isSignedIn ? "Sign out" : "Sign in"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isSignedIn ? "Sign out of your account" : "Sign in to save progress and earn rewards"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <main
        className={[
          "flex-1 w-full max-w-4xl mx-auto flex flex-col",
          isGameRoute
            ? "px-2 py-2 sm:px-4 md:px-8 md:py-8 md:pb-8"
            : "px-2 py-4 sm:px-4 md:px-8 md:py-8 md:pb-8",
        ].join(" ")}
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
      >
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
            <div className={`relative p-1.5 rounded-xl transition-colors ${isActive(item.href) ? `${item.activeBgCls} ${item.activeIconCls}` : item.iconCls}`}>
              {isSignedIn && item.href === "/profile" && replitUser?.profileImageUrl ? (
                <img src={replitUser.profileImageUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              <NotifBadge count={item.badge} />
            </div>
            <span className={`text-[10px] transition-colors ${isActive(item.href) ? `font-semibold ${item.activeIconCls}` : item.iconCls}`}>
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
