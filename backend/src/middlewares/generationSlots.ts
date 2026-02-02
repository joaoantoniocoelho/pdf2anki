import type { Request, Response, NextFunction } from 'express';
import {
  tryAcquireGenerationSlot,
  releaseGenerationSlot,
  tryAcquireUserSlot,
  releaseUserSlot,
} from '../utils/concurrency.js';
import { UserLimitsService } from '../services/UserLimitsService.js';

const limitsService = new UserLimitsService();

/** Retry-After in seconds when 429 is returned (suggest client wait 60s) */
const RETRY_AFTER_SECONDS = 60;

/** Cleanup when rejecting before upload: release quota only (no file yet) */
async function cleanupOnReject(req: Request): Promise<void> {
  if (req.pdfQuotaConsumed && req.user?._id) {
    try {
      await limitsService.releasePdfQuota(req.user._id.toString());
    } catch {
      /* ignore */
    }
  }
}

export function createCheckGenerationSlots() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!tryAcquireGenerationSlot()) {
      await cleanupOnReject(req);
      res.status(429).json({
        error: 'Too many generations in progress',
        message:
          'The server is processing the maximum number of PDFs. Please try again in a minute.',
      });
      res.setHeader('Retry-After', String(RETRY_AFTER_SECONDS));
      return;
    }

    if (!tryAcquireUserSlot(userId)) {
      releaseGenerationSlot();
      await cleanupOnReject(req);
      res.status(409).json({
        error: 'Generation already in progress',
        message:
          'You already have a PDF generation in progress. Wait for it to complete before starting a new one.',
      });
      return;
    }

    req.releaseGenerationSlot = () => releaseGenerationSlot();
    req.releaseUserSlot = () => releaseUserSlot(userId);
    next();
  };
}
