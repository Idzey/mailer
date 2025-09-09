import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { createId } from '@paralleldrive/cuid2';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/updateUser.dto';

const mockUser = {
  id: createId(),
  name: 'John Doe',
  email: 'test@mail.com',
  password: 'password',
};

const jwtUserPayload = {
  id: mockUser.id,
  email: mockUser.email,
  name: mockUser.name,
};

const mockUserDto: UpdateUserDto = {
  name: 'John Doe',
  email: 'test@mail.com',
  password: 'password',
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUser: jest.fn().mockResolvedValue(mockUser),
            updateUser: jest.fn().mockResolvedValue(mockUser),
            deleteUser: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should return a user', async () => {
      const result = await controller.getUser(jwtUserPayload);

      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user not found', async () => {
      jest
        .spyOn(service, 'getUser')
        .mockRejectedValueOnce(new NotFoundException('User not found'));

      try {
        await controller.getUser({
          id: createId(),
          email: 'gol@mail.com',
          name: '4242',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      }
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const result = await controller.updateUser(jwtUserPayload, mockUserDto);

      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user not found', async () => {
      jest
        .spyOn(service, 'updateUser')
        .mockRejectedValueOnce(new NotFoundException('User not found'));

      try {
        await controller.updateUser(
          {
            ...jwtUserPayload,
            id: createId(),
          },
          {
            email: 'gol@mail.com',
            name: '4242',
          },
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      }
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const result = await controller.deleteUser(jwtUserPayload);

      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user not found', async () => {
      jest
        .spyOn(service, 'deleteUser')
        .mockRejectedValueOnce(new NotFoundException('User not found'));

      try {
        await controller.deleteUser({
          ...jwtUserPayload,
          id: createId(),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      }
    });
  });
});
