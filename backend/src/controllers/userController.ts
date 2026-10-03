import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as userService from '../services/userService';

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.getProfile(req.user!._id.toString());
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, avatar } = req.body;
    const user = await userService.updateProfile(req.user!._id.toString(), {
      username,
      avatar,
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.updatePreferences(
      req.user!._id.toString(),
      req.body
    );
    res.json(user);
  } catch (error) {
    next(error);
  }
};
