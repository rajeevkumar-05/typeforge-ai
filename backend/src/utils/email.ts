import nodemailer from 'nodemailer';

interface EmailOptions { to: string; subject: string; html: string; text?: string; }

const unavailable = () => Object.assign(
  new Error('Password-reset emails are temporarily unavailable. Please try again later.'),
  { statusCode: 503 }
);

function provider(): 'resend' | 'smtp' {
  const selected = process.env.EMAIL_PROVIDER || (process.env.RESEND_API_KEY ? 'resend' : 'smtp');
  if (selected !== 'resend' && selected !== 'smtp') throw unavailable();
  return selected;
}

export function assertEmailConfigured(): void {
  const selected = provider();
  if (selected === 'resend') {
    if (!process.env.RESEND_API_KEY?.trim() || !process.env.EMAIL_FROM?.trim()) throw unavailable();
  } else {
    const port = Number(process.env.SMTP_PORT || '587');
    if (!process.env.SMTP_USER?.trim() || !process.env.SMTP_PASS?.trim()
      || !Number.isInteger(port) || port < 1 || port > 65535) throw unavailable();
  }
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  assertEmailConfigured();
  const selected = provider();
  try {
    if (selected === 'resend') {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [options.to], subject: options.subject, html: options.html, text: options.text }),
        signal: AbortSignal.timeout(10000),
      });
      const result = await response.json() as { id?: string };
      if (!response.ok || !result.id) throw new Error('Provider did not accept email');
    } else {
      const port = Number(process.env.SMTP_PORT || '587');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com', port,
        secure: port === 465, requireTLS: port !== 465,
        connectionTimeout: 10000, greetingTimeout: 5000, socketTimeout: 15000,
        auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
      });
      try {
        const info = await transporter.sendMail({
          from: process.env.EMAIL_FROM || `"TypeForge" <${process.env.SMTP_USER}>`,
          ...options,
        });
        if (!info.accepted?.length || info.rejected?.length) throw new Error('Recipient was not accepted');
      } finally { transporter.close(); }
    }
  } catch {
    // Never log recipient addresses, reset URLs, tokens, API keys, or email bodies.
    console.error(`[Email] ${selected} delivery failed. Check provider configuration and logs.`);
    throw unavailable();
  }
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));

export const getPasswordResetEmail = (resetUrl: string): string => {
  const url = escapeHtml(resetUrl);
  return `<!doctype html><html><body style="margin:0;background:#f5f6fa;font-family:Arial,sans-serif;color:#263049">
    <div style="max-width:520px;margin:24px auto;padding:32px;background:#ffffff;border:1px solid #e1e5ee;border-radius:16px">
      <p style="font-size:22px;font-weight:bold;color:#7052c6;margin:0 0 26px">typeforge.</p>
      <h1 style="font-size:25px;margin:0 0 16px">Reset your password</h1>
      <p style="line-height:1.7">We received a request to reset your TypeForge password. Use the button below to choose a new one.</p>
      <p style="margin:28px 0"><a href="${url}" style="display:inline-block;background:#7052c6;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:bold">Choose a new password</a></p>
      <p style="font-size:13px;line-height:1.7;color:#626d83">This link works once and expires in one hour. If you didn’t request this, ignore this email. Your password has not changed.</p>
      <p style="font-size:12px;line-height:1.7;color:#626d83">Button not working? Copy this link into your browser:<br/><a href="${url}" style="color:#7052c6;word-break:break-all">${url}</a></p>
    </div></body></html>`;
};
