import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL || "noreply@familyhub.app";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendVerificationEmail(to: string, token: string) {
  const resend = getResend();
  if (!resend) return;

  const link = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">FamilyHub</h2>
      <p>Здравствуйте!</p>
      <p>Подтвердите ваш email, чтобы начать пользоваться FamilyHub:</p>
      <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
        Подтвердить email
      </a>
      <p style="color: #666; font-size: 14px;">Или скопируйте ссылку: <br/>${link}</p>
      <p style="color: #666; font-size: 12px; margin-top: 24px;">Если вы не регистрировались на FamilyHub, проигнорируйте это письмо.</p>
    </div>
  `;

  const { error } = await resend.emails.send({ from: FROM, to, subject: "Подтвердите email — FamilyHub", html });
  if (error) throw new Error(error.message);
}
