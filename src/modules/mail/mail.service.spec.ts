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
  userId,
  createdAt: new Date(),
  updatedAt: new Date(),
  attempts: 0,
  status: 'PENDING',
};

const mockMails = [
  mockMail,
  { ...mockMail, id: createId(), subject: 'Another Test' },
  { ...mockMail, id: createId(), subject: 'Third Test' },
];

const jwtUserPayload = {
  id: userId,
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
  templateId,
  attempts: 2,
  delay: 5,
};

describe('MailService', () => {
  let service: MailService;
  let mailQueue: { addEmailJob: jest.Mock };
  let prismaService: {
    mail: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let templatesService: { compileTemplate: jest.Mock };

  beforeEach(async () => {
    mailQueue = {
      addEmailJob: jest.fn().mockResolvedValue(mockMail),
    };
    prismaService = {
      mail: {
        findUnique: jest.fn().mockResolvedValue(mockMail),
        findMany: jest.fn().mockResolvedValue(mockMails),
      },
    };
    templatesService = {
      compileTemplate: jest.fn().mockResolvedValue('<p>Compiled template</p>'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailQueue, useValue: mailQueue },
        { provide: PrismaService, useValue: prismaService },
        { provide: TemplatesService, useValue: templatesService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMail', () => {
    it('should add a mail job to the queue with from=email', async () => {
      await service.createMail(mockMailDto, jwtUserPayload);
      expect(mailQueue.addEmailJob).toHaveBeenCalledWith({
        ...mockMailDto,
        from: jwtUserPayload.email,
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

    it('should return null if not found', async () => {
      prismaService.mail.findUnique.mockResolvedValueOnce(null);
      const result = await service.getMailById('missing');
      expect(result).toBeNull();
    });

    it('should propagate db error', async () => {
      prismaService.mail.findUnique.mockRejectedValueOnce(
        new Error('DB error'),
      );
      await expect(service.getMailById(mailId)).rejects.toThrow('DB error');
    });
  });

  describe('getMailsByUserId', () => {
    it('should return mails array', async () => {
      const result = await service.getMailsByUserId(userId);
      expect(result).toEqual(mockMails);
      expect(prismaService.mail.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should return empty array', async () => {
      prismaService.mail.findMany.mockResolvedValueOnce([]);
      const result = await service.getMailsByUserId(userId);
      expect(result).toEqual([]);
    });

    it('should propagate db error', async () => {
      prismaService.mail.findMany.mockRejectedValueOnce(new Error('DB fail'));
      await expect(service.getMailsByUserId(userId)).rejects.toThrow('DB fail');
    });
  });

  describe('createMailonTemplates', () => {
    it('should compile template and enqueue (templateId NOT in queue payload)', async () => {
      const result = await service.createMailonTemplates(
        mockTemplateDto,
        jwtUserPayload,
      );

      expect(templatesService.compileTemplate).toHaveBeenCalledWith(
        userId,
        templateId,
        mockTemplateDto.data,
      );

      expect(mailQueue.addEmailJob).toHaveBeenCalledWith({
        to: mockTemplateDto.to,
        subject: mockTemplateDto.subject,
        data: mockTemplateDto.data,
        delay: mockTemplateDto.delay,
        attempts: mockTemplateDto.attempts,
        html: '<p>Compiled template</p>',
        from: jwtUserPayload.name,
      });

      expect(result).toEqual(mockMail);
    });

    it('should throw if template compilation fails', async () => {
      templatesService.compileTemplate.mockRejectedValueOnce(
        new Error('Template not found'),
      );
      await expect(
        service.createMailonTemplates(mockTemplateDto, jwtUserPayload),
      ).rejects.toThrow('Template not found');
      expect(mailQueue.addEmailJob).not.toHaveBeenCalled();
    });

    it('should throw if queue fails', async () => {
      mailQueue.addEmailJob.mockRejectedValueOnce(new Error('Queue full'));
      await expect(
        service.createMailonTemplates(mockTemplateDto, jwtUserPayload),
      ).rejects.toThrow('Queue full');
    });

    it('should work with minimal dto (no delay/attempts)', async () => {
      const minimalDto: SendTemplateDto = {
        templateId,
        to: 'x@y.z',
        subject: 'Hi',
        data: {},
      };
      await service.createMailonTemplates(minimalDto, jwtUserPayload);
      expect(templatesService.compileTemplate).toHaveBeenCalledWith(
        userId,
        templateId,
        {},
      );
    });
  });
});
