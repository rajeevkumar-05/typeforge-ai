import { Request, Response, NextFunction } from 'express';
import * as leaderboardService from '../services/leaderboardService';

export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const period = (req.query.period as string) || 'alltime';
    const limit = parseInt(req.query.limit as string) || 50;

    if (!['daily', 'weekly', 'monthly', 'alltime'].includes(period)) {
      res.status(400).json({ message: 'Invalid period. Use: daily, weekly, monthly, alltime' });
      return;
    }

    const leaderboard = await leaderboardService.getLeaderboard(period, limit);
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};
