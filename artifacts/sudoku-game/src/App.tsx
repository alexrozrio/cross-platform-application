import React, { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { AuthProvider } from "@/hooks/use-auth";
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

// ─── Clerk config ─────────────────────────────────────────────────────────────

// REQUIRED — copy verbatim. Resolves the key from window.location.hostname so
// the same build serves multiple Clerk custom domains.
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// REQUIRED — empty in dev (Clerk hits dev FAPI directly), auto-set in prod.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

// Force Clerk to load its JS from the official CDN rather than attempting to
// serve it from the Replit dev domain (which causes a failed-to-load error).
const clerkJSUrl = "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@6/dist/clerk.browser.js";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#4f46e5",
    colorForeground: "#1c1917",
    colorMutedForeground: "#78716c",
    colorDanger: "#dc2626",
    colorBackground: "#faf9f7",
    colorInput: "#f5f5f4",
    colorInputForeground: "#1c1917",
    colorNeutral: "#d6d3d1",
    fontFamily: '"Outfit", sans-serif',
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-foreground font-bold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground",
    footerActionLink: "text-primary",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-green-600",
    alertText: "text-foreground",
    logoBox: "mb-2",
    logoImage: "w-10 h-10",
    socialButtonsBlockButton: "border border-border hover:bg-muted/50",
    formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90",
    formFieldInput: "border-input bg-input text-foreground",
    footerAction: "border-t border-border",
    dividerLine: "bg-border",
    alert: "border border-border",
    otpCodeFieldInput: "border-input",
    formFieldRow: "",
    main: "",
  },
};

// ─── Cache invalidation on user change ───────────────────────────────────────

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const id = user?.id ?? null;
      if (prevRef.current !== undefined && prevRef.current !== id) qc.clear();
      prevRef.current = id;
    });
    return unsub;
  }, [addListener, qc]);

  return null;
}

// ─── Sign-in / sign-up pages ──────────────────────────────────────────────────

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        forceRedirectUrl={`${basePath}/`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        forceRedirectUrl={`${basePath}/`}
      />
    </div>
  );
}

// ─── Inner router (inside ClerkProvider + QueryClientProvider) ────────────────

function Router() {
  return (
    <AuthProvider>
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
          {/* REQUIRED — /*? matches bare URL and Clerk OAuth sub-paths */}
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </AuthProvider>
  );
}

// ─── App with Clerk wired up ──────────────────────────────────────────────────

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      clerkJSUrl={clerkJSUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Router />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <TooltipProvider>
        <ClerkProviderWithRoutes />
        <Toaster />
        <SonnerToaster position="top-right" richColors closeButton />
      </TooltipProvider>
    </WouterRouter>
  );
}
