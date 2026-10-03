import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  passwordHash?: string;
  avatar: string;
  provider: 'local' | 'google';
  providerId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  preferences: {
    theme: 'dark' | 'oled' | 'light' | 'highContrast';
    accentColor: string;
    soundEnabled: boolean;
    smoothCaret: boolean;
    fontSize: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    providerId: {
      type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    preferences: {
      theme: {
        type: String,
        enum: ['dark', 'oled', 'light', 'highContrast'],
        default: 'dark',
      },
      accentColor: {
        type: String,
        default: '#e2b714',
      },
      soundEnabled: {
        type: Boolean,
        default: false,
      },
      smoothCaret: {
        type: Boolean,
        default: true,
      },
      fontSize: {
        type: Number,
        default: 18,
        min: 12,
        max: 32,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Index for performance
userSchema.index({ provider: 1, providerId: 1 });

const User = mongoose.model<IUser>('User', userSchema);
export default User;
