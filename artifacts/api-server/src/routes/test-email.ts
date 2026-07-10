import { Router } from "express";
import { Resend } from "resend";

const router = Router();

// Debug-only endpoint — lets you verify Resend is working without creating a real challenge.
// GET /api/test-email?to=you@example.com
// Returns a JSON summary of what happened (credentials present, email sent, any error).
router.get("/test-email", async (req, res): Promise<void> => {
  const to = typeof req.query.to === "string" ? req.query.to : null;

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? "Brain Games 4 All <onboarding@resend.dev>";

  const status: Record<string, unknown> = {
    RESEND_API_KEY: apiKey ? `(set, length=${apiKey.length})` : "(not set)",
    RESEND_FROM_EMAIL: fromAddress,
    to: to ?? "(not provided — add ?to=your@email.com)",
  };

  if (!apiKey) {
    res.status(200).json({ ok: false, reason: "RESEND_API_KEY not configured", status });
    return;
  }

  if (!to) {
    res.status(200).json({ ok: false, reason: "Provide ?to=your@email.com", status });
    return;
  }

  try {
    const client = new Resend(apiKey);
    const { data, error } = await client.emails.send({
      from: fromAddress,
      to,
      subject: "✅ Brain Games 4 All — email test",
      text: "If you're reading this, Resend is working correctly.",
    });

    if (error) {
      res.json({ ok: false, error, status });
    } else {
      res.json({ ok: true, id: data?.id, status });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.json({ ok: false, error: message, status });
  }
});

export default router;
