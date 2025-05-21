import { Module } from '@nestjs/common';
import { MailProcessor } from './mail.processor';
import { MailQueue } from './mail.queue';
import { NodemailerModule } from '../nodemailer/nodemailer.module';

@Module({
  imports: [NodemailerModule],
  providers: [MailProcessor, MailQueue],
  exports: [MailQueue],
})
export class QueuesModule {}
