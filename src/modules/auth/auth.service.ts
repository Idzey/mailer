import { CookieService } from './services/cookie.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from 'src/modules/auth/interfaces/userPayload';
import { CreateUserDto } from './dto/createUser.dto';
import { Request, Response } from 'express';
import jwtPayload from 'src/modules/auth/interfaces/jwtPayload';
import RefreshTokenPayload from 'src/modules/auth/interfaces/refreshTokenPayload';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly nodemailerService: NodemailerService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly CookieService: CookieService,
  ) {}

  async getMe(email: string) {
    const user = await this.findUserByEmail(email);

    return user;
  }

  async createUser(dto: CreateUserDto) {
    const { name, email, password } = dto;

    const hashedPassword = await this.passwordService.hashPassword(password);

    const checkEmailExists = await this.findUserByEmail(email);

    if (checkEmailExists) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await this.sendVerificationEmail(user.email);

    return user;
  }

  private async findUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  private async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }

  async sendVerificationEmail(email: string) {
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const emailToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
      },
      {
        expiresIn: '1h',
      },
    );

    await this.nodemailerService.sendVirificationEmail(user.email, emailToken);
  }

  async validateUser(email: string, password: string) {
    const user = await this.findUserByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user?.name,
    };
  }

  login(res: Response, user: UserPayload) {
    const payload: jwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const { accessToken } = this.auth(res, payload);

    return {
      access_token: accessToken,
    };
  }

  private auth(res: Response, payload: jwtPayload) {
    const { accessToken, refreshToken } =
      this.tokenService.generateAuthTokens(payload);

    this.CookieService.setRefreshTokenCookie(res, refreshToken);

    return {
      accessToken,
    };
  }

  logout(res: Response) {
    this.CookieService.clearCookie(res, 'refresh_token');
  }

  async refresh(req: Request, res: Response) {
    const refreshToken: string = this.CookieService.getCookie(
      req,
      'refresh_token',
    );

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const refreshPayload: RefreshTokenPayload =
      this.jwtService.verify(refreshToken);

    if (refreshPayload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type');
    }

    const user = await this.findUserById(refreshPayload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload: jwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const { accessToken } = this.auth(res, payload);

    return {
      access_token: accessToken,
    };
  }

  async verifyEmail(token: string) {
    const payload: { sub: string } = this.jwtService.verify(token);

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
