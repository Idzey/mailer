import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailQueue } from 'src/queues/mail.queue';

@Module({
  controllers: [MailController],
  providers: [MailService, MailQueue],
})
export class MailModule {}
