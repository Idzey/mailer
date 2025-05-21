import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueuesModule } from './queues/queues.module';
import { MailModule } from './mail/mail.module';
import { NodemailerModule } from './nodemailer/nodemailer.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    QueuesModule,
    MailModule,
    NodemailerModule,
  ],
})
export class ModulesModule {}
