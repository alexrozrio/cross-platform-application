import { useEffect, useState, type MouseEvent } from "react";
import {
  AppUpdate,
  AppUpdateAvailability,
  AppUpdateResultCode,
  FlexibleUpdateInstallStatus,
} from "@capawesome/capacitor-app-update";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

const REQUIRED_UPDATE_PRIORITY = 4;
const UPDATE_SHOWN_KEY_PREFIX = "play-app-update-shown:";

const UPDATE_SCOPES = {
  available: "available",
  downloaded: "downloaded",
} as const;

type UpdateScope = (typeof UPDATE_SCOPES)[keyof typeof UPDATE_SCOPES];

type UpdatePrompt = {
  type: "required" | "flexible" | "store" | "downloaded";
  versionCode: string;
  currentVersionName?: string;
};

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function updateShownKey(scope: UpdateScope, versionCode: string): string {
  return `${UPDATE_SHOWN_KEY_PREFIX}${scope}:${versionCode}`;
}

function hasShownUpdateToday(scope: UpdateScope, versionCode: string): boolean {
  try {
    return localStorage.getItem(updateShownKey(scope, versionCode)) === localDateKey();
  } catch {
    return false;
  }
}

function rememberUpdateShown(scope: UpdateScope, versionCode: string) {
  try {
    localStorage.setItem(updateShownKey(scope, versionCode), localDateKey());
  } catch {
    // A storage failure should not prevent the update prompt from being shown.
  }
}

