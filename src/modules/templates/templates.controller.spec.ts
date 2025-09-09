import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { NotFoundException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { CreateTemplateDto } from './dto/create-template.dto';

const mockTemplate = {
  id: createId(),
  name: 'Welcome Email',
  subject: 'Welcome to our platform',
  content: 'Hello {{name}}, welcome to our platform!',
  userId: createId(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const jwtUserPayload = {
  id: mockTemplate.userId,
  email: 'test@mail.com',
  name: 'Test User',
};

const mockTemplateDto: CreateTemplateDto = {
  name: 'Welcome Email',
  html: 'Welcome to our platform',
};

describe('TemplatesController', () => {
  let controller: TemplatesController;
  let service: TemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [
        {
          provide: TemplatesService,
          useValue: {
            getTemplates: jest.fn().mockResolvedValue([mockTemplate]),
            getTemplateById: jest.fn().mockResolvedValue(mockTemplate),
            createTemplate: jest.fn().mockResolvedValue(mockTemplate),
            updateTemplateById: jest.fn().mockResolvedValue(mockTemplate),
            deleteTemplateById: jest.fn().mockResolvedValue(mockTemplate),
          },
        },
      ],
    }).compile();

    controller = module.get<TemplatesController>(TemplatesController);
    service = module.get<TemplatesService>(TemplatesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTemplates', () => {
    it('should return all templates for a user', async () => {
      const result = await controller.getTemplates(jwtUserPayload);
      expect(result).toEqual([mockTemplate]);
    });
  });

  describe('getTemplateById', () => {
    it('should return a template by ID', async () => {
      const result = await controller.getTemplateById(
        jwtUserPayload,
        mockTemplate.id,
      );
      expect(result).toEqual(mockTemplate);
    });

    it('should throw an error if template not found', async () => {
      jest
        .spyOn(service, 'getTemplateById')
        .mockRejectedValueOnce(new NotFoundException('Template not found'));

      try {
        await controller.getTemplateById(jwtUserPayload, createId());
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Template not found');
      }
    });
  });

  describe('createTemplate', () => {
    it('should create a template', async () => {
      const result = await controller.createTemplate(
        jwtUserPayload,
        mockTemplateDto,
      );
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('updateTemplateById', () => {
    it('should update a template', async () => {
      const result = await controller.updateTemplateById(
        jwtUserPayload,
        mockTemplate.id,
        mockTemplateDto,
      );
      expect(result).toEqual(mockTemplate);
    });

    it('should throw an error if template not found', async () => {
      jest
        .spyOn(service, 'updateTemplateById')
        .mockRejectedValueOnce(new NotFoundException('Template not found'));

      try {
        await controller.updateTemplateById(
          jwtUserPayload,
          createId(),
          mockTemplateDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Template not found');
      }
    });
  });

  describe('deleteTemplateById', () => {
    it('should delete a template', async () => {
      const result = await controller.deleteTemplateById(
        jwtUserPayload,
        mockTemplate.id,
      );
      expect(result).toEqual(mockTemplate);
    });

    it('should throw an error if template not found', async () => {
      jest
        .spyOn(service, 'deleteTemplateById')
        .mockRejectedValueOnce(new NotFoundException('Template not found'));

      try {
        await controller.deleteTemplateById(jwtUserPayload, createId());
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Template not found');
      }
    });
  });
});
