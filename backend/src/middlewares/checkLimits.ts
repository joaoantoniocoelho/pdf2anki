import fs from 'fs';
import type { Request, Response, NextFunction } from 'express';
import { UserLimitsService } from '../services/UserLimitsService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { PlanService } from '../services/PlanService.js';

/**
 * Consome quota de PDF de forma atômica ANTES de qualquer upload.
 * Se o processamento falhar depois, o controller deve chamar releasePdfQuota.
 */
export function createCheckPdfLimit() {
  const userLimitsService = new UserLimitsService();
  const userRepository = new UserRepository();
  const planService = new PlanService();

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      const plan = await planService.execute({
        type: 'getPlanByName',
        planName: user.planType,
      });
      if (!plan || Array.isArray(plan)) {
        res.status(500).json({ error: 'Plano não encontrado' });
        return;
      }
      const planLimit = plan.limits.pdfsPerMonth;
      const result = await userRepository.tryConsumePdfQuota(
        user._id.toString(),
        planLimit
      );
      if (!result.consumed) {
        const limits = await userLimitsService.execute({
          type: 'getUserLimits',
          user,
        });
        const lim = limits as {
          limits?: { pdfsPerMonth: number };
          usage?: { pdfUsed: number };
        };
        res.status(403).json({
          error: 'Limite mensal de PDFs atingido',
          limit: lim.limits?.pdfsPerMonth,
          used: lim.usage?.pdfUsed,
          planType: user.planType,
          message:
            user.planType === 'free'
              ? 'Faça upgrade para o plano pago para enviar mais PDFs'
              : 'Você atingiu o limite mensal do seu plano',
        });
        return;
      }
      req.pdfQuotaConsumed = true;
      next();
    } catch (error) {
      console.error('Check PDF limit error:', error);
      res.status(500).json({ error: 'Erro ao verificar limite' });
    }
  };
}

export function createCheckDensityAccess() {
  const userLimitsService = new UserLimitsService();
  const userRepository = new UserRepository();
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      let density = req.body?.density as string | undefined;
      if (density) {
        density = String(density).toLowerCase().trim();
        (req.body as { density?: string }).density = density;
      }
      const isAllowed = await userLimitsService.execute({
        type: 'isDensityAllowed',
        user,
        density: density ?? '',
      });
      if (!isAllowed) {
        if (req.pdfQuotaConsumed) {
          try {
            await userRepository.releasePdfQuota(user._id.toString());
          } catch {
            /* ignorar erro ao liberar */
          }
        }
        const file = req.file as { path?: string } | undefined;
        if (file?.path) {
          try {
            await fs.promises.unlink(file.path);
          } catch {
            /* ignorar */
          }
        }
        const allowedDensities = await userLimitsService.execute({
          type: 'getAllowedDensities',
          user,
        });
        res.status(403).json({
          error: 'Densidade não permitida para seu plano',
          allowedDensities,
          requestedDensity: density,
          planType: user.planType,
          message: 'Faça upgrade para o plano pago para acessar todas as densidades',
        });
        return;
      }
      next();
    } catch (error) {
      console.error('Check density access error:', error);
      res.status(500).json({ error: 'Erro ao verificar acesso' });
    }
  };
}

export function createCheckPlanLimits() {
  const userLimitsService = new UserLimitsService();
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      const limits = await userLimitsService.execute({
        type: 'getUserLimits',
        user,
      });
      req.userLimits = limits as typeof req.userLimits;
      next();
    } catch (error) {
      console.error('Check plan limits error:', error);
      res.status(500).json({ error: 'Erro ao verificar limites do plano' });
    }
  };
}
