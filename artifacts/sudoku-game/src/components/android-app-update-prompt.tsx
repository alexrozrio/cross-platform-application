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
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const OPTIONAL_UPDATE_REMINDER_MS = 24 * 60 * 60 * 1000;
const REQUIRED_UPDATE_PRIORITY = 4;
const DISMISSED_UPDATE_KEY_PREFIX = "play-app-update-dismissed:";

type UpdatePrompt = {
  type: "required" | "flexible" | "store" | "downloaded";
  versionCode: string;
};

function hasDismissedUpdate(versionCode: string): boolean {
  try {
    const dismissedAt = Number(
      localStorage.getItem(`${DISMISSED_UPDATE_KEY_PREFIX}${versionCode}`),
    );
    return Number.isFinite(dismissedAt) &&
      Date.now() - dismissedAt < OPTIONAL_UPDATE_REMINDER_MS;
  } catch {
    return false;
  }
}

function rememberUpdateDismissal(versionCode: string) {
  try {
    localStorage.setItem(
      `${DISMISSED_UPDATE_KEY_PREFIX}${versionCode}`,
      String(Date.now()),
    );
  } catch {
    // A storage failure should not prevent the update prompt from being dismissed.
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

    const checkForUpdate = async () => {
      if (disposed || checking) return;
      checking = true;

      try {
        const info = await AppUpdate.getAppUpdateInfo();
        if (disposed) return;

        const versionCode = info.availableVersionCode ?? "unknown";
        latestVersionCode = versionCode;

        if (info.updateAvailability === AppUpdateAvailability.UPDATE_IN_PROGRESS) {
          const result = await AppUpdate.performImmediateUpdate();
          if (
            !disposed &&
            result.code !== AppUpdateResultCode.OK &&
            result.code !== AppUpdateResultCode.NOT_AVAILABLE
          ) {
            setPrompt({ type: "required", versionCode });
          }
          return;
        }

        if (info.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
          if (!hasDismissedUpdate(versionCode)) {
            setPrompt({ type: "downloaded", versionCode });
          }
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
        if (!isRequired && hasDismissedUpdate(versionCode)) return;

        setPrompt({
          type: isRequired
            ? "required"
            : info.flexibleUpdateAllowed
              ? "flexible"
              : "store",
          versionCode,
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
              setPrompt({ type: "downloaded", versionCode: latestVersionCode });
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
    rememberUpdateDismissal(prompt.versionCode);
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

  return (
    <AlertDialog
      open={Boolean(prompt)}
      onOpenChange={(open) => {
        if (!open) dismissPrompt();
      }}
    >
      <AlertDialogContent
        className="w-[calc(100%-2rem)] max-w-md rounded-xl"
        data-testid="dialog-android-app-update"
      >
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="text-app-update-title">
            {isRequired
              ? "Update required"
              : isDownloaded
                ? "Update ready to install"
                : "App update available"}
          </AlertDialogTitle>
          <AlertDialogDescription data-testid="text-app-update-description">
            {isRequired
              ? "An important update is required to keep playing. Update the app to continue."
              : isDownloaded
                ? "The update has downloaded. Restart the app to finish installing it."
                : "A newer version of Play Brain Games is available with improvements and fixes."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!isRequired && (
            <AlertDialogCancel
              data-testid="button-app-update-later"
              disabled={isWorking}
            >
              Later
            </AlertDialogCancel>
          )}
          <AlertDialogAction
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
