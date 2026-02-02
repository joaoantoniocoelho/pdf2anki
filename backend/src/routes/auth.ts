import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController.js';
import { createAuthenticate } from '../middlewares/auth.js';

export function createAuthRouter(): Router {
  const authController = new AuthController();
  const authenticate = createAuthenticate();
  const router = Router();

  const signupValidation = [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter no mínimo 6 caracteres'),
  ];

  const loginValidation = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
  ];

  router.post('/signup', signupValidation, authController.signup);
  router.post('/login', loginValidation, authController.login);
  router.get('/profile', authenticate, authController.getProfile);

  return router;
}
