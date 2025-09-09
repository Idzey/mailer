import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { createId } from '@paralleldrive/cuid2';
import { SendMailDto } from './dto/sendMail.dto';
import { SendTemplateDto } from './dto/sendTemplate.dto';
import { NotFoundException } from '@nestjs/common';

const userId = createId();
const mailId = createId();
const templateId = createId();

const mockMail = {
  id: mailId,
  to: 'recipient@example.com',
  subject: 'Test Subject',
  text: 'Test Content',
  html: '<p>Test Content</p>',
  from: 'Test User',
  userId,
  createdAt: new Date(),
  updatedAt: new Date(),
  attempts: 0,
  status: 'pending',
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
  id: userId,
  email: 'test@mail.com',
  name: 'Test User',
};

const mockMailDto: SendMailDto = {
  to: 'recipient@example.com',
  subject: 'Test Subject',
  text: 'Test Content',
};

const mockTemplateDto: SendTemplateDto = {
  to: 'recipient@example.com',
  subject: 'Template Subject',
  data: { name: 'John' },
  templateId,
};

describe('MailController', () => {
  let controller: MailController;
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        {
          provide: MailService,
          useValue: {
            createMail: jest.fn().mockResolvedValue(undefined),
            getMailById: jest.fn().mockResolvedValue(mockMail),
            getMailsByUserId: jest.fn().mockResolvedValue(mockMails),
            createMailonTemplates: jest.fn().mockResolvedValue(mockMail),
          },
        },
      ],
    }).compile();

    controller = module.get<MailController>(MailController);
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMail', () => {
    it('should create a mail', async () => {
      const createMailSpy = jest.spyOn(service, 'createMail');
      await controller.sendMail(mockMailDto, jwtUserPayload);
      expect(createMailSpy).toHaveBeenCalledWith(mockMailDto, jwtUserPayload);
    });
  });

  describe('getMail', () => {
    it('should return a mail by ID', async () => {
      const result = await service.getMailById(mailId);
      const getMailByIdSpy = jest.spyOn(service, 'getMailById');

      expect(result).toEqual(mockMail);
      expect(getMailByIdSpy).toHaveBeenCalledWith(mailId);
    });

    it('should throw an error if mail not found', async () => {
      jest
        .spyOn(service, 'getMailById')
        .mockRejectedValueOnce(new NotFoundException('Mail not found'));

      try {
        await service.getMailById(createId());
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Mail not found');
      }
    });
  });

  describe('getUserMails', () => {
    it('should return all mails for a user', async () => {
      const result = await service.getMailsByUserId(jwtUserPayload.id);
      const getMailsByUserIdSpy = jest.spyOn(service, 'getMailsByUserId');
      expect(result).toEqual(mockMails);
      expect(getMailsByUserIdSpy).toHaveBeenCalledWith(userId);
    });
  });

  describe('sendTemplate', () => {
    it('should send a mail using a template', async () => {
      const createMailonTemplatesSpy = jest.spyOn(
        service,
        'createMailonTemplates',
      );

      const result = await controller.sendMailTemplate(
        mockTemplateDto,
        jwtUserPayload,
      );

      expect(createMailonTemplatesSpy).toHaveBeenCalledWith(
        mockTemplateDto,
        jwtUserPayload,
      );

      expect(result).toEqual({ message: 'Email add mail queue' });
    });

    it('should throw an error if template not found', async () => {
      jest
        .spyOn(service, 'createMailonTemplates')
        .mockRejectedValueOnce(new NotFoundException('Template not found'));

      try {
        await controller.sendMailTemplate(mockTemplateDto, jwtUserPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Template not found');
      }
    });
  });
});
