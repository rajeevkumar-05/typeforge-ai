import Test from '../models/Test';
import { getPeriodStart } from '../utils/helpers';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  bestWpm: number;
  accuracy: number;
  testsCompleted: number;
}

export const getLeaderboard = async (
  period: string = 'alltime',
  limit: number = 50
): Promise<LeaderboardEntry[]> => {
  const periodStart = getPeriodStart(period);

  const matchStage: Record<string, unknown> = {};
  if (period !== 'alltime') {
    matchStage.createdAt = { $gte: periodStart };
  }

  const results = await Test.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$user',
        bestWpm: { $max: '$netWpm' },
        avgAccuracy: { $avg: '$accuracy' },
        testsCompleted: { $sum: 1 },
      },
    },
    { $sort: { bestWpm: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo',
        pipeline: [
          { $project: { username: 1, avatar: 1 } },
        ],
      },
    },
    { $unwind: '$userInfo' },
    {
      $project: {
        userId: '$_id',
        username: '$userInfo.username',
        avatar: '$userInfo.avatar',
        bestWpm: 1,
        accuracy: { $round: ['$avgAccuracy', 1] },
        testsCompleted: 1,
        _id: 0,
      },
    },
  ]);

  return results.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
};
