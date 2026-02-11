import { Resend } from 'resend';

export interface SendVerificationEmailParams {
  to: string;
  name: string;
  /** Backend URL: GET /api/auth/verify-email?token=... (backend verifies and redirects to front /email-verified?status=...) */
  verifyUrl: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export class EmailService {
  private readonly resendApiKey = process.env.RESEND_API_KEY;
  private readonly fromEmail = process.env.FROM_EMAIL ?? '';

  async sendVerificationEmail(params: SendVerificationEmailParams): Promise<void> {
    const { to, name, verifyUrl } = params;

    if (!this.resendApiKey || !this.fromEmail) {
      console.log('[EmailService] Verification email (stub) – RESEND_API_KEY or FROM_EMAIL not set');
      return;
    }

    if (!verifyUrl || typeof verifyUrl !== 'string' || !verifyUrl.startsWith('http')) {
      console.warn('[EmailService] sendVerificationEmail: invalid verifyUrl');
      return;
    }

    const safeName = escapeHtml(name);
    const resend = new Resend(this.resendApiKey);

    const { data, error } = await resend.emails.send({
      from: this.fromEmail,
      to,
      subject: 'Confirme seu email – Revisa Aí',
      html: `
        <p>Olá, ${safeName}!</p>
        <p>Clique no link abaixo para confirmar seu email e liberar a geração de flashcards:</p>
        <p><a href="${verifyUrl}" style="color: #2563eb; text-decoration: underline;">Confirmar email</a></p>
        <p>Se você não criou uma conta, pode ignorar este email.</p>
      `.trim(),
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('No data returned from Resend');
    }

    console.log('[EmailService] Verification email sent:', data.id ?? 'ok');
  }
}
