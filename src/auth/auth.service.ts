import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cities, Prisma } from '@prisma/client';

/**
 * Service for handling authentication operations such as user signup and JWT token generation.
 *
 * @injectable
 *
 * @constructor
 * @param {PrismaService} prisma - The Prisma service for interacting with the database.
 * @param {JwtService} jwt - The JWT service for generating JSON Web Tokens.
 * @param {ConfigService} config - The configuration service to access application configuration settings.
 */

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Signs up a new user by hashing the password, validating the user's location,
   * and creating a new user record in the database.
   *
   * @param {AuthDto} dto - The data transfer object containing user registration details.
   * @param {string} dto.email - The email address of the user.
   * @param {string} dto.password - The password of the user to be hashed.
   * @param {string} dto.name - The name of the user.
   * @param {number} dto.latitude - The latitude of the user's location.
   * @param {number} dto.longitude - The longitude of the user's location.
   *
   * @returns {Promise<{ access_token: string }>} - Returns a promise that resolves to an object containing the JWT access token.
   *
   * @throws {ForbiddenException} - Throws if the user's location is not in Egypt.
   * @throws {BadRequestException} - Throws if the email address is already in use.
   * @throws {Error} - Throws if there is an unexpected error during the user creation process.
   */
  async signup(dto: AuthDto) {
    const hashed_password = await argon.hash(
      dto.password,
    );

    const latitude = dto.latitude;
    const longitude = dto.longitude;

    try {
      const city: Cities =
        await this.prisma.cities.findFirst({
          where: {
            latitude,
            longitude,
            country: 'Egypt',
          },
        });

      if (!city)
        throw new ForbiddenException(
          'You can not sign up from a place not in Egypt.',
        );

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          hashed_password,
          city: city.name,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Email address is already in use.',
        );
      }
      throw error;
    }
  }

  /**
   * Generates a JWT token for the user based on their ID and email.
   *
   * @param {string} userId - The ID of the user for whom the token is being generated.
   * @param {string} email - The email of the user for whom the token is being generated.
   *
   * @returns {Promise<{ access_token: string }>} - Returns a promise that resolves to an object containing the JWT access token.
   *
   * @throws {Error} - Throws if there is an issue generating the JWT token.
   */

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret: secret,
      },
    );

    return {
      access_token: token,
    };
  }
}
