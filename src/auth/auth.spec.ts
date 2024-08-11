import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon from 'argon2';

const testEmail = 'test@example.com';
const testPassword = 'Test@123';
const testHashedPassword = 'hashedPassword';
const testCity = {
  name: 'Cairo',
  latitude: 30.0444,
  longitude: 31.2357,
  country: 'Egypt',
};

const prismaMock = {
  user: {
    create: jest.fn(),
  },
  cities: {
    findFirst: jest.fn(),
  },
};

const jwtServiceMock = {
  signAsync: jest
    .fn()
    .mockResolvedValue('mockedJwtToken'),
};

const configServiceMock = {
  get: jest
    .fn()
    .mockReturnValue('mockedJwtSecret'),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AuthService,
          {
            provide: PrismaService,
            useValue: prismaMock,
          },
          {
            provide: JwtService,
            useValue: jwtServiceMock,
          },
          {
            provide: ConfigService,
            useValue: configServiceMock,
          },
        ],
      }).compile();

    authService =
      module.get<AuthService>(AuthService);

    prismaMock.user.create.mockClear();
    prismaMock.cities.findFirst.mockClear();
  });

  /**
   * Tests the signup method when the user is located in Egypt.
   *
   * @test It should sign up a user if they are in Egypt.
   *
   * @returns {Promise<void>} Resolves when the test completes.
   *
   * @setup Mocks `prismaMock.cities.findFirst` to return a valid city and `prismaMock.user.create` to return a user object.
   * @setup Mocks `argon.hash` to return a mocked hashed password.
   * @assert Verifies that `authService.signup` returns the expected JWT token.
   * @assert Verifies that `prismaMock.cities.findFirst` is called with correct parameters.
   * @assert Verifies that `prismaMock.user.create` is called with correct parameters.
   * @assert Verifies that `jwtServiceMock.signAsync` is called with correct payload and options.
   */

  it('should sign up a user if they are in Egypt', async () => {
    prismaMock.cities.findFirst.mockResolvedValue(
      testCity,
    );
    prismaMock.user.create.mockResolvedValue({
      id: '1',
      email: testEmail,
    });

    jest
      .spyOn(argon, 'hash')
      .mockResolvedValue(testHashedPassword);

    const result = await authService.signup({
      email: testEmail,
      password: testPassword,
      name: 'John Doe',
      latitude: testCity.latitude,
      longitude: testCity.longitude,
    });

    expect(result).toEqual({
      access_token: 'mockedJwtToken',
    });
    expect(
      prismaMock.cities.findFirst,
    ).toHaveBeenCalledWith({
      where: {
        latitude: testCity.latitude,
        longitude: testCity.longitude,
        country: 'Egypt',
      },
    });
    expect(
      prismaMock.user.create,
    ).toHaveBeenCalledWith({
      data: {
        email: testEmail,
        name: 'John Doe',
        hashed_password: testHashedPassword,
        city: testCity.name,
      },
    });
    expect(
      jwtServiceMock.signAsync,
    ).toHaveBeenCalledWith(
      { sub: '1', email: testEmail },
      {
        expiresIn: '15m',
        secret: 'mockedJwtSecret',
      },
    );
  });

  /**
   * Tests the signup method when the user is not located in Egypt.
   *
   * @test It should throw a ForbiddenException if the user is not in Egypt.
   *
   * @returns {Promise<void>} Resolves when the test completes.
   *
   * @setup Mocks `prismaMock.cities.findFirst` to return null.
   * @assert Verifies that `authService.signup` throws a `ForbiddenException` with the correct message.
   */

  it('should throw a ForbiddenException if the user is not in Egypt', async () => {
    prismaMock.cities.findFirst.mockResolvedValue(
      null,
    );

    await expect(
      authService.signup({
        email: testEmail,
        password: testPassword,
        name: 'John Doe',
        latitude: 40.7128,
        longitude: -74.006,
      }),
    ).rejects.toThrow(
      new ForbiddenException(
        'You can not sign up from a place not in Egypt.',
      ),
    );
  });

  /**
   * Tests the signup method when the email address is already in use.
   *
   * @test It should throw a BadRequestException if email is already in use.
   *
   * @returns {Promise<void>} Resolves when the test completes.
   *
   * @setup Mocks `prismaMock.cities.findFirst` to return a valid city.
   * @setup Mocks `prismaMock.user.create` to throw a PrismaClientKnownRequestError with code 'P2002'.
   * @setup Mocks `argon.hash` to return a mocked hashed password.
   * @assert Verifies that `authService.signup` throws a `BadRequestException` with the correct message.
   */

  it('should throw a BadRequestException if email is already in use', async () => {
    prismaMock.cities.findFirst.mockResolvedValue(
      testCity,
    );

    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '2.30.0',
        } as any,
      ),
    );

    jest
      .spyOn(argon, 'hash')
      .mockResolvedValue(testHashedPassword);

    await expect(
      authService.signup({
        email: testEmail,
        password: testPassword,
        name: 'John Doe',
        latitude: testCity.latitude,
        longitude: testCity.longitude,
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'Email address is already in use.',
      ),
    );
  });
});
