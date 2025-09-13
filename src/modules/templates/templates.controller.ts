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
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @ApiOperation({ summary: 'Get all templates for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getTemplates(@User() user: UserPayload) {
    const templates = await this.templatesService.getTemplates(user.id);
    return templates;
  }

  @ApiOperation({ summary: 'Get a template by ID for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Template retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiBearerAuth()
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

  @ApiOperation({ summary: 'Create a new template for the current user' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async createTemplate(
    @User() user: UserPayload,
    @Body() dto: CreateTemplateDto,
  ) {
    const template = await this.templatesService.createTemplate(user.id, dto);
    return template;
  }

  @ApiOperation({ summary: 'Update a template by ID for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Template updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiBearerAuth()
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

  @ApiOperation({ summary: 'Delete a template by ID for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Template deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiBearerAuth()
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
