import mongoose, { Schema, Document } from 'mongoose';

export interface ITest extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
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
  createdAt: Date;
}

const testSchema = new Schema<ITest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    wordsTyped: {
      type: Number,
      required: true,
    },
    charactersTyped: {
      type: Number,
      required: true,
    },
    mistakes: {
      type: Number,
      required: true,
      default: 0,
    },
    rawWpm: {
      type: Number,
      required: true,
    },
    netWpm: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    language: {
      type: String,
      default: 'english',
    },
    mode: {
      type: String,
      required: true,
      enum: ['time-15', 'time-30', 'time-60', 'time-120', 'words', 'custom', 'zen', 'quote', 'code'],
    },
    wpmHistory: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for efficient queries
testSchema.index({ user: 1, createdAt: -1 });
testSchema.index({ netWpm: -1 });
testSchema.index({ createdAt: -1 });
testSchema.index({ mode: 1, netWpm: -1 });

const Test = mongoose.model<ITest>('Test', testSchema);
export default Test;
