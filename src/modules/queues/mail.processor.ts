import { Worker } from 'bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisOptions } from 'ioredis';
import { NodemailerService } from 'src/modules/nodemailer/nodemailer.service';

@Injectable()
export class MailProcessor implements OnModuleInit {
  constructor(private readonly mailService: NodemailerService) {}

  onModuleInit() {
    const connection: RedisOptions = {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    };

    const worker = new Worker(
      'mailQueue',
      async (job) => {
        const { from, to, subject, text } = job.data;

        await this.mailService.sendMail(from, to, subject, text);
      },
      { connection },
    );

    worker.on('completed', (job) => {
      console.log(`Задание ${job.id} выполнено`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Задание ${job?.id} упало с ошибкой:`, err);
    });
  }
}
