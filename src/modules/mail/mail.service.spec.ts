import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailQueue } from '../queues/mail.queue';
import { PrismaService } from '../libs/prisma/prisma.service';
import { TemplatesService } from '../templates/templates.service';
import { createId } from '@paralleldrive/cuid2';
import { SendMailDto } from './dto/sendMail.dto';
import { SendTemplateDto } from './dto/sendTemplate.dto';
import { Mail } from '@prisma/client';

const userId = createId();
const mailId = createId();
const templateId = createId();

const mockMail: Mail = {
  id: mailId,
  to: 'recipient@example.com',
  subject: 'Test Subject',
  text: 'Test Content',
  userId: userId,
  createdAt: new Date(),
  updatedAt: new Date(),
  attempts: 0,
  status: 'PENDING',
};

const mockMails = [
  mockMail,
  {
    ...mockMail,
    id: createId(),
    subject: 'Another Test',
  },
  {
    ...mockMail,
    id: createId(),
    subject: 'Third Test',
  },
];

const jwtUserPayload = {
  sub: userId,
  email: 'test@mail.com',
  name: 'Test User',
};

const mockMailDto: SendMailDto = {
  to: 'recipient@example.com',
  subject: 'Test Subject',
  text: 'Test Content',
  delay: 0,
  attempts: 3,
};

const mockTemplateDto: SendTemplateDto = {
  to: 'recipient@example.com',
  subject: 'Template Subject',
  data: { name: 'John' },
  delay: 0,
  attempts: 3,
};

describe('MailService', () => {
  let service: MailService;
  let mailQueue: MailQueue;
  let prismaService: PrismaService;
  let templatesService: TemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailQueue,
          useValue: {
            addEmailJob: jest.fn().mockResolvedValue(mockMail),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            mail: {
              findUnique: jest.fn().mockResolvedValue(mockMail),
              findMany: jest.fn().mockResolvedValue(mockMails),
            },
          },
        },
        {
          provide: TemplatesService,
          useValue: {
            compileTemplate: jest
              .fn()
              .mockResolvedValue('<p>Compiled template</p>'),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailQueue = module.get<MailQueue>(MailQueue);
    prismaService = module.get<PrismaService>(PrismaService);
    templatesService = module.get<TemplatesService>(TemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMail', () => {
    it('should add a mail job to the queue', async () => {
      await service.createMail(mockMailDto, jwtUserPayload);
      expect(mailQueue.addEmailJob).toHaveBeenCalledWith({
        ...mockMailDto,
        from: jwtUserPayload.name,
      });
    });
  });

  describe('getMailById', () => {
    it('should return a mail by ID', async () => {
      const result = await service.getMailById(mailId);
      expect(result).toEqual(mockMail);
      expect(prismaService.mail.findUnique).toHaveBeenCalledWith({
        where: { id: mailId },
      });
    });
  });

  describe('getMailsByUserId', () => {
    it('should return all mails for a user', async () => {
      const result = await service.getMailsByUserId(userId);
      expect(result).toEqual(mockMails);
      expect(prismaService.mail.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('createMailonTemplates', () => {
    it('should compile a template and add a mail job to the queue', async () => {
      const result = await service.createMailonTemplates(
        jwtUserPayload,
        templateId,
        mockTemplateDto,
      );

      expect(templatesService.compileTemplate).toHaveBeenCalledWith(
        userId,
        templateId,
        mockTemplateDto.data,
      );

      expect(mailQueue.addEmailJob).toHaveBeenCalledWith({
        ...mockTemplateDto,
        html: '<p>Compiled template</p>',
        from: jwtUserPayload.name,
      });

      expect(result).toEqual(mockMail);
    });
  });
});
