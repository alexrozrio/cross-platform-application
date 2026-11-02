import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { startGoogleSignIn } from "@/lib/native-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader as Loader2 } from "lucide-react";

const HAS_SIGNED_IN_KEY = "sudoku-has-signed-in";
const PROMPT_DISMISSED_KEY = "sudoku-sign-in-prompt-dismissed";

export function SignInPromptModal() {
  const { isReady, isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!isReady || isSignedIn) return;
    const hasSignedInBefore = localStorage.getItem(HAS_SIGNED_IN_KEY) === "true";
    const dismissed = sessionStorage.getItem(PROMPT_DISMISSED_KEY) === "true";
    if (hasSignedInBefore && !dismissed) {
      sessionStorage.setItem(PROMPT_DISMISSED_KEY, "true");
      setOpen(true);
    }
  }, [isReady, isSignedIn]);

  const handleContinueWithout = () => setOpen(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await startGoogleSignIn();
    } catch {
      setSigningIn(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!signingIn) setOpen(o);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Welcome back</DialogTitle>
          <DialogDescription>
            You've signed in with Google on this device before, but you're not
            signed in right now. Sign in to sync your progress and stats across
            devices, or continue as a guest.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleContinueWithout}
            disabled={signingIn}
          >
            Continue without signing in
          </Button>
          <Button
            className="flex-1"
            onClick={handleSignIn}
            disabled={signingIn}
          >
            {signingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Sign in"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
