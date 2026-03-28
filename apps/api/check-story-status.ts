import { prisma } from '@medthread/database';

async function main() {
  const stories = await prisma.successStory.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      condition: true
    }
  });

  console.log('Success Stories in database:');
  console.log(JSON.stringify(stories, null, 2));
}

main()
  .finally(() => prisma.$disconnect());
