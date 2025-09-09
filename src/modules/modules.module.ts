import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './libs/prisma/prisma.module';
import { QueuesModule } from './queues/queues.module';
import { MailModule } from './mail/mail.module';
import { NodemailerModule } from './libs/nodemailer/nodemailer.module';
import { TemplatesModule } from './templates/templates.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    QueuesModule,
    MailModule,
    NodemailerModule,
    TemplatesModule,
    UsersModule,
  ],
})
export class ModulesModule {}
