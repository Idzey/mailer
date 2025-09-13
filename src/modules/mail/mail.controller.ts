import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SendMailDto } from './dto/sendMail.dto';
import { User } from 'src/common/decorators/User';
import { UserPayload } from '../auth/interfaces/userPayload';
import { SendTemplateDto } from './dto/sendTemplate.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({ status: 201, description: 'Email queued successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('send')
  async sendMail(@Body() dto: SendMailDto, @User() user: UserPayload) {
    try {
      await this.mailService.createMail(dto, user);
      return { message: 'Email add mail queue' };
    } catch (error) {
      return { message: 'Failed add mail queue', error: error.message };
    }
  }

  @ApiOperation({ summary: 'Send an email using a template' })
  @ApiResponse({ status: 201, description: 'Email queued successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('send-template')
  async sendMailTemplate(
    @Body() dto: SendTemplateDto,
    @User() user: UserPayload,
  ) {
    try {
      await this.mailService.createMailonTemplates(dto, user);
      return { message: 'Email add mail queue' };
    } catch (error) {
      return { message: 'Failed add mail queue', error: error.message };
    }
  }
}
