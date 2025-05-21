import { MailQueue } from './../queues/mail.queue';
import { Injectable } from '@nestjs/common';
import { SendMailDto } from './dto/sendMail.dto';
import jwtPayload from 'src/modules/auth/interfaces/jwtPayload';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailService {
  constructor(
    private readonly mailQueue: MailQueue,
    private readonly prismaService: PrismaService,
  ) {}

  async createMail(dto: SendMailDto, user: jwtPayload) {
    await this.mailQueue.addEmailJob({
      ...dto,
      from: user?.name,
    });
  }
}
