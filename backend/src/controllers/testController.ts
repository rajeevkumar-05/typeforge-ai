import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as testService from '../services/testService';

export const saveTest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const test = await testService.saveTest({
      user: req.user!._id.toString(),
      ...req.body,
    });
    res.status(201).json(test);
  } catch (error) {
    next(error);
  }
};

export const getUserTests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await testService.getUserTests(req.user!._id.toString(), page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getTestById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const test = await testService.getTestById(req.params.id as string);
    if (!test) {
      res.status(404).json({ message: 'Test not found' });
      return;
    }
    res.json(test);
  } catch (error) {
    next(error);
  }
};

export const getTestStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await testService.getTestStats(req.user!._id.toString());
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
