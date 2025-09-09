import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/User';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserPayload } from '../auth/interfaces/userPayload';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUser(@User() user: UserPayload) {
    return this.usersService.getUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateUser(@User() user: UserPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteUser(@User() user: UserPayload) {
    return this.usersService.deleteUser(user.id);
  }
}
