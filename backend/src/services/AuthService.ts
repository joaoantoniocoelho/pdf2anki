import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository.js';
import { UserLimitsService } from './UserLimitsService.js';
import { generateToken } from '../config/jwt.js';
import { toUserResponse } from '../utils/user.js';

export type SignupCommand = {
  type: 'signup';
  name: string;
  email: string;
  password: string;
};

export type LoginCommand = {
  type: 'login';
  email: string;
  password: string;
};

export type GetProfileCommand = { type: 'getProfile'; userId: string };

export type AuthCommand =
  | SignupCommand
  | LoginCommand
  | GetProfileCommand

export interface AuthServiceResult {
  user?: Record<string, unknown> & { limits?: unknown };
  token?: string;
}

export class AuthService {
  private readonly userRepository = new UserRepository();
  private readonly userLimitsService = new UserLimitsService();

  constructor() {}

  async execute(cmd: AuthCommand): Promise<AuthServiceResult> {
    switch (cmd.type) {
      case 'signup':
        return this.signup(cmd);
      case 'login':
        return this.login(cmd);
      case 'getProfile':
        return this.getProfile(cmd);
    }
  }

  private async signup(cmd: SignupCommand): Promise<AuthServiceResult> {
    const existingUser = await this.userRepository.findByEmail(cmd.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }
    const user = await this.userRepository.create({
      name: cmd.name,
      email: cmd.email,
      password: cmd.password,
      planType: 'free',
    });
    const token = generateToken(user._id.toString());
    const limits = await this.userLimitsService.execute({
      type: 'getUserLimits',
      user,
    });
    return {
      user: {
        ...toUserResponse(user),
        limits,
      },
      token,
    };
  }

  private async login(cmd: LoginCommand): Promise<AuthServiceResult> {
    const user = await this.userRepository.findByEmail(cmd.email);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }
    const isValid = await bcrypt.compare(cmd.password, user.password);
    if (!isValid) {
      throw new Error('Credenciais inválidas');
    }
    const token = generateToken(user._id.toString());
    const limits = await this.userLimitsService.execute({
      type: 'getUserLimits',
      user,
    });
    return {
      user: {
        ...toUserResponse(user),
        limits,
      },
      token,
    };
  }

  private async getProfile(cmd: GetProfileCommand): Promise<AuthServiceResult> {
    const user = await this.userRepository.findById(cmd.userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    const limits = await this.userLimitsService.execute({
      type: 'getUserLimits',
      user,
    });
    return {
      user: {
        ...toUserResponse(user),
        limits,
      },
    };
  }
}
