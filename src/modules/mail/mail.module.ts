import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { PrismaModule } from '../libs/prisma/prisma.module';
import { QueuesModule } from '../queues/queues.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [PrismaModule, QueuesModule, TemplatesModule],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
