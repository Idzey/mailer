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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@User() user: UserPayload) {
    return user;
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@mail.com' },
        password: { type: 'string', example: 'P@ssw0rd!' },
      },
      required: ['email', 'password'],
    },
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Res({ passthrough: true }) res: Response, @User() user: UserPayload) {
    return this.authService.login(res, user);
  }

  @ApiOperation({ summary: 'User signup' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    await this.authService.createUser(dto);
    return {
      message: 'User created successfully, check your email for verification',
    };
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.authService.logout(res);

    return {
      message: 'Logout successful',
    };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'your-refresh-token' },
      },
      required: ['refreshToken'],
    },
  })
  @Post('refresh')
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return await this.authService.refresh(req, res);
  }

  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
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
