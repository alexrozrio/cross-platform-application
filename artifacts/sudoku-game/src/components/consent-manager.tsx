import React from "react";
import { Check, Cookie, Settings, X } from "lucide-react";
import { Link } from "wouter";
import {
  type ConsentPreferences,
  CONSENT_CHANGED_EVENT,
  CONSENT_OPEN_EVENT,
  getStoredConsent,
  applyGoogleConsent,
  loadGoogleAnalytics,
  setConsent,
} from "@/lib/consent";

const defaultPreferences: ConsentPreferences = {
  analytics: false,
  ads: false,
};

function ChoiceRow({
  checked,
  onChange,
  title,
  description,
  required = false,
}: {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  title: string;
  description: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3">
      <input
        type="checkbox"
        checked={checked}
        disabled={required}
        onChange={(event) => onChange?.(event.target.checked)}
        className="mt-1 h-4 w-4 accent-primary"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {title}
          {required && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Required
            </span>
          )}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

export function ConsentManager() {
  const [preferences, setPreferences] = React.useState<ConsentPreferences | null>(null);
  const [draft, setDraft] = React.useState<ConsentPreferences>(defaultPreferences);
  const [showPreferences, setShowPreferences] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setPreferences(stored);
      setDraft(stored);
      applyGoogleConsent(stored);
      if (stored.analytics) loadGoogleAnalytics();
    }
    setIsReady(true);

    const handleConsentChange = (event: Event) => {
      const next = (event as CustomEvent<ConsentPreferences>).detail;
      if (next) {
        setPreferences(next);
        setDraft(next);
      }
    };

    window.addEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
    const handleOpenPreferences = () => {
      const current = getStoredConsent() ?? defaultPreferences;
      setDraft(current);
      setShowPreferences(true);
    };

    window.addEventListener(CONSENT_OPEN_EVENT, handleOpenPreferences);
    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
      window.removeEventListener(CONSENT_OPEN_EVENT, handleOpenPreferences);
    };
  }, []);

  const savePreferences = (next: ConsentPreferences) => {
    setConsent(next);
    setPreferences(next);
    setDraft(next);
    setShowPreferences(false);
  };

  if (!isReady) return null;

  return (
    <>
      {!preferences && !showPreferences && (
        <section
          role="dialog"
          aria-labelledby="consent-title"
          className="fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] z-[70] mx-auto max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-2xl sm:inset-x-auto sm:bottom-4 sm:left-4 sm:right-auto"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
              <Cookie className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="consent-title" className="text-sm font-semibold text-foreground">
                Choose your privacy settings
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                We use optional analytics to improve the games. Advertising storage is ready for future AdSense use but is not currently active. You can change your choices at any time.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => savePreferences({ analytics: true, ads: true })}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Accept all
                </button>
                <button
                  type="button"
                  onClick={() => savePreferences(defaultPreferences)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Reject optional
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(defaultPreferences);
                    setShowPreferences(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Settings className="h-3.5 w-3.5" aria-hidden="true" />
                  Customize
                </button>
                <Link
                  href="/privacy"
                  className="ml-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {showPreferences && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-3 sm:items-center">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-settings-title"
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="privacy-settings-title" className="text-lg font-semibold text-foreground">
                  Privacy choices
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Choose which optional services may use cookies or similar technologies. Your choices are stored on this device.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close privacy choices"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <ChoiceRow
                checked
                required
                title="Essential storage"
                description="Keeps sign-in sessions, preferences, and offline game progress working."
              />
              <ChoiceRow
                checked={draft.analytics}
                onChange={(checked) => setDraft((current) => ({ ...current, analytics: checked }))}
                title="Analytics"
                description="Allows Google Analytics to measure visits and performance so we can improve the Service."
              />
              <ChoiceRow
                checked={draft.ads}
                onChange={(checked) => setDraft((current) => ({ ...current, ads: checked }))}
                title="Advertising"
                description="Allows advertising storage and personalization signals if Google AdSense is enabled in the future. Ads are not currently active."
              />
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => savePreferences(defaultPreferences)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Reject optional
              </button>
              <button
                type="button"
                onClick={() => savePreferences(draft)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Save choices
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}