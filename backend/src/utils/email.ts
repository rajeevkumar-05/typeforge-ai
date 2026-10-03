import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const transporter = createTransporter();

  if (!transporter) {
    // Fallback: log to console in development
    console.log('─────────────────────────────────────────');
    console.log('📧 EMAIL (no SMTP configured, logging to console)');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.html}`);
    console.log('─────────────────────────────────────────');
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"TypeForge AI" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

export const getPasswordResetEmail = (resetUrl: string): string => {
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #1a1a2e; color: #e0e0e0;">
      <h1 style="color: #e2b714; text-align: center; margin-bottom: 30px;">TypeForge AI</h1>
      <div style="background: #16213e; border-radius: 12px; padding: 30px; border: 1px solid #2a2a4a;">
        <h2 style="color: #ffffff; margin-top: 0;">Password Reset Request</h2>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #e2b714; color: #1a1a2e; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #888; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;
};
