import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../libs/prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { updateTemplateDto } from './dto/update-template.dto';
import * as hbs from 'handlebars';
import { Template } from '@prisma/client';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getTemplates(userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const templates = await this.prisma.template.findMany({
      where: {
        userId,
      },
    });

    if (!templates || templates.length === 0) {
      throw new NotFoundException('No templates found for this user');
    }

    return templates;
  }

  async createTemplate(userId: string, dto: CreateTemplateDto) {
    const { name, html } = dto;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const template = await this.prisma.template.create({
      data: {
        name,
        html,
        userId,
      },
    });

    if (!template) {
      throw new NotFoundException('Failed to create template');
    }

    return template;
  }

  async getTemplateById(userId: string, templateId: string) {
    if (!userId || !templateId) {
      throw new BadRequestException('User ID and Template ID are required');
    }

    const template = await this.prisma.template.findFirst({
      where: {
        id: templateId,
        userId,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async updateTemplateById(
    userId: string,
    templateId: string,
    dto: updateTemplateDto,
  ) {
    const { name, html } = dto;

    if (!userId || !templateId) {
      throw new BadRequestException('User ID and Template ID are required');
    }

    const template = await this.prisma.template.update({
      where: {
        id: templateId,
        userId,
      },
      data: {
        name,
        html,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async deleteTemplateById(userId: string, templateId: string) {
    if (!userId || !templateId) {
      throw new BadRequestException('User ID and Template ID are required');
    }

    const template = await this.prisma.template.delete({
      where: {
        id: templateId,
        userId,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async compileTemplate(
    userId: string,
    templateId: string,
    data: Record<string, any>,
  ) {
    if (!userId || !templateId) {
      throw new BadRequestException('User ID and Template ID are required');
    }

    const template = await this.prisma.template.findFirst({
      where: {
        id: templateId,
        userId,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    this.checkVariablesExist(template, data);

    const compiledTemplate = hbs.compile(template.html)(data);

    return compiledTemplate;
  }

  checkVariablesExist(template: Template, data: Record<string, any>) {
    const variableRegex = /{{\s*([^}\s]+)\s*}}/g;
    const requiredVariables = new Set<string>();
    let match;

    while ((match = variableRegex.exec(template.html)) !== null) {
      requiredVariables.add(match[1]);
    }

    const missingVariables = Array.from(requiredVariables).filter(
      (key) => !(key in data),
    );

    if (missingVariables.length > 0) {
      throw new BadRequestException(
        `Missing variables: ${missingVariables.join(', ')}`,
      );
    }
  }
}
