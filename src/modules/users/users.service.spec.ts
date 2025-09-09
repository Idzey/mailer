import { createId } from '@paralleldrive/cuid2';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UsersService } from './users.service';
import { PrismaService } from '../libs/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

const userId = createId();

const mockUsers: User[] = [
  {
    id: userId,
    email: 'test@mail.com',
    password: 'test',
    name: 'test',
    isConfirmed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: createId(),
    email: 'alice@example.com',
    password: 'alicepass',
    name: 'Alice',
    isConfirmed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: createId(),
    email: 'bob@example.com',
    password: 'bobpass',
    name: 'Bob',
    isConfirmed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockUser = mockUsers[0];

const mockUserDto: UpdateUserDto = {
  name: 'John Doe',
  email: 'update@example.com',
};

const db = {
  user: {
    findUnique: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue(mockUser),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a user by ID', async () => {
    const user = await service.getUser(userId);
    expect(user).toEqual(mockUser);
  });

  it('should update a user', async () => {
    const updatedUser = await service.updateUser(userId, mockUserDto);
    expect(updatedUser).toEqual(mockUser);
  });

  it('should delete a user', async () => {
    const deletedUser = await service.deleteUser(userId);
    expect(deletedUser).toEqual(mockUser);
  });
});
