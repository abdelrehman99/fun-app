import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves a user by their unique identifier.
   *
   * This method queries the database for a user with the given `userId`. It returns the user's `name`, `email`, and `city`. If no user is found with the provided `userId`, it throws a `NotFoundException`.
   *
   * @param {string} userId - The unique identifier of the user to retrieve.
   *
   * @throws {NotFoundException} If no user is found with the provided `userId`.
   *
   * @returns {Promise<{ name: string; email: string; city: string }>} The user object containing the `name`, `email`, and `city` fields.
   */

  async getUser(userId: string) {
    try {
      const user =
        await this.prisma.user.findFirst({
          where: {
            id: userId,
          },
          select: {
            name: true,
            email: true,
            city: true,
          },
        });

      if (!user) {
        throw new NotFoundException(
          'User not found',
        );
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
