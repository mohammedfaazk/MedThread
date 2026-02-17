import { prisma } from '@medthread/database';

async function checkReports() {
  try {
    console.log('🔍 Checking reports in database...\n');

    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
          }
        },
        post: {
          select: {
            title: true,
          }
        },
        comment: {
          select: {
            content: true,
          }
        }
      },
      take: 10,
    });

    console.log(`📊 Total reports found: ${reports.length}\n`);

    if (reports.length === 0) {
      console.log('❌ No reports found in database');
      console.log('\nTo test Report Management:');
      console.log('1. Create some posts/comments as a regular user');
      console.log('2. Report them (if report feature exists in UI)');
      console.log('3. Or manually insert test reports into database\n');
    } else {
      console.log('✅ Reports found:\n');
      reports.forEach((report, index) => {
        console.log(`Report ${index + 1}:`);
        console.log(`  ID: ${report.id}`);
        console.log(`  Status: ${report.status}`);
        console.log(`  Reason: ${report.reason}`);
        console.log(`  Reporter: ${report.user.username} (${report.user.email})`);
        if (report.post) {
          console.log(`  Target: Post - "${report.post.title}"`);
        }
        if (report.comment) {
          console.log(`  Target: Comment - "${report.comment.content.substring(0, 50)}..."`);
        }
        console.log(`  Created: ${report.createdAt}`);
        console.log('');
      });
    }

    // Check report counts by status
    const [pending, approved, rejected] = await Promise.all([
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'APPROVED' } }),
      prisma.report.count({ where: { status: 'REJECTED' } }),
    ]);

    console.log('📈 Report Statistics:');
    console.log(`  Pending: ${pending}`);
    console.log(`  Approved: ${approved}`);
    console.log(`  Rejected: ${rejected}`);

  } catch (error) {
    console.error('❌ Error checking reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReports();
