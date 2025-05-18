import { Module } from '@nestjs/common';
import { MailProcessor } from './mail.processor';
import { MailQueue } from './mail.queue';
import { ResendService } from 'src/resend/resend.service';

@Module({
  providers: [MailProcessor, MailQueue, ResendService],
  exports: [MailQueue],
})
export class QueuesModule {}
