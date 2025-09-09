import { TemplatesService } from './../templates/templates.service';
import { MailQueue } from './../queues/mail.queue';
import { Injectable } from '@nestjs/common';
import { SendMailDto } from './dto/sendMail.dto';
import { PrismaService } from '../libs/prisma/prisma.service';
import { SendTemplateDto } from './dto/sendTemplate.dto';
import { UserPayload } from '../auth/interfaces/userPayload';

@Injectable()
export class MailService {
  constructor(
    private readonly mailQueue: MailQueue,
    private readonly prisma: PrismaService,
    private readonly templatesService: TemplatesService,
  ) {}

  async createMail(dto: SendMailDto, user: UserPayload) {
    await this.mailQueue.addEmailJob({
      ...dto,
      from: user?.email,
    });
  }

  async getMailById(id: string) {
    return await this.prisma.mail.findUnique({
      where: {
        id,
      },
    });
  }

  async getMailsByUserId(userId: string) {
    return await this.prisma.mail.findMany({
      where: {
        userId,
      },
    });
  }

  async createMailonTemplates(dto: SendTemplateDto, user: UserPayload) {
    const { templateId, ...data } = dto;
    const template = await this.templatesService.compileTemplate(
      user.id,
      templateId,
      dto.data,
    );

    const mail = await this.mailQueue.addEmailJob({
      ...data,
      html: template,
      from: user.name,
    });

    return mail;
  }
}
