import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Res,
  Req,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from 'src/common/decorators/User';
import { UserPayload } from 'src/modules/auth/interfaces/userPayload';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@User() user: UserPayload) {
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Res({ passthrough: true }) res: Response, @User() user: UserPayload) {
    return this.authService.login(res, user);
  }

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    await this.authService.createUser(dto);
    return {
      message: 'User created successfully, check your email for verification',
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.authService.logout(res);

    return {
      message: 'Logout successful',
    };
  }

  @Post('refresh')
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return await this.authService.refresh(req, res);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    if (!token) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.authService.verifyEmail(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    return { message: 'Email verified successfully' };
  }
}
