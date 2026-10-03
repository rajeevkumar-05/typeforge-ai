import User, { IUser } from '../models/User';
import { signToken } from '../utils/jwt';
import { generateResetToken, hashResetToken } from '../utils/helpers';
import { sendEmail, getPasswordResetEmail } from '../utils/email';

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

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists
    return;
  }

  const resetToken = generateResetToken();
  user.resetPasswordToken = hashResetToken(resetToken);
  user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
  await user.save();

  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'TypeForge AI - Password Reset',
    html: getPasswordResetEmail(resetUrl),
  });
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  const hashedToken = hashResetToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw Object.assign(new Error('Invalid or expired reset token'), { statusCode: 400 });
  }

  user.passwordHash = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
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
