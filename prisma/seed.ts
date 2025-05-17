import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 50 users
  const users = await Promise.all(
    Array.from({ length: 50 }).map(async () => {
      const email = faker.internet.email().toLowerCase();
      const user = await prisma.user.create({
        data: {
          email,
          username: faker.internet.userName(),
          name: faker.person.fullName(),
          bio: faker.lorem.sentence(),
          imageUrl: `https://gravatar.com/avatar/${faker.string.uuid()}?d=identicon`,
        },
      });
      return user;
    }),
  );

  // Each user writes 10 posts (≈ 500 total)
  for (const user of users) {
    await Promise.all(
      Array.from({ length: 10 }).map(() =>
        prisma.post.create({
          data: {
            authorId: user.id,
            content: faker.lorem.paragraph({ min: 1, max: 3 }),
            imageUrl: faker.helpers.maybe(() => faker.image.url(), {
              probability: 0.3,
            }),
          },
        }),
      ),
    );
  }

  // Random follows
  for (const follower of users) {
    const toFollow = faker.helpers.arrayElements(
      users.filter((u) => u.id !== follower.id),
      { min: 5, max: 15 },
    );
    await Promise.all(
      toFollow.map((target) =>
        prisma.follow.create({
          data: { followerId: follower.id, followingId: target.id },
        }),
      ),
    );
  }

  // Random likes + comments
  const posts = await prisma.post.findMany({
    select: { id: true, authorId: true },
  });

  for (const post of posts) {
    // likes
    const likers = faker.helpers.arrayElements(users, { min: 0, max: 20 });
    await Promise.all(
      likers.map((u) =>
        prisma.like
          .create({ data: { userId: u.id, postId: post.id } })
          .catch(() => null),
      ),
    );

    // comments
    const numComments = faker.number.int({ min: 0, max: 6 });
    await Promise.all(
      Array.from({ length: numComments }).map(() =>
        prisma.comment.create({
          data: {
            authorId: faker.helpers.arrayElement(users).id,
            postId: post.id,
            body: faker.lorem.sentence(),
          },
        }),
      ),
    );
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
