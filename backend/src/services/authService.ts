import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import { signToken } from '../utils/jwt';
import { generateResetToken, hashResetToken } from '../utils/helpers';
import { sendEmail, getPasswordResetEmail, assertEmailConfigured } from '../utils/email';

interface AuthResult {
  user: Partial<IUser>;
  token: string;
}

export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResult> => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    if (existingUser.email === email) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 400 });
    }
    throw Object.assign(new Error('Username already taken'), { statusCode: 400 });
  }

  const user = await User.create({
    username,
    email,
    passwordHash: password,
    provider: 'local',
  });

  const token = signToken(user._id.toString());

  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  if (user.provider !== 'local') {
    throw Object.assign(
      new Error(`This account uses ${user.provider} login. Please sign in with ${user.provider}.`),
      { statusCode: 401 }
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const token = signToken(user._id.toString());

  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
    token,
  };
};

const invalidReset = () => Object.assign(new Error('This reset link is invalid, expired, or already used.'), { statusCode: 400 });

export const forgotPassword = async (email: string): Promise<void> => {
  // Configuration failures apply to every email address, before account lookup.
  assertEmailConfigured();
  const configuredUrl = (process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173')).split(',')[0].trim();
  let frontend: URL;
  try {
    frontend = new URL(configuredUrl);
    if (!['http:', 'https:'].includes(frontend.protocol)) throw new Error('Invalid origin');
    if (process.env.NODE_ENV === 'production' && frontend.protocol !== 'https:') throw new Error('HTTPS frontend required');
  } catch {
    throw Object.assign(new Error('Password recovery is temporarily unavailable.'), { statusCode: 503 });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase(), provider: 'local' });
  // Google-only and unknown accounts receive the same generic response.
  if (!user) return;
  // Server-side per-account cooldown; the client countdown is only a convenience.
  if (user.resetPasswordExpires && user.resetPasswordExpires.getTime() > Date.now() + 3540000) return;

  const resetToken = generateResetToken();
  const tokenHash = hashResetToken(resetToken);
  user.resetPasswordToken = tokenHash;
  user.resetPasswordExpires = new Date(Date.now() + 3600000);
  await user.save();

  const resetUrl = new URL(`/reset-password/${resetToken}`, frontend.origin).toString();
  try {
    await sendEmail({
      to: user.email, subject: 'Reset your TypeForge password',
      html: getPasswordResetEmail(resetUrl),
      text: `Reset your TypeForge password: ${resetUrl}\nThis link works once and expires in one hour. Ignore this message if you did not request it.`,
    });
  } catch (error) {
    // Conditional cleanup must not invalidate a newer request made concurrently.
    await User.updateOne({ _id: user._id, resetPasswordToken: tokenHash }, {
      $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
    });
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  if (!/^[a-f0-9]{64}$/i.test(token)) throw invalidReset();
  if (Array.from(newPassword).length < 6 || Buffer.byteLength(newPassword, 'utf8') > 72) {
    throw Object.assign(new Error('Use at least 6 characters and no more than 72 bytes.'), { statusCode: 400 });
  }
  // Query + update atomically consumes the token, so concurrent submissions cannot reuse it.
  // findOneAndUpdate does not run the model's pre-save hook, so hash explicitly here.
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const user = await User.findOneAndUpdate({
    resetPasswordToken: hashResetToken(token),
    resetPasswordExpires: { $gt: new Date() }, provider: 'local',
  }, {
    $set: { passwordHash },
    $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
  });
  if (!user) throw invalidReset();
};

export const generateOAuthToken = (user: IUser): AuthResult => {
  const token = signToken(user._id.toString());
  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
    token,
  };
};
