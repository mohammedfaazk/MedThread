import { prisma } from '@medthread/database';

async function createTestReports() {
  try {
    console.log('🔧 Creating test reports...\n');

    // Get a user to be the reporter
    const users = await prisma.user.findMany({ take: 2 });
    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }

    const reporter = users[0];
    console.log(`📝 Using reporter: ${reporter.username} (${reporter.email})`);

    // Get some posts
    const posts = await prisma.post.findMany({ take: 2 });
    console.log(`📄 Found ${posts.length} posts`);

    // Get some comments
    const comments = await prisma.comment.findMany({ take: 2 });
    console.log(`💬 Found ${comments.length} comments\n`);

    const reports = [];

    // Create reports for posts
    if (posts.length > 0) {
      for (const post of posts) {
        const report = await prisma.report.create({
          data: {
            userId: reporter.id,
            postId: post.id,
            reason: 'Spam',
            details: 'This post appears to be spam or promotional content',
            status: 'PENDING',
          }
        });
        reports.push(report);
        console.log(`✅ Created report for post: ${post.title}`);
      }
    }

    // Create reports for comments
    if (comments.length > 0) {
      for (const comment of comments) {
        const report = await prisma.report.create({
          data: {
            userId: reporter.id,
            commentId: comment.id,
            reason: 'Harassment',
            details: 'This comment contains inappropriate language',
            status: 'PENDING',
          }
        });
        reports.push(report);
        console.log(`✅ Created report for comment: ${comment.content.substring(0, 50)}...`);
      }
    }

    console.log(`\n✨ Successfully created ${reports.length} test reports!`);
    console.log('\nYou can now test the Report Management UI at:');
    console.log('http://localhost:3000/admin/reports');

  } catch (error) {
    console.error('❌ Error creating test reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReports();
