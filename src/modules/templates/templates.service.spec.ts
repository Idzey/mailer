import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { PrismaService } from '../libs/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { CreateTemplateDto } from './dto/create-template.dto';

const userId = createId();
const templateId = createId();

const mockTemplates = [
  {
    id: templateId,
    name: 'Welcome Email',
    subject: 'Welcome to our platform',
    content: 'Hello {{name}}, welcome to our platform!',
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: createId(),
    name: 'Password Reset',
    subject: 'Reset Your Password',
    content: 'Click here to reset your password: {{resetLink}}',
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: createId(),
    name: 'Order Confirmation',
    subject: 'Your Order Confirmation',
    content: 'Thank you for your order #{{orderNumber}}!',
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: createId(),
    name: 'Newsletter',
    subject: 'Monthly Newsletter',
    content: 'Here are the latest updates from our team!',
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: createId(),
    name: 'Account Verification',
    subject: 'Verify Your Account',
    content: 'Please verify your account by clicking: {{verificationLink}}',
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockTemplate = mockTemplates[0];

const mockTemplateDto: CreateTemplateDto = {
  name: 'New Template',
  html: 'New Content',
};

const db = {
  template: {
    findMany: jest.fn().mockResolvedValue(mockTemplates),
    findUnique: jest.fn().mockResolvedValue(mockTemplate),
    findFirst: jest.fn().mockResolvedValue(mockTemplate),
    create: jest.fn().mockResolvedValue(mockTemplate),
    update: jest.fn().mockResolvedValue(mockTemplate),
    delete: jest.fn().mockResolvedValue(mockTemplate),
  },
};

describe('TemplatesService', () => {
  let service: TemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all templates for a user', async () => {
    const templates = await service.getTemplates(userId);
    expect(templates).toEqual(mockTemplates);
  });

  it('should return a template by ID', async () => {
    const template = await service.getTemplateById(userId, templateId);
    expect(template).toEqual(mockTemplate);
  });

  it('should create a template', async () => {
    const template = await service.createTemplate(userId, mockTemplateDto);
    expect(template).toEqual(mockTemplate);
  });

  it('should update a template', async () => {
    const template = await service.updateTemplateById(
      userId,
      templateId,
      mockTemplateDto,
    );
    expect(template).toEqual(mockTemplate);
  });

  it('should delete a template', async () => {
    const template = await service.deleteTemplateById(userId, templateId);
    expect(template).toEqual(mockTemplate);
  });
});
