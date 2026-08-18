import React, { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, useSearch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { useLoginReward } from "@/hooks/use-login-reward";
import { LoginRewardModal } from "@/components/login-reward-modal";
import { EventModal } from "@/components/event-modal";
import { Layout } from "@/components/layout";
import { PageLoader } from "@/components/page-loader";
import { ErrorBoundary } from "@/components/error-boundary";
import { modeFromQuery } from "@/lib/sudoku-routes";

// Pages — lazy-loaded so each route only ships the JS it needs, instead of
// one large bundle that has to load before the app becomes interactive.
const Portal = lazy(() => import("@/pages/portal"));
const SudokuHome = lazy(() => import("@/pages/home"));
const Game = lazy(() => import("@/pages/game"));
function SudokuBookmarkRoute({ params }: { params: { grid: string; difficulty: string } }) {
  const search = useSearch();
  const urlParams = new URLSearchParams(search);
  const gameIdParam = urlParams.get("gameId");
  const gameId = gameIdParam !== null ? Number(gameIdParam) : NaN;

  if (Number.isInteger(gameId) && gameId >= 0) {
    return <Game key={`${params.grid}:${params.difficulty}:${search}`} id={String(gameId)} />;
  }
  return (
    <SudokuHome
      gridSlug={params.grid}
      difficultySlug={params.difficulty}
      modeSlug={modeFromQuery(urlParams.get("mode")) ?? undefined}
    />
  );
}
const Profile = lazy(() => import("@/pages/profile"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));
function StatsRedirect() {
  const [, setLocation] = useLocation();
  React.useEffect(() => { setLocation("/profile"); }, []);
  return null;
}

function SudokuGameRoute({ params }: { params: { id: string } }) {
  const [location] = useLocation();
  const query = location.split("?")[1] ?? "";

  // Offline games reuse id 0. Include the query string in the React key so
  // "Play again", difficulty changes, and result-screen grid changes remount
  // the game instead of leaving the completed board mounted.
  return <Game key={`${params.id}:${query}`} id={params.id} />;
}

const Themes = lazy(() => import("@/pages/themes"));
const BadgeSharePage = lazy(() => import("@/pages/badge-share"));
const DailyChallenge = lazy(() => import("@/pages/daily-challenge"));
const Challenges = lazy(() => import("@/pages/challenges"));
const About = lazy(() => import("@/pages/about"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const MemoryMatch = lazy(() => import("@/pages/memory"));
function MemoryBookmarkRoute({ params }: { params: { difficulty: string } }) {
  return <MemoryMatch difficultySlug={params.difficulty} />;
}
const MemoryChallengePage = lazy(() => import("@/pages/memory-challenge"));
const PublicProfilePage = lazy(() => import("@/pages/public-profile"));
const ChallengeInvitePage = lazy(() => import("@/pages/challenge-invite"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function Router() {
  const { rewardState, claimReward, dismissReward } = useLoginReward();
  const [, setLocation] = useLocation();

  const handleDismiss = React.useCallback(() => {
    dismissReward();
    if (rewardState.profileId) {
      queryClient.invalidateQueries({ queryKey: [`/api/profiles/${rewardState.profileId}`] });
    }
  }, [dismissReward, rewardState.profileId]);

  return (
    <AuthProvider onProfileSynced={claimReward}>
      {rewardState.show && rewardState.result && (
        <LoginRewardModal
          open={rewardState.show}
          onClose={handleDismiss}
          gemsAwarded={rewardState.result.gemsAwarded}
          loginStreak={rewardState.result.loginStreak}
          totalGems={rewardState.result.totalGems}
        />
      )}
      <EventModal />
      <Layout>
        <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Portal} />
            <Route path="/sudoku/:grid/:difficulty" component={SudokuBookmarkRoute} />
            <Route path="/sudoku">
              {() => <SudokuHome />}
            </Route>
            <Route path="/themes" component={Themes} />
            <Route path="/profile" component={Profile} />
            <Route path="/game/:id" component={SudokuGameRoute} />
            <Route path="/daily-challenge" component={DailyChallenge} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/stats" component={StatsRedirect} />
            <Route path="/challenges" component={Challenges} />
            <Route path="/badges/:token" component={BadgeSharePage} />
            <Route path="/memory/:difficulty" component={MemoryBookmarkRoute} />
            <Route path="/memory">
              {() => <MemoryMatch />}
            </Route>
            <Route path="/memory-challenge" component={MemoryChallengePage} />
            <Route path="/players/:profileId">
              {(params) => <PublicProfilePage profileId={params.profileId} />}
            </Route>
            <Route path="/invite/:token">
              {(params) => <ChallengeInvitePage token={params.token} />}
            </Route>
            <Route path="/about" component={About} />
            <Route path="/privacy" component={PrivacyPolicy} />
            <Route path="/terms" component={TermsOfService} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
        </ErrorBoundary>
      </Layout>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}
