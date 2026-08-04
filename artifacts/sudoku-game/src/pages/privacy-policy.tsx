import React from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
        <p className="text-muted-foreground mt-1 text-sm">Last updated: July 2026</p>
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
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To identify you across sessions and devices.</li>
            <li>To display your stats, rank, and leaderboard position for Sudoku and Memory Match.</li>
            <li>To show your username, avatar, and badges on public profiles and leaderboards.</li>
            <li>To send login-streak and reward notifications within the app.</li>
            <li>To improve game balance and fix bugs.</li>
          </ul>
          <p>We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">3. Authentication</h2>
          <p>
            Sign-in is handled via Google OAuth. We never see or store your password. Google shares only the data you authorise (name, email, profile photo) with us. Please review Google's privacy policy for details on how they handle your data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">4. Cookies & Local Storage</h2>
          <p>
            We use browser local storage to cache your profile ID and device identifier between visits. Authentication sessions are managed using secure, server-side session cookies. We do not use advertising or tracking cookies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">5. Data Retention</h2>
          <p>
            Your profile and game history — including both Sudoku and Memory Match activity — are retained as long as your account is active. You can delete your data at any time by contacting us — see Section 8.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">6. Children's Privacy</h2>
          <p>
            This service is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us so we can delete it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">7. Security</h2>
          <p>
            We use industry-standard measures to protect your data in transit (TLS) and at rest. No system is 100 % secure; please use a strong, unique password with any linked account and keep your device secure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">8. Contact</h2>
          <p>
            Questions about this policy? Reach us at <span className="text-foreground font-medium">privacy@sudokugame.app</span>. We will respond within 30 days.
          </p>
        </section>
      </div>
    </div>
  );
}
