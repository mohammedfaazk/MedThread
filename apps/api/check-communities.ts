import { prisma } from '@medthread/database';

async function checkCommunities() {
  const communities = await prisma.community.findMany({
    select: {
      id: true,
      name: true,
      displayName: true,
      _count: {
        select: {
          posts: true
        }
      }
    }
  });

  console.log('Communities:', JSON.stringify(communities, null, 2));
  
  await prisma.$disconnect();
}

checkCommunities();
