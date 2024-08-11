import { createSeedClient } from '@snaplet/seed';
import * as argon from 'argon2';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

/**
 * Main function for seeding the database.
 *
 * This function performs the following actions:
 *
 * 1. Initializes the seed client.
 * 2. Truncates all tables in the database to ensure a clean state.
 * 3. Creates a predefined city and user entry.
 * 4. Seeds the database with 10 additional cities and users with randomized data.
 * 5. Logs the completion status and exits the process.
 *
 * The process involves:
 * - Resetting the database using `$resetDatabase()`.
 * - Inserting a specific city (`Cairo`) and a user with fixed details.
 * - Generating and inserting 10 additional cities and corresponding users with randomized values.
 *
 * @returns {Promise<void>} Resolves when the seeding process is complete and the process exits.
 *
 * @throws {Error} If there is an issue during the seeding process, such as database constraints or connection errors.
 */

const main = async () => {
  const seed = await createSeedClient();

  // Truncate all tables in the database
  await seed.$resetDatabase();

  await prisma.cities.create({
    data: {
      country: 'Egypt',
      name: 'Cairo',
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
    },
  });

  await prisma.user.create({
    data: {
      id: '1234',
      name: 'Test',
      city: 'Cairo',
      email: 'test@example.com',
      hashed_password: 'password',
      createdAt: '2024-08-11T13:12:49.031Z',
      updatedAt: '2024-08-11T13:12:49.031Z',
    },
  });

  // Seed the database with 10 cities
  for (let i = 0; i < 10; i++) {
    try {
      await prisma.cities.create({
        data: {
          country: faker.location.country(),
          name: faker.location.city(),
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        },
      });
      await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          hashed_password: await argon.hash(
            faker.internet.password(),
          ),
          city: 'Cairo',
        },
      });
    } catch (err) {
      continue;
    }
  }
  console.log('Seeding completed!');

  console.log('Database seeded successfully!');

  process.exit();
};

main();
