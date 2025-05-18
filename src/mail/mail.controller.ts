import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { SendMailDto } from './dto/sendMail.dto';
import { User } from 'generated/prisma';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send-mail')
  async sendMail(@Body() dto: SendMailDto, @Request() req) {
    try {
      await this.mailService.sendMail(dto, req.user as User);
      return { message: 'Email add mail queue' };
    } catch (error) {
      return { message: 'Failed add mail queue', error: error.message };
    }
  }
}
