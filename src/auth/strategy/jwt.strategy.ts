import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Strategy for handling JWT authentication using Passport.
 *
 * This strategy extracts the JWT token from the Authorization header, verifies it using the provided secret,
 * and validates the token payload by retrieving the corresponding user from the database.
 *
 * @injectable
 *
 * @constructor
 * @param {ConfigService} config - The configuration service to access application configuration settings.
 * @param {PrismaService} prisma - The Prisma service for interacting with the database.
 */

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  /**
   * Validates the JWT payload by retrieving the user from the database.
   *
   * @param {Object} payload - The JWT payload containing user information.
   * @param {string} payload.sub - The user ID from the JWT payload.
   * @param {string} payload.email - The email address from the JWT payload.
   *
   * @returns {Promise<any>} - Returns the user object without the hashed password if found; otherwise, `null`.
   *
   * @throws {Error} - Throws an error if there is an issue retrieving the user from the database.
   */

  async validate(payload: {
    sub: string;
    email: string;
  }) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });
    delete user.hashed_password;
    return user;
  }
}
