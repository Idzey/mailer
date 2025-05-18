import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { QueuesModule } from './queues/queues.module';
import { MailModule } from './mail/mail.module';
import { ResendModule } from './resend/resend.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    PrismaModule,
    QueuesModule,
    MailModule,
    ResendModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
