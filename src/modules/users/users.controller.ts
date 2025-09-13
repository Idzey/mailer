import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/User';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserPayload } from '../auth/interfaces/userPayload';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Get current user',
    description: 'Get information about the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully fetched.',
  })
  @ApiResponse({
    status: 401,
    description: 'Bad Request.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUser(@User() user: UserPayload) {
    return this.usersService.getUser(user.id);
  }

  @ApiOperation({
    summary: 'Update current user',
    description: 'Update information about the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put()
  async updateUser(@User() user: UserPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(user.id, dto);
  }

  @ApiOperation({
    summary: 'Delete current user',
    description: 'Delete the current user account',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteUser(@User() user: UserPayload) {
    return this.usersService.deleteUser(user.id);
  }
}
