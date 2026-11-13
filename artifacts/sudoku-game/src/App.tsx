import React, { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, useSearch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { useLoginReward } from "@/hooks/use-login-reward";
import { LoginRewardModal } from "@/components/login-reward-modal";
import { Layout } from "@/components/layout";
import { PageLoader } from "@/components/page-loader";
import { ErrorBoundary } from "@/components/error-boundary";
import { ConsentManager } from "@/components/consent-manager";
import { AndroidAppUpdatePrompt } from "@/components/android-app-update-prompt";
import { SignInPromptModal } from "@/components/sign-in-prompt-modal";
import { modeFromQuery } from "@/lib/sudoku-routes";
import {
  appOpenPathFromUrl,
  appPathFromAppUrl,
  nativeSchemeUrlForPath,
  nativeAuthCallbackFromAppUrl,
  PUBLIC_SITE_ORIGIN,
} from "@/lib/app-links";
import {
  cancelNativeGoogleSignIn,
  completeNativeGoogleSignIn,
} from "@/lib/native-auth";
import { toast } from "sonner";

// Pages — lazy-loaded so each route only ships the JS it needs, instead of
// one large bundle that has to load before the app becomes interactive.
const Portal = lazy(() => import("@/pages/portal"));
const SudokuHome = lazy(() => import("@/pages/home"));
const Guides = lazy(() => import("@/pages/guides"));
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
      autoStartFromBookmark
    />
  );
}
const Profile = lazy(() => import("@/pages/profile"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));
function StatsRedirect() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  React.useEffect(() => {
    setLocation(`/profile${search ? `?${search}` : ""}`);
  }, [search, setLocation]);
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
const AccountDeletion = lazy(() => import("@/pages/account-deletion"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const MemoryMatch = lazy(() => import("@/pages/memory"));
const WordSearch = lazy(() => import("@/pages/word-search"));
const WordSearchDailyChallengePage = lazy(() => import("@/pages/word-search-challenge"));
const Minesweeper = lazy(() => import("@/pages/minesweeper"));
const MinesweeperDailyChallengePage = lazy(() => import("@/pages/minesweeper-challenge"));
const SlidePuzzle = lazy(() => import("@/pages/slide-puzzle"));
const SlidePuzzleDailyChallengePage = lazy(() => import("@/pages/slide-puzzle-challenge"));
const QuizPage = lazy(() => import("@/pages/quiz"));
const QuizDailyChallengePage = lazy(() => import("@/pages/quiz-challenge"));
function MemoryBookmarkRoute({ params }: { params: { difficulty: string } }) {
  return <MemoryMatch difficultySlug={params.difficulty} />;
}
const MemoryChallengePage = lazy(() => import("@/pages/memory-challenge"));
const JigsawPage = lazy(() => import("@/pages/jigsaw"));
const JigsawDailyChallengePage = lazy(() => import("@/pages/jigsaw-challenge"));
const JigsawChallengesPage = lazy(() => import("@/pages/jigsaw-challenges"));
const JigsawInvitePage = lazy(() => import("@/pages/jigsaw-invite"));
function JigsawInviteRoute({ params }: { params: { token: string } }) {
  return <JigsawInvitePage token={params.token} />;
}
const PublicProfilePage = lazy(() => import("@/pages/public-profile"));
const ChallengeInvitePage = lazy(() => import("@/pages/challenge-invite"));
const NotFound = lazy(() => import("@/pages/not-found"));

function OpenAppRoute() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const destination =
    appOpenPathFromUrl(`${PUBLIC_SITE_ORIGIN}/open${search ? `?${search}` : ""}`) ?? "/";

  React.useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setLocation(destination);
      return;
    }

    // Universal Links open the native app before this page when iOS association
    // is configured. This scheme handoff also supports installs without that
    // association; if the app is absent, the timer keeps the user on the web.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.location.href = nativeSchemeUrlForPath(destination);
    }

    const fallback = window.setTimeout(() => setLocation(destination), isIOS ? 1400 : 0);
    return () => window.clearTimeout(fallback);
  }, [destination, setLocation]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <p>Opening your challenge…</p>
      <a className="text-primary underline" href={destination}>Continue to the challenge</a>
    </main>
  );
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function Router() {
  const { rewardState, claimReward, dismissReward } = useLoginReward();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let disposed = false;
    let listener: { remove: () => Promise<void> } | undefined;
    const openAppUrl = (url: string) => {
      const authCallback = nativeAuthCallbackFromAppUrl(url);
      if (authCallback) {
        if (authCallback.code) {
          void completeNativeGoogleSignIn(authCallback.code).catch(
            (error: unknown) => {
              void cancelNativeGoogleSignIn();
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Google sign-in failed. Please try again.",
              );
            },
          );
        } else {
          void cancelNativeGoogleSignIn();
          toast.error(
            authCallback.error === "cancelled"
              ? "Google sign-in was cancelled."
              : "Google sign-in failed. Please try again.",
          );
        }
        return;
      }

      const path = appPathFromAppUrl(url);
      if (path) setLocation(path);
    };

    void CapacitorApp.addListener("appUrlOpen", ({ url }) => openAppUrl(url))
      .then((handle) => {
        if (disposed) void handle.remove();
        else listener = handle;
      })
      .catch((error) => console.warn("Could not register app-link listener", error));

    void CapacitorApp.getLaunchUrl()
      .then((launch) => {
        if (!disposed && launch?.url) openAppUrl(launch.url);
      })
      .catch((error) => console.warn("Could not read app launch URL", error));

    return () => {
      disposed = true;
      if (listener) void listener.remove();
    };
  }, [setLocation]);

  const handleDismiss = React.useCallback(() => {
    dismissReward();
    if (rewardState.profileId) {
      queryClient.invalidateQueries({ queryKey: [`/api/profiles/${rewardState.profileId}`] });
    }
  }, [dismissReward, rewardState.profileId]);

  return (
    <AuthProvider onProfileSynced={claimReward}>
      <ErrorBoundary>
        <SignInPromptModal />
        {rewardState.show && rewardState.result && (
          <LoginRewardModal
            open={rewardState.show}
            onClose={handleDismiss}
            gemsAwarded={rewardState.result.gemsAwarded}
            loginStreak={rewardState.result.loginStreak}
            totalGems={rewardState.result.totalGems}
          />
        )}
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/open" component={OpenAppRoute} />
              <Route path="/" component={Portal} />
              <Route path="/guides" component={Guides} />
              <Route path="/sudoku/:grid/:difficulty" component={SudokuBookmarkRoute} />
              <Route path="/sudoku">
                {() => <SudokuHome />}
              </Route>
              <Route path="/themes" component={Themes} />
              <Route path="/profile" component={Profile} />
              <Route path="/game/:id" component={SudokuGameRoute} />
              <Route path="/daily-challenge" component={DailyChallenge} />
              <Route path="/leaderboard/sudoku">
                {() => <Leaderboard gamePage="sudoku" />}
              </Route>
              <Route path="/leaderboard/memory">
                {() => <Leaderboard gamePage="memory" />}
              </Route>
              <Route path="/leaderboard/jigsaw">
                {() => <Leaderboard gamePage="jigsaw" />}
              </Route>
              <Route path="/leaderboard/word-search">
                {() => <Leaderboard gamePage="word-search" />}
              </Route>
              <Route path="/leaderboard/minesweeper">
                {() => <Leaderboard gamePage="minesweeper" />}
              </Route>
              <Route path="/leaderboard/slide-puzzle">
                {() => <Leaderboard gamePage="slide-puzzle" />}
              </Route>
              <Route path="/leaderboard/science-quiz">
                {() => <Leaderboard gamePage="science-quiz" />}
              </Route>
              <Route path="/leaderboard/maths-quiz">
                {() => <Leaderboard gamePage="maths-quiz" />}
              </Route>
              <Route path="/leaderboard/gk-quiz">
                {() => <Leaderboard gamePage="gk-quiz" />}
              </Route>
              <Route path="/leaderboard/quiz">
                {() => <Leaderboard gamePage="science-quiz" />}
              </Route>
              <Route path="/leaderboard">
                {() => <Leaderboard />}
              </Route>
              <Route path="/stats" component={StatsRedirect} />
              <Route path="/challenges" component={Challenges} />
              <Route path="/badges/:token" component={BadgeSharePage} />
              <Route path="/memory/:difficulty" component={MemoryBookmarkRoute} />
              <Route path="/memory">
                {() => <MemoryMatch />}
              </Route>
              <Route path="/word-search" component={WordSearch} />
              <Route path="/word-search-challenge" component={WordSearchDailyChallengePage} />
              <Route path="/minesweeper" component={Minesweeper} />
              <Route path="/minesweeper-challenge" component={MinesweeperDailyChallengePage} />
              <Route path="/slide-puzzle" component={SlidePuzzle} />
              <Route path="/slide-puzzle-challenge" component={SlidePuzzleDailyChallengePage} />
              <Route path="/quiz/:subject" component={QuizPage} />
              <Route path="/quiz">
                {() => <QuizPage params={{}} />}
              </Route>
              <Route path="/quiz-challenge" component={QuizDailyChallengePage} />
              <Route path="/memory-challenge" component={MemoryChallengePage} />
              <Route path="/jigsaw" component={JigsawPage} />
              <Route path="/jigsaw-challenge" component={JigsawDailyChallengePage} />
              <Route path="/jigsaw-challenges" component={JigsawChallengesPage} />
              <Route path="/jigsaw-invite/:token" component={JigsawInviteRoute} />
              <Route path="/player/:profileId">
                {(params) => <PublicProfilePage profileId={params.profileId} />}
              </Route>
              <Route path="/players/:profileId">
                {(params) => <PublicProfilePage profileId={params.profileId} />}
              </Route>
              <Route path="/invite/:token">
                {(params) => <ChallengeInvitePage token={params.token} />}
              </Route>
              <Route path="/about" component={About} />
              <Route path="/privacy" component={PrivacyPolicy} />
              <Route path="/account-deletion" component={AccountDeletion} />
              <Route path="/terms" component={TermsOfService} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default function App() {
  React.useLayoutEffect(() => {
    document.documentElement.classList.remove("capacitor-native-startup");
  }, []);

  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ConsentManager />
          <AndroidAppUpdatePrompt />
          <Router />
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}
