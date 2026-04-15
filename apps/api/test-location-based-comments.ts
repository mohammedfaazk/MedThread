import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres.lfjqtefsfhkzlzixleee:MedThread%40123@aws-1-ap-south-1.pooler.supabase.com:5432/postgres'
});

async function testLocationBasedComments() {
  console.log('🔍 Testing Location-Based Comment Filtering\n');

  try {
    // 1. Find a post with comments
    const postsWithComments = await prisma.post.findMany({
      where: {
        comments: {
          some: {}
        }
      },
      include: {
        author: {
          select: {
            username: true,
            pincode: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                username: true,
                role: true,
                pincode: true
              }
            }
          }
        }
      },
      take: 1
    });

    if (postsWithComments.length === 0) {
      console.log('❌ No posts with comments found');
      return;
    }

    const post = postsWithComments[0];
    console.log('📝 Post Details:');
    console.log(`   Title: ${post.title}`);
    console.log(`   Author: ${post.author.username}`);
    console.log(`   Author Pincode: ${post.author.pincode || 'Not set'}`);
    console.log(`   Total Comments: ${post.comments.length}\n`);

    // 2. Show comment details
    console.log('💬 Comments on this post:');
    post.comments.forEach((comment, index) => {
      const isDoctor = comment.author.role === 'DOCTOR' || comment.author.role === 'VERIFIED_DOCTOR';
      console.log(`\n   ${index + 1}. ${comment.author.username} (${comment.author.role})`);
      console.log(`      Pincode: ${comment.author.pincode || 'Not set'}`);
      console.log(`      Is Doctor: ${isDoctor ? 'Yes' : 'No'}`);
      console.log(`      Content: ${comment.content.substring(0, 50)}...`);
      
      // Calculate proximity tier if both pincodes exist
      if (post.author.pincode && comment.author.pincode && isDoctor) {
        const patientPin = post.author.pincode;
        const doctorPin = comment.author.pincode;
        
        let tier = 4;
        if (doctorPin === patientPin) tier = 0;
        else if (doctorPin.slice(0, 3) === patientPin.slice(0, 3)) tier = 1;
        else if (doctorPin.slice(0, 2) === patientPin.slice(0, 2)) tier = 2;
        else if (doctorPin[0] === patientPin[0]) tier = 3;
        
        const tierLabels = [
          'Exact match',
          'Same city zone (3-digit)',
          'Same region (2-digit)',
          'Same state zone (1-digit)',
          'Different location'
        ];
        
        console.log(`      Proximity Tier: ${tier} - ${tierLabels[tier]}`);
      }
    });

    // 3. Test the sorting algorithm
    console.log('\n\n🔄 Testing Comment Sorting Algorithm:');
    console.log('   (Doctors closest to patient should appear first)\n');

    const { commentService } = await import('./src/services/comment.service');
    const sortedComments = await commentService.getCommentsByPost(post.id);

    console.log('   Sorted Order:');
    sortedComments.forEach((comment: any, index: number) => {
      const isDoctor = comment.author.role === 'DOCTOR' || comment.author.role === 'VERIFIED_DOCTOR';
      console.log(`   ${index + 1}. ${comment.author.username} (${comment.author.role})`);
      console.log(`      Pincode: ${comment.author.pincode || 'Not set'}`);
      if (isDoctor && post.author.pincode && comment.author.pincode) {
        const patientPin = post.author.pincode;
        const doctorPin = comment.author.pincode;
        
        let tier = 4;
        if (doctorPin === patientPin) tier = 0;
        else if (doctorPin.slice(0, 3) === patientPin.slice(0, 3)) tier = 1;
        else if (doctorPin.slice(0, 2) === patientPin.slice(0, 2)) tier = 2;
        else if (doctorPin[0] === patientPin[0]) tier = 3;
        
        console.log(`      Proximity Tier: ${tier}`);
      }
      console.log('');
    });

    // 4. Summary
    console.log('\n✅ Location-Based Comment Filtering Test Complete\n');
    console.log('📊 How it works:');
    console.log('   - Tier 0: Exact pincode match (highest priority)');
    console.log('   - Tier 1: Same city zone (first 3 digits match)');
    console.log('   - Tier 2: Same region (first 2 digits match)');
    console.log('   - Tier 3: Same state zone (first digit matches)');
    console.log('   - Tier 4: Doctor but no match');
    console.log('   - Tier 5: Non-doctor comments (lowest priority)');
    console.log('\n   Within each tier, comments are sorted by score (upvotes)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLocationBasedComments();
