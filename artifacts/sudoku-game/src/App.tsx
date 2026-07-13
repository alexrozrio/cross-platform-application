import React from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { useLoginReward } from "@/hooks/use-login-reward";
import { LoginRewardModal } from "@/components/login-reward-modal";
import { EventModal } from "@/components/event-modal";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

// Pages
import Portal from "@/pages/portal";
import SudokuHome from "@/pages/home";
import Game from "@/pages/game";
import Profile from "@/pages/profile";
import Leaderboard from "@/pages/leaderboard";
import Stats from "@/pages/stats";
import Themes from "@/pages/themes";
import BadgeSharePage from "@/pages/badge-share";
import DailyChallenge from "@/pages/daily-challenge";
import Challenges from "@/pages/challenges";
import About from "@/pages/about";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import MemoryMatch from "@/pages/memory";
import MemoryChallengePage from "@/pages/memory-challenge";
import PublicProfilePage from "@/pages/public-profile";

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
        <Switch>
          <Route path="/" component={Portal} />
          <Route path="/sudoku" component={SudokuHome} />
          <Route path="/themes" component={Themes} />
          <Route path="/profile" component={Profile} />
          <Route path="/game/:id">
            {(params) => <Game id={params.id} />}
          </Route>
          <Route path="/daily-challenge" component={DailyChallenge} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/stats" component={Stats} />
          <Route path="/challenges" component={Challenges} />
          <Route path="/badges/:token" component={BadgeSharePage} />
          <Route path="/memory" component={MemoryMatch} />
          <Route path="/memory-challenge" component={MemoryChallengePage} />
          <Route path="/players/:profileId">
            {(params) => <PublicProfilePage profileId={params.profileId} />}
          </Route>
          <Route path="/about" component={About} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsOfService} />
          <Route component={NotFound} />
        </Switch>
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
