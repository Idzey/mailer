import { MailQueue } from './../queues/mail.queue';
import { Injectable } from '@nestjs/common';
import { SendMailDto } from './dto/sendMail.dto';
import { User } from 'generated/prisma';

@Injectable()
export class MailService {
  constructor(private readonly mailQueue: MailQueue) {}

  async sendMail(dto: SendMailDto, user: User) {
    await this.mailQueue.addEmailJob({
      ...dto,
      from: `${user?.name}`,
    });
  }
}
