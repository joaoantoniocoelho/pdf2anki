import type { IUserDoc } from '../models/User.js';
import type { UserLimitsResult } from '../services/UserLimitsService.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDoc;
      userLimits?: UserLimitsResult;
      /** Indica que a quota de PDF foi consumida atomicamente; usado para rollback em falha */
      pdfQuotaConsumed?: boolean;
    }
  }
}

export {};
