import React from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-12">
      <button
        onClick={() => setLocation("/profile")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground mt-1 text-sm">Last updated: June 2025</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">1. Acceptance</h2>
          <p>
            By accessing or using this Sudoku game ("Service") you agree to be bound by these Terms. If you do not agree, please stop using the Service immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">2. Eligibility</h2>
          <p>
            The Service is available to anyone aged 13 or older. By using it you represent that you meet this requirement. Users under 18 should have parental consent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">3. Your Account</h2>
          <p>
            You are responsible for keeping your account credentials secure and for all activity that occurs under your account. Notify us immediately of any unauthorised use. We reserve the right to suspend accounts that violate these Terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use automated tools, bots, or scripts to manipulate scores or leaderboards.</li>
            <li>Attempt to reverse-engineer, decompile, or extract source code from the Service.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            <li>Impersonate another user or provide false information.</li>
            <li>Violate any applicable laws or regulations.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">5. Virtual Items & Gems</h2>
          <p>
            Gems and other in-game items have no real-world monetary value. They cannot be transferred, sold, or exchanged outside the Service. We may adjust the earning or spending of virtual items at any time without notice or liability.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">6. Intellectual Property</h2>
          <p>
            All content in the Service — including puzzles, graphics, themes, and code — is owned by or licensed to us. You may not reproduce or distribute it without our written permission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">7. Disclaimers</h2>
          <p>
            The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access or that the Service will be error-free.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">9. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Continued use of the Service after changes are posted constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">10. Contact</h2>
          <p>
            Questions? Email <span className="text-foreground font-medium">legal@sudokugame.app</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
