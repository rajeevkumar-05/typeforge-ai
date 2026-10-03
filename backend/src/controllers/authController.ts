import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthRequest } from '../middleware/auth';
import * as authService from '../services/authService';
import { IUser } from '../models/User';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.registerUser(username, email, password);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.cookie('token', '', { maxAge: 0 });
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  res.json({
    user: {
      _id: req.user!._id,
      username: req.user!.username,
      email: req.user!.email,
      avatar: req.user!.avatar,
      preferences: req.user!.preferences,
      createdAt: req.user!.createdAt,
    },
  });
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// Google OAuth
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

export const googleCallback = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate('google', { session: false }, (err: Error, user: IUser) => {
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

    if (err || !user) {
      console.error('[Auth] Google callback error:', err);
      return res.redirect(
        `${clientUrl}/login?error=auth_failed`
      );
    }

    const result = authService.generateOAuthToken(user);
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(
      `${clientUrl}/auth/callback?token=${result.token}`
    );
  })(req, res, next);
};
