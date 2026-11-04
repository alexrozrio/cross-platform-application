import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Zap, Gem, Hash, GitMerge, Loader } from "lucide-react";
import { toast } from "sonner";

interface MergePreview {
  available: boolean;
  reason?: string;
  guestProfileId?: number;
  guestUsername?: string;
  xp?: number;
  gems?: number;
  games?: number;
}

const REASON_MESSAGES: Record<string, string> = {
  "no-guest": "No guest progress found on this device to merge.",
  "already-merged": "The guest profile on this device has already been merged into an account.",
  "account-already-merged": "Your account has already absorbed a guest profile, so no further merges are possible.",
  "nothing-to-merge": "The guest profile on this device has no XP, gems, or completed games to merge.",
};

export function MergeGuestProgress() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [merging, setMerging] = useState(false);

  const deviceId = typeof window !== "undefined" ? localStorage.getItem("sudoku-device-id") : null;

  const { data: preview, isLoading } = useQuery<MergePreview>({
    queryKey: ["merge-preview", deviceId],
    queryFn: () =>
      customFetch<MergePreview>(`/api/profiles/merge-preview?deviceId=${encodeURIComponent(deviceId ?? "")}`),
    enabled: isSignedIn && !!deviceId,
    staleTime: 30_000,
  });

  if (!isSignedIn || !deviceId || isLoading) return null;

  if (!preview || !preview.available) {
    // Only show a message if the user previously had a guest profile that
    // was merged — otherwise keep the profile page clean.
    if (preview && (preview.reason === "already-merged" || preview.reason === "account-already-merged")) {
      return (
        <Card className="border-green-200/60 bg-green-50/40 dark:border-green-800/30 dark:bg-green-950/10">
          <CardContent className="pt-5 pb-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
              <GitMerge className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">{REASON_MESSAGES[preview.reason ?? ""] ?? ""}</p>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  const handleMerge = async () => {
    setMerging(true);
    try {
      const result = await customFetch<{
        success: boolean;
        xpTransferred: number;
        gemsTransferred: number;
        gamesTransferred: number;
      }>(`/api/profiles/merge`, {
        method: "POST",
        data: { deviceId },
      });
      setConfirmOpen(false);
      toast.success(
        `Merged ${result.xpTransferred.toLocaleString()} XP, ${result.gemsTransferred.toLocaleString()} gems, and ${result.gamesTransferred} game records into your account.`,
      );
      queryClient.invalidateQueries({ queryKey: ["merge-preview"] });
      queryClient.invalidateQueries({ queryKey: [`/api/profiles`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats`] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not merge guest progress.");
    } finally {
      setMerging(false);
    }
  };

  return (
    <>
      <Card className="border-violet-200/60 bg-gradient-to-br from-violet-50 to-indigo-50 dark:border-violet-800/40 dark:from-violet-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-violet-500" />
            Merge Guest Progress
          </CardTitle>
          <CardDescription className="text-xs">
            You have guest progress on this device from before you signed in. Merge it into your account to keep all your points in one place. This can only be done once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-xl border border-violet-200/60 bg-card p-3 text-center dark:border-violet-800/30">
              <Zap className="w-4 h-4 text-violet-500" />
              <p className="text-lg font-bold tabular-nums">{(preview.xp ?? 0).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">XP</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl border border-violet-200/60 bg-card p-3 text-center dark:border-violet-800/30">
              <Gem className="w-4 h-4 text-violet-500" />
              <p className="text-lg font-bold tabular-nums">{(preview.gems ?? 0).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gems</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl border border-violet-200/60 bg-card p-3 text-center dark:border-violet-800/30">
              <Hash className="w-4 h-4 text-violet-500" />
              <p className="text-lg font-bold tabular-nums">{preview.games ?? 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Games</p>
            </div>
          </div>
          <Button
            className="w-full gap-2"
            onClick={() => setConfirmOpen(true)}
            disabled={merging}
          >
            {merging ? <Loader className="w-4 h-4 animate-spin" /> : <GitMerge className="w-4 h-4" />}
            Merge into my account
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={(o) => !merging && setConfirmOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge guest progress into your account?</AlertDialogTitle>
            <AlertDialogDescription>
              {(preview.xp ?? 0).toLocaleString()} XP, {(preview.gems ?? 0).toLocaleString()} gems, and {preview.games ?? 0} game records from the guest profile on this device will be added to your signed-in account. The guest profile will be cleared. This action cannot be undone and can only be done once per account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={merging}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={merging}
              onClick={(e) => {
                e.preventDefault();
                void handleMerge();
              }}
            >
              {merging ? "Merging…" : "Merge progress"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