export function AndroidAppUpdatePrompt() {
  const [prompt, setPrompt] = useState<UpdatePrompt | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
      return;
    }

    let disposed = false;
    let checking = false;
    let appStateListener: { remove: () => Promise<void> } | undefined;
    let updateStateListener: { remove: () => Promise<void> } | undefined;
    let latestVersionCode = "unknown";
    let latestCurrentVersionName: string | undefined;

    const showDownloadedPrompt = (versionCode: string, currentVersionName?: string) => {
      if (disposed || hasShownUpdateToday(UPDATE_SCOPES.downloaded, versionCode)) return;
      rememberUpdateShown(UPDATE_SCOPES.downloaded, versionCode);
      setPrompt({ type: "downloaded", versionCode, currentVersionName });
    };

    const checkForUpdate = async () => {
      if (disposed || checking) return;
      checking = true;

      try {
        const info = await AppUpdate.getAppUpdateInfo();
        if (disposed) return;

        const versionCode = info.availableVersionCode ?? "unknown";
        latestVersionCode = versionCode;
        latestCurrentVersionName = info.currentVersionName;

        if (info.updateAvailability === AppUpdateAvailability.UPDATE_IN_PROGRESS) {
          const result = await AppUpdate.performImmediateUpdate();
          if (
            !disposed &&
            result.code !== AppUpdateResultCode.OK &&
            result.code !== AppUpdateResultCode.NOT_AVAILABLE
          ) {
            setPrompt({ type: "required", versionCode, currentVersionName: info.currentVersionName });
          }
          return;
        }

        if (info.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
          showDownloadedPrompt(versionCode, info.currentVersionName);
          return;
        }

        if (
          info.installStatus === FlexibleUpdateInstallStatus.PENDING ||
          info.installStatus === FlexibleUpdateInstallStatus.DOWNLOADING ||
          info.installStatus === FlexibleUpdateInstallStatus.INSTALLING
        ) {
          setPrompt(null);
          return;
        }

        if (info.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
          setPrompt(null);
          return;
        }

        const isRequired = (info.updatePriority ?? 0) >= REQUIRED_UPDATE_PRIORITY;
        if (isRequired) {
          setPrompt({ type: "required", versionCode, currentVersionName: info.currentVersionName });
          return;
        }

        if (hasShownUpdateToday(UPDATE_SCOPES.available, versionCode)) return;

        rememberUpdateShown(UPDATE_SCOPES.available, versionCode);
        setPrompt({
          type: info.flexibleUpdateAllowed ? "flexible" : "store",
          versionCode,
          currentVersionName: info.currentVersionName,
        });
      } catch (error) {
        console.warn("Could not check for a Google Play update", error);
      } finally {
        checking = false;
      }
    };

    const registerListeners = async () => {
      try {
        const listener = await AppUpdate.addListener(
          "onFlexibleUpdateStateChange",
          ({ installStatus }) => {
            if (disposed) return;
            if (installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
              showDownloadedPrompt(latestVersionCode, latestCurrentVersionName);
            } else if (
              installStatus === FlexibleUpdateInstallStatus.FAILED ||
              installStatus === FlexibleUpdateInstallStatus.CANCELED
            ) {
              toast.error("The app update could not be downloaded. Please try again later.");
            }
          },
        );
        if (disposed) void listener.remove();
        else updateStateListener = listener;
      } catch (error) {
        console.warn("Could not register the app update listener", error);
      }

      try {
        const listener = await CapacitorApp.addListener(
          "appStateChange",
          ({ isActive }) => {
            if (isActive) void checkForUpdate();
          },
        );
        if (disposed) void listener.remove();
        else appStateListener = listener;
      } catch (error) {
        console.warn("Could not register the app resume listener", error);
      }

      void checkForUpdate();
    };

    void registerListeners();

    return () => {
      disposed = true;
      if (appStateListener) void appStateListener.remove();
      if (updateStateListener) void updateStateListener.remove();
    };
  }, []);

  const dismissPrompt = () => {
    if (!prompt || prompt.type === "required") return;
    setPrompt(null);
  };

  const handleUpdate = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!prompt || isWorking) return;

    setIsWorking(true);
    try {
      if (prompt.type === "required") {
        const result = await AppUpdate.performImmediateUpdate();
        if (result.code === AppUpdateResultCode.OK) {
          setPrompt(null);
        } else if (
          result.code === AppUpdateResultCode.NOT_ALLOWED ||
          result.code === AppUpdateResultCode.NOT_AVAILABLE
        ) {
          await AppUpdate.openAppStore();
          setPrompt(null);
        } else if (result.code !== AppUpdateResultCode.CANCELED) {
          toast.error("Could not start the required update. Please try again.");
        }
        return;
      }

      if (prompt.type === "downloaded") {
        await AppUpdate.completeFlexibleUpdate();
        setPrompt(null);
        return;
      }

      if (prompt.type === "flexible") {
        const result = await AppUpdate.startFlexibleUpdate();
        if (result.code === AppUpdateResultCode.OK) {
          setPrompt(null);
          toast.success("The update is downloading in the background.");
        } else if (result.code === AppUpdateResultCode.CANCELED) {
          dismissPrompt();
        } else if (
          result.code === AppUpdateResultCode.NOT_ALLOWED ||
          result.code === AppUpdateResultCode.NOT_AVAILABLE
        ) {
          await AppUpdate.openAppStore();
          setPrompt(null);
        } else {
          toast.error("Could not start the update. Please try again.");
        }
        return;
      }

      await AppUpdate.openAppStore();
      setPrompt(null);
    } catch (error) {
      console.error("Could not start the Google Play update", error);
      toast.error("Could not open the update. Please try again later.");
    } finally {
      setIsWorking(false);
    }
  };

  if (!prompt) return null;

  const isRequired = prompt.type === "required";
  const isDownloaded = prompt.type === "downloaded";
  const actionLabel = isDownloaded
    ? "Restart and update"
    : prompt.type === "store"
      ? "Open Play Store"
      : prompt.type === "flexible"
        ? "Download update"
        : "Update now";

  const title = isRequired
    ? "Update required"
    : isDownloaded
      ? "Update ready to install"
      : "App update available";

  const subtitle = isRequired
    ? "An important update is required to keep playing."
    : isDownloaded
      ? "The update has finished downloading. Restart to finish installing it."
      : "A newer version of Play Brain Games is ready with more games and features.";

  return (
    <AlertDialog
      open={Boolean(prompt)}
      onOpenChange={(open) => {
        if (!open) dismissPrompt();
      }}
    >
      <AlertDialogContent
        className="w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl"
        data-testid="dialog-android-app-update"
      >
        <div className="relative overflow-hidden bg-primary px-6 pb-10 pt-8 text-center text-primary-foreground">
          <div
            className="pointer-events-none absolute inset-0 select-none opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 80%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative">
            <div className="mb-3 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 ring-4 ring-primary-foreground/30">
                <Download className="h-8 w-8 text-primary-foreground drop-shadow" />
              </div>
            </div>
            <AlertDialogTitle
              className="text-2xl font-bold tracking-tight text-primary-foreground"
              data-testid="text-app-update-title"
            >
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-1 text-sm text-primary-foreground/80">
              {subtitle}
            </AlertDialogDescription>
          </div>
        </div>

        <div className="px-6 pt-5">
          <div className="rounded-xl border border-border bg-card p-4 text-center shadow-md">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-500" />
              <span className="text-lg font-bold text-primary">What’s new</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {isRequired
                ? "Install the latest version to continue with the newest games, challenges, and fixes."
                : isDownloaded
                  ? "Restart now to finish installing the latest version."
                  : prompt.currentVersionName
                    ? `You’re on v${prompt.currentVersionName}. Update to get the newest games, daily challenges, rewards, and fixes.`
                    : "Update to get the newest games, daily challenges, rewards, and fixes."}
            </p>
          </div>
        </div>

        <AlertDialogFooter className="px-6 pb-6 pt-4 sm:justify-center">
          {!isRequired && (
            <AlertDialogCancel
              className="h-11 w-full rounded-xl px-6 text-base font-semibold sm:w-auto"
              data-testid="button-app-update-later"
              disabled={isWorking}
            >
              Later
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            className="h-11 w-full rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto"
            data-testid="button-app-update-now"
            disabled={isWorking}
            onClick={handleUpdate}
          >
            {isWorking ? "Please wait…" : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
