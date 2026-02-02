import mongoose, { type Model } from 'mongoose';
import type { PlanType } from '../types/index.js';

export interface IUserDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  planType: PlanType;
  monthlyPdfCount: number;
  lastPdfResetDate: Date;
  /** Mês da quota atual (YYYY-MM); usado para reset atômico */
  pdfUsageMonth?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUserDoc>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
      select: false,
    },
    planType: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free',
    },
    monthlyPdfCount: { type: Number, default: 0 },
    lastPdfResetDate: { type: Date, default: Date.now },
    pdfUsageMonth: { type: String, default: '0000-00' },
  },
  { timestamps: true }
);

export const UserModel: Model<IUserDoc> =
  mongoose.models.User ?? mongoose.model<IUserDoc>('User', userSchema);
