import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { apiUrl } from "@/lib/api-base-url";
import { setConsent } from "@/lib/consent";
import { usePageMeta } from "@/components/page-meta";

export default function AccountDeletion() {
  const { isSignedIn } = useAuth();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  usePageMeta({
    title: "Delete Your Account and Data | Play Brain Games . Online",
    description:
      "Permanently delete your Play Brain Games account and associated profile and game data.",
    path: "/account-deletion",
  });

  const deleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(apiUrl("/api/account"), {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(body?.message ?? "We couldn't delete your account. Please try again.");
      }
    } catch (error) {
      setIsDeleting(false);
      toast.error(error instanceof Error ? error.message : "We couldn't delete your account. Please try again.");
      return;
    }

    // The server deletion has succeeded, so local-storage restrictions should
    // not make the user believe that the account is still active.
    try {
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
      } catch {
        // Storage can be unavailable in private or restricted browser contexts.
      }
      setConsent({ analytics: false, ads: false });
    } catch (error) {
      console.warn("Account was deleted, but local preferences could not be cleared.", error);
    }
    window.location.replace(import.meta.env.BASE_URL);
  };

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 pb-12">
      <Button asChild variant="outline" size="sm">
        <Link href="/profile">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Account
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Delete Your Account and Data</CardTitle>
          <CardDescription>
            You can permanently remove your account and associated data from Play Brain Games.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Deletion removes your Google sign-in identity from this service, your profile, Sudoku
              and Memory Match history, statistics, badges, and related challenge records from our
              servers.
            </p>
            <p>
              The device used to submit the request will also clear local app data, including guest
              and offline progress. Local copies on other devices must be cleared on those devices.
              Deletion cannot be undone.
            </p>
          </div>

          {isSignedIn ? (
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={() => setConfirmationOpen(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete my account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign in to the account you want deleted, then return here to confirm deletion.
              </p>
              <Button asChild className="w-full">
                <Link href="/profile">Go to Account and sign in</Link>
              </Button>
            </div>
          )}

          <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
            <p className="font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Can't access your account?
            </p>
            <p className="mt-2 text-muted-foreground">
              Email us to request deletion. We may ask you to verify that you own the account.
            </p>
            <a
              className="mt-3 inline-flex items-center gap-2 font-medium text-foreground underline underline-offset-4"
              href="mailto:support@playbraingames.online?subject=Account%20deletion%20request"
            >
              <Mail className="h-4 w-4" /> support@playbraingames.online
            </a>
          </div>

          <p className="text-xs text-muted-foreground">
            Read our <Link className="underline underline-offset-2" href="/privacy">Privacy Policy</Link> for details.
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete this account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your account, server-side profile and game data, and this
              device's local guest/offline progress. Data stored locally on your other devices will
              remain there until cleared. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void deleteAccount();
              }}
            >
              {isDeleting ? "Deleting…" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
