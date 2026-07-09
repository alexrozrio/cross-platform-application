import nodemailer from "nodemailer";
import { db, users, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return transporter;
}

async function getEmailForProfile(profileId: number): Promise<{ email: string; firstName: string } | null> {
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId));
  if (!profile?.replitUserId) return null;

  const [user] = await db.select().from(users).where(eq(users.id, profile.replitUserId));
  if (!user?.email) return null;

  return {
    email: user.email,
    firstName: user.firstName ?? profile.username ?? "Player",
  };
}

export async function sendChallengeNotification({
  challengedProfileId,
  challengerUsername,
  difficulty,
  gridSize,
  challengeId,
}: {
  challengedProfileId: number;
  challengerUsername: string;
  difficulty: string;
  gridSize: number;
  challengeId: number;
}): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    // No Gmail credentials configured — silently skip
    return;
  }

  const recipient = await getEmailForProfile(challengedProfileId);
  if (!recipient) return;

  const frontendUrl =
    process.env.FRONTEND_URL ??
    (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:19093");

  const challengeUrl = `${frontendUrl}/challenges`;

  const gridLabel: Record<number, string> = { 3: "3×3 Baby", 4: "4×4 Mini", 9: "9×9 Classic", 16: "16×16 Pro" };
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const sizeLabel = gridLabel[gridSize] ?? `${gridSize}×${gridSize}`;

  const fromAddress = process.env.GMAIL_USER!;

  try {
    await transport.sendMail({
      from: `"Brain Games 4 All" <${fromAddress}>`,
      to: recipient.email,
      subject: `⚔️ ${challengerUsername} challenged you to a Sudoku duel!`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f4f1;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f1;padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:#3b5a8a;padding:28px 32px;text-align:center;">
            <p style="margin:0;font-size:28px;">⚔️</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">You've been challenged!</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi ${recipient.firstName},</p>
            <p style="margin:0 0 24px;font-size:16px;color:#374151;">
              <strong>${challengerUsername}</strong> has challenged you to a Sudoku duel on <strong>Brain Games 4 All</strong>. Think you can beat them?
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;border-radius:8px;padding:20px;margin-bottom:28px;">
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#6b7280;">Grid size</td>
                <td style="padding:6px 0;font-size:14px;color:#111827;text-align:right;font-weight:600;">${sizeLabel}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#6b7280;">Difficulty</td>
                <td style="padding:6px 0;font-size:14px;color:#111827;text-align:right;font-weight:600;">${diffLabel}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#6b7280;">Prize</td>
                <td style="padding:6px 0;font-size:14px;color:#0891b2;text-align:right;font-weight:600;">💎 10 gems for the winner</td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${challengeUrl}" style="display:inline-block;background:#3b5a8a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.2px;">Accept the challenge →</a>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
              You can accept or decline from the Challenges page. The challenge expires in 7 days.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f8f7f4;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Brain Games 4 All · You're receiving this because someone challenged you</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  } catch (err) {
    console.error("Failed to send challenge notification email:", err);
  }
}
