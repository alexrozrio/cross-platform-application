import { Router } from "express";
import { sendChallengeNotification } from "../lib/email";

const router = Router();

// Debug-only endpoint — lets you verify Gmail SMTP works without creating a real challenge.
// GET /api/test-email?to=you@example.com
// Returns a JSON summary of what happened (credentials present, email sent, any error).
router.get("/test-email", async (req, res): Promise<void> => {
  const to = typeof req.query.to === "string" ? req.query.to : null;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  const status: Record<string, unknown> = {
    GMAIL_USER: gmailUser ? `${gmailUser.slice(0, 4)}…` : "(not set)",
    GMAIL_APP_PASSWORD: gmailPass ? `(set, length=${gmailPass.length})` : "(not set)",
    to: to ?? "(not provided — add ?to=your@email.com)",
  };

  if (!gmailUser || !gmailPass) {
    res.status(200).json({ ok: false, reason: "Gmail credentials not configured", status });
    return;
  }

  if (!to) {
    res.status(200).json({ ok: false, reason: "Provide ?to=your@email.com", status });
    return;
  }

  // Send a direct test email
  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.default.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });

    const info = await transport.sendMail({
      from: `"Brain Games 4 All Test" <${gmailUser}>`,
      to,
      subject: "✅ Brain Games 4 All — email test",
      text: "If you're reading this, Gmail SMTP is working correctly.",
    });

    res.json({ ok: true, messageId: info.messageId, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.json({ ok: false, error: message, status });
  }
});

export default router;
