import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

@Injectable()
export class MailQueue {
  private queue: Queue;

  constructor() {
    const connection: RedisOptions = {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    };

    this.queue = new Queue('mailQueue', { connection });
  }

  async addEmailJob(data: {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attempts?: number;
    delay?: number;
  }) {
    await this.queue.add('sendMail', data, {
      delay: data.delay || 0,
      removeOnComplete: 1000,
      removeOnFail: 5000,
      attempts: data.attempts || 3,
    });
  }
}
