import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const validUserId = '1234';
const invalidUserId = 'invalid_id';
const firstUser = {
  name: 'Test',
  city: 'Cairo',
  email: 'test@example.com',
};

const prismaMock = {
  user: {
    findFirst: jest
      .fn()
      .mockImplementation((args) => {
        if (args.where.id === validUserId) {
          return firstUser;
        }
        return null;
      }),
  },
};

/**
 * Test suite for UserService.
 *
 * This suite contains tests for the UserService class, specifically focusing on the `getUser` method.
 *
 * @describe UserService
 *
 * @setup Initializes the UserService with a mock of PrismaService.
 */

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          UserService,
          {
            provide: PrismaService,
            useValue: prismaMock,
          },
        ],
      }).compile();

    userService =
      module.get<UserService>(UserService);
    prismaMock.user.findFirst.mockClear();
  });

  /**
   * Tests the `getUser` method when provided with a valid user ID.
   *
   * @test It should get a user with a valid id.
   *
   * @returns {Promise<void>} Resolves when the test completes.
   *
   * @setup Mocks `prismaMock.user.findFirst` to return a user object corresponding to the valid ID.
   * @assert Verifies that `userService.getUser` returns the expected user object.
   */

  it('should get a user with a valid id', async () => {
    const result =
      await userService.getUser(validUserId);
    expect(result).toEqual(firstUser);
  });

  /**
   * Tests the `getUser` method when provided with an invalid user ID.
   *
   * @test It should throw a NotFoundException if the id is not valid.
   *
   * @returns {Promise<void>} Resolves when the test completes.
   *
   * @setup Mocks `prismaMock.user.findFirst` to return null for an invalid user ID.
   * @assert Verifies that `userService.getUser` throws a `NotFoundException` with the correct message.
   */

  it('should throw a NotFoundException if the id is not valid', async () => {
    await expect(
      userService.getUser(invalidUserId),
    ).rejects.toThrow(
      new NotFoundException('User not found'),
    );
  });
});
