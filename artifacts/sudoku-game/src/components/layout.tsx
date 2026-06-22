import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useClerk, useUser } from "@clerk/react";
import { useGetProfile, customFetch } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Trophy, User, Home, BarChart2, Palette, LogIn, LogOut, Gem, Swords } from "lucide-react";
import { useFontTheme } from "@/hooks/use-font-theme";
import { useChallengeNotifications } from "@/hooks/use-challenge-notifications";

export function applyAppTheme(theme: string) {
  document.documentElement.setAttribute("data-theme", theme);
  if (theme === "dark" || theme === "midnight") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

interface ChallengeDetail {
  id: number;
  challengedId: number;
  status: string;
}

function usePendingChallengeCount(profileId: number | null) {
  const { data } = useQuery<ChallengeDetail[]>({
    queryKey: ["challenges", profileId],
    queryFn: () => customFetch<ChallengeDetail[]>(`/api/challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 15000,
    staleTime: 10000,
  });
  if (!data || !profileId) return 0;
  return data.filter((c) => c.status === "pending" && c.challengedId === profileId).length;
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
  const { profileId } = useAuth();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { data: profile } = useGetProfile(profileId as number, { query: { enabled: !!profileId } });
  const pendingCount = usePendingChallengeCount(profileId);

  useFontTheme();
  useChallengeNotifications(profileId);

  React.useEffect(() => {
    applyAppTheme(profile?.theme ?? "light");
  }, [profile?.theme]);

  const navItems = [
    { href: "/", label: "Home", icon: Home, badge: 0 },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy, badge: 0 },
    { href: "/challenges", label: "Challenges", icon: Swords, badge: pendingCount },
    { href: "/stats", label: "Stats", icon: BarChart2, badge: 0 },
    { href: "/themes", label: "Themes", icon: Palette, badge: 0 },
    { href: "/profile", label: isSignedIn ? (user?.firstName || "Account") : "Profile", icon: User, badge: 0 },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200" style={{ minHeight: "100svh" }}>
      <header className="border-b bg-card py-4 px-6 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-primary">
          Game Hub
        </Link>

        {/* Gems badge */}
        {profileId && profile?.gems !== undefined && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-800 ml-2 mr-auto hidden sm:flex">
            <Gem className="w-3.5 h-3.5" />
            <span>{profile.gems.toLocaleString()}</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2 relative"
                >
                  <span className="relative inline-flex">
                    {isSignedIn && item.href === "/profile" && user?.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
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
            ))}
          </nav>

          {isSignedIn ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 ml-1 text-muted-foreground"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 ml-1"
              onClick={() => setLocation("/sign-in")}
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-2 py-4 sm:px-4 md:px-8 md:py-8 flex flex-col">
        {children}
      </main>

      <nav className="md:hidden border-t bg-card pt-2 px-2 flex items-center justify-around sticky bottom-0 z-10" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 text-xs min-w-[48px] py-1"
          >
            <div className={`relative p-1.5 rounded-xl ${isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
              {isSignedIn && item.href === "/profile" && user?.imageUrl ? (
                <img src={user.imageUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              <NotifBadge count={item.badge} />
            </div>
            <span className={`text-[10px] ${isActive(item.href) ? "font-semibold text-primary" : "text-muted-foreground"}`}>
              {item.label === "Profile" ? (isSignedIn ? "Account" : "Profile") : item.label}
            </span>
          </Link>
        ))}
        {/* Sign in / out pill */}
        <button
          className="flex flex-col items-center gap-0.5 text-xs min-w-[48px] py-1"
          onClick={() => isSignedIn ? signOut({ redirectUrl: "/" }) : setLocation("/sign-in")}
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
