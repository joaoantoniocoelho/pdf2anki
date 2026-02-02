import type { Response, NextFunction } from 'express';
import type { Request } from 'express';
import { UserRepository } from '../repositories/UserRepository.js';
import { verifyToken } from '../config/jwt.js';

export function createAuthenticate() {
  const userRepository = new UserRepository();
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
      }
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (!decoded) {
        res.status(401).json({ error: 'Token inválido ou expirado' });
        return;
      }
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        res.status(401).json({ error: 'Usuário não encontrado' });
        return;
      }
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ error: 'Não autorizado' });
    }
  };
}
