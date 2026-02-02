import type { IUserDoc } from '../models/User.js';
import type { UserLimitsResult } from '../services/UserLimitsService.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDoc;
      userLimits?: UserLimitsResult;
      /** Indicates that PDF quota was consumed atomically; used for rollback on failure */
      pdfQuotaConsumed?: boolean;
      /** Callback to release global generation slot (must be called in finally) */
      releaseGenerationSlot?: () => void;
      /** Callback to release per-user generation slot (must be called in finally) */
      releaseUserSlot?: () => void;
    }
  }
}

export {};
