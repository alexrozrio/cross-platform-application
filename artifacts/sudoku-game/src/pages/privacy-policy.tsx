import React from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { usePageMeta } from "@/components/page-meta";

export default function PrivacyPolicy() {
  usePageMeta({
    title: "Privacy Policy | Play Brain Games . Online",
    description:
      "Read how Play Brain Games . Online handles guest play, Google sign-in, game progress, analytics consent, advertising choices, and children's privacy.",
    path: "/privacy",
  });
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-12">
      <button
        onClick={() => setLocation("/profile")}
        className="flex items-center gap-1.5 text-sm text-foreground bg-card border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-card rounded-2xl px-5 py-4 border border-border">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mt-1 text-sm">Last updated: September 10, 2026</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground leading-relaxed bg-card rounded-2xl border border-border px-6 py-5">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">1. Information We Collect</h2>
          <p>
            When you play as a guest we assign your device a random identifier stored only in your browser. When you sign in with Google we receive your name, profile photo, and email address from your Google account and store them to personalise your experience.
          </p>
          <p>
            We also store game-related data you create across both Sudoku and Memory Match: puzzle and game attempts, completion times, scores, settings, and earned badges.
          </p>
          <p>
            If you allow analytics in the privacy choices dialog, we use Google Analytics to understand how visitors use the Service, such as which pages are visited and how the Service performs. Google Analytics may use cookies or similar identifiers and may process usage and device information on our behalf.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To identify you across sessions and devices.</li>
            <li>To display your stats, rank, and leaderboard position for Sudoku and Memory Match.</li>
            <li>To show your username, avatar, and badges on public profiles and leaderboards.</li>
            <li>To send login-streak and reward notifications within the app.</li>
            <li>To improve game balance, understand Service usage, and fix bugs.</li>
          </ul>
          <p>We do not sell or rent your personal information. We share information with service providers only as needed to operate, secure, measure, and improve the Service, or when required by law.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">3. Authentication</h2>
          <p>
            Sign-in is handled via Google OAuth. We never see or store your password. Google shares only the data you authorise (name, email, profile photo) with us. Please review Google's privacy policy for details on how they handle your data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">4. Cookies, Analytics & Local Storage</h2>
          <p>
            We use browser local storage to cache your profile ID, device identifier, preferences, and offline game progress between visits. Authentication sessions are managed using secure, server-side session cookies.
          </p>
          <p>
            Google Analytics is disabled unless you allow it in the privacy choices dialog. If enabled, it may use cookies or similar technologies to measure traffic, usage, and performance. You can change this choice using the Privacy choices button, through your browser settings, or by opting out of Google Analytics with Google's{" "}
            <a
              className="text-foreground font-medium underline underline-offset-2"
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noreferrer"
            >
              Analytics Opt-out Browser Add-on
            </a>
            . Disabling cookies or local storage may affect sign-in, saved preferences, and game progress.
          </p>
          <p>
            We do not currently serve display advertising through the Service. If Google AdSense is enabled, Google and its advertising partners may use cookies or similar identifiers to provide, measure, and prevent fraud in advertising. Where required by law, we will request consent before serving personalized advertising and provide controls to withdraw or change that choice. For more information, review Google's advertising privacy information at{" "}
            <a
              className="text-foreground font-medium underline underline-offset-2"
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noreferrer"
            >
              How Google uses information from sites or apps that use our services
            </a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">5. Third-Party Services</h2>
          <p>
            We use third-party services to operate and improve the Service, including Google OAuth for sign-in and, if you consent, Google Analytics for usage measurement. These providers may process information according to their own privacy policies and the instructions or settings applicable to their services.
          </p>
          <p>
            If advertising is enabled, Google AdSense may process information to deliver and measure ads. Advertising settings and consent choices may affect whether ads are personalized.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">6. Data Retention</h2>
          <p>
            Your profile and game history — including both Sudoku and Memory Match activity — are retained as long as your account is active. You can delete your data at any time by contacting us — see Section 10.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">7. Your Choices and Rights</h2>
          <p>
            You may ask us to provide, correct, or delete the personal information associated with your account. You may also withdraw consent where we rely on consent to process information by opening Privacy choices at any time. Some requests may require us to verify your identity or may be limited by legal obligations.
          </p>
          <p>
            To make a request, contact us using the details in Section 10. If advertising is enabled, you can also manage Google's advertising personalization choices through{" "}
            <a
              className="text-foreground font-medium underline underline-offset-2"
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noreferrer"
            >
              Google Ads Settings
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">8. Children's Privacy</h2>
          <p>
            Play Brain Games . Online is a general-audience, family-friendly service. It includes optional child-friendly modes, such as Baby and Mini grids, but it is not designed exclusively for children. Younger users should use the Service with a parent or guardian's involvement.
          </p>
          <p>
            Child-friendly guest play does not require a child to provide a name, email address, profile photo, or other direct contact information. Guest play may use a random device identifier and store game progress in the browser so the game can work; these are not intended to identify a child by name. Account creation, Google sign-in, and any sharing of personal information should be handled or approved by a parent or guardian.
          </p>
          <p>
            We do not knowingly request direct personal information from children under 13. If you believe a child has provided us with personal data, please contact us so we can review and delete it where appropriate.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">9. Security</h2>
          <p>
            We use industry-standard measures to protect your data in transit (TLS) and at rest. No system is 100 % secure; please use a strong, unique password with any linked account and keep your device secure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">10. Contact</h2>
          <p>
             Questions about this policy? Reach us at <a className="text-foreground font-medium underline underline-offset-2" href="mailto:info@playbraingames.online">info@playbraingames.online</a>. For account or data support, contact <a className="text-foreground font-medium underline underline-offset-2" href="mailto:support@playbraingames.online">support@playbraingames.online</a>. We will respond within 30 days.
          </p>
        </section>
      </div>
    </div>
  );
}
