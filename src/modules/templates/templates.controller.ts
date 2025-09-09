import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/User';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UserPayload } from '../auth/interfaces/userPayload';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTemplates(@User() user: UserPayload) {
    const templates = await this.templatesService.getTemplates(user.id);
    return templates;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':templateId')
  async getTemplateById(
    @User() user: UserPayload,
    @Param('templateId') templateId: string,
  ) {
    const template = await this.templatesService.getTemplateById(
      user.id,
      templateId,
    );
    return template;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTemplate(
    @User() user: UserPayload,
    @Body() dto: CreateTemplateDto,
  ) {
    const template = await this.templatesService.createTemplate(user.id, dto);
    return template;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':templateId')
  async updateTemplateById(
    @User() user: UserPayload,
    @Param('templateId') templateId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    const template = await this.templatesService.updateTemplateById(
      user.id,
      templateId,
      dto,
    );
    return template;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':templateId')
  async deleteTemplateById(
    @User() user: UserPayload,
    @Param('templateId') templateId: string,
  ) {
    const template = await this.templatesService.deleteTemplateById(
      user.id,
      templateId,
    );
    return template;
  }
}
