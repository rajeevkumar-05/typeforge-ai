import Test, { ITest } from '../models/Test';
import mongoose from 'mongoose';

interface TestInput {
  user: string;
  duration: number;
  wordsTyped: number;
  charactersTyped: number;
  mistakes: number;
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  language: string;
  mode: string;
  wpmHistory: number[];
}

interface TestStats {
  currentWpm: number;
  averageWpm: number;
  highestWpm: number;
  averageAccuracy: number;
  testsCompleted: number;
  totalTypingTime: number;
  currentStreak: number;
  recentTests: ITest[];
  heatmapData: { date: string; count: number }[];
  performanceData: { date: string; wpm: number; accuracy: number }[];
}

export const saveTest = async (data: TestInput): Promise<ITest> => {
  const test = await Test.create({
    ...data,
    user: new mongoose.Types.ObjectId(data.user),
  });
  return test;
};

export const getUserTests = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ tests: any[]; total: number; pages: number }> => {
  const skip = (page - 1) * limit;
  const [tests, total] = await Promise.all([
    Test.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Test.countDocuments({ user: userId }),
  ]);

  return {
    tests,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const getTestById = async (testId: string): Promise<any> => {
  return Test.findById(testId).lean();
};

export const getTestStats = async (userId: string): Promise<TestStats> => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Get aggregate stats
  const [statsResult] = await Test.aggregate([
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: null,
        averageWpm: { $avg: '$netWpm' },
        highestWpm: { $max: '$netWpm' },
        averageAccuracy: { $avg: '$accuracy' },
        testsCompleted: { $sum: 1 },
        totalTypingTime: { $sum: '$duration' },
      },
    },
  ]);

  // Get most recent test for current WPM
  const latestTest = await Test.findOne({ user: userObjectId })
    .sort({ createdAt: -1 })
    .lean();

  // Get recent 10 tests
  const recentTests: any[] = await Test.find({ user: userObjectId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Calculate streak (consecutive days with tests)
  const streak = await calculateStreak(userObjectId);

  // Heatmap data (last 365 days)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const heatmapData = await Test.aggregate([
    {
      $match: {
        user: userObjectId,
        createdAt: { $gte: oneYearAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', count: 1, _id: 0 } },
  ]);

  // Performance over time (last 30 tests)
  const performanceData: any[] = await Test.find({ user: userObjectId })
    .sort({ createdAt: -1 })
    .limit(30)
    .select('createdAt netWpm accuracy')
    .lean();

  return {
    currentWpm: latestTest?.netWpm || 0,
    averageWpm: Math.round(statsResult?.averageWpm || 0),
    highestWpm: statsResult?.highestWpm || 0,
    averageAccuracy: Math.round((statsResult?.averageAccuracy || 0) * 10) / 10,
    testsCompleted: statsResult?.testsCompleted || 0,
    totalTypingTime: Math.round(statsResult?.totalTypingTime || 0),
    currentStreak: streak,
    recentTests: recentTests,
    heatmapData,
    performanceData: performanceData
      .reverse()
      .map((t) => ({
        date: (t.createdAt as Date).toISOString().split('T')[0],
        wpm: t.netWpm,
        accuracy: t.accuracy,
      })),
  };
};

async function calculateStreak(userId: mongoose.Types.ObjectId): Promise<number> {
  const tests = await Test.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 365 },
  ]);

  if (tests.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = tests.map((t) => t._id);

  // Check if today or yesterday has a test (to allow streak to continue)
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) {
    return 0;
  }

  // Count consecutive days
  let checkDate = dates.includes(todayStr) ? new Date(today) : new Date(yesterday);

  for (const _date of dates) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (dates.includes(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
