import User, { IUser } from '../models/User';

export const getProfile = async (userId: string): Promise<Partial<IUser> | null> => {
  const user = await User.findById(userId).select('-passwordHash -resetPasswordToken -resetPasswordExpires');
  return user;
};

export const updateProfile = async (
  userId: string,
  updates: { username?: string; avatar?: string }
): Promise<Partial<IUser> | null> => {
  if (updates.username) {
    const existing = await User.findOne({ username: updates.username, _id: { $ne: userId } });
    if (existing) {
      throw Object.assign(new Error('Username already taken'), { statusCode: 400 });
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-passwordHash -resetPasswordToken -resetPasswordExpires');

  return user;
};

export const updatePreferences = async (
  userId: string,
  preferences: Partial<IUser['preferences']>
): Promise<Partial<IUser> | null> => {
  const updateFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(preferences)) {
    updateFields[`preferences.${key}`] = value;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select('-passwordHash -resetPasswordToken -resetPasswordExpires');

  return user;
};
