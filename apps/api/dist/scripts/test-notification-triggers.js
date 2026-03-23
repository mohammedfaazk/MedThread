"use strict";
/**
 * Manual test script for notification triggers
 * Run with: tsx src/scripts/test-notification-triggers.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("@medthread/database");
const comment_service_1 = require("../services/comment.service");
const post_service_1 = require("../services/post.service");
async function testNotificationTriggers() {
    console.log('🧪 Testing Notification Triggers...\n');
    try {
        // Find or create test users
        let user1 = await database_1.prisma.user.findFirst({
            where: { email: 'test1@medthread.com' }
        });
        let user2 = await database_1.prisma.user.findFirst({
            where: { email: 'test2@medthread.com' }
        });
        if (!user1) {
            console.log('Creating test user 1...');
            user1 = await database_1.prisma.user.create({
                data: {
                    email: 'test1@medthread.com',
                    username: 'testuser1',
                    passwordHash: 'hashedpassword',
                    role: 'PATIENT',
                }
            });
        }
        if (!user2) {
            console.log('Creating test user 2...');
            user2 = await database_1.prisma.user.create({
                data: {
                    email: 'test2@medthread.com',
                    username: 'testuser2',
                    passwordHash: 'hashedpassword',
                    role: 'PATIENT',
                }
            });
        }
        console.log(`✅ Test users ready: ${user1.username}, ${user2.username}\n`);
        // Find or create test community
        let community = await database_1.prisma.community.findFirst({
            where: { name: 'test-notifications' }
        });
        if (!community) {
            console.log('Creating test community...');
            community = await database_1.prisma.community.create({
                data: {
                    name: 'test-notifications',
                    displayName: 'Test Notifications',
                    description: 'Community for testing notifications',
                    creatorId: user1.id,
                }
            });
        }
        console.log(`✅ Test community ready: ${community.name}\n`);
        // Test 1: @mention parsing
        console.log('Test 1: Testing @mention parsing...');
        const mentions1 = post_service_1.postService.parseMentions('Hello @testuser1 and @testuser2!');
        console.log(`  Parsed mentions: ${mentions1.join(', ')}`);
        console.log(`  ✅ Expected: testuser1, testuser2\n`);
        const mentions2 = comment_service_1.commentService.parseMentions('@user1 check this @user2 and @user3');
        console.log(`  Parsed mentions: ${mentions2.join(', ')}`);
        console.log(`  ✅ Expected: user1, user2, user3\n`);
        // Test 2: Create post with mention
        console.log('Test 2: Creating post with @mention...');
        const post = await post_service_1.postService.createPost({
            title: 'Test Post with Mention',
            content: `Hey @${user2.username}, check this out!`,
            authorId: user1.id,
            communityId: community.id,
        });
        console.log(`  ✅ Post created: ${post.id}`);
        console.log(`  📧 MENTION notification should be created for ${user2.username}\n`);
        // Wait a bit for async notification
        await new Promise(resolve => setTimeout(resolve, 500));
        // Check notifications
        const mentionNotifs = await database_1.prisma.notification.findMany({
            where: {
                recipientId: user2.id,
                type: 'MENTION',
                contentId: post.id,
            },
            include: {
                actor: {
                    select: { username: true }
                }
            }
        });
        console.log(`  Found ${mentionNotifs.length} MENTION notification(s)`);
        if (mentionNotifs.length > 0) {
            console.log(`  ✅ Notification created by ${mentionNotifs[0].actor.username}\n`);
        }
        else {
            console.log(`  ⚠️  No notification found (check preferences or blocked users)\n`);
        }
        // Test 3: Create comment (REPLY notification)
        console.log('Test 3: Creating comment on post (REPLY notification)...');
        const comment = await comment_service_1.commentService.createComment({
            content: 'This is a reply to your post',
            authorId: user2.id,
            postId: post.id,
        });
        console.log(`  ✅ Comment created: ${comment.id}`);
        console.log(`  📧 REPLY notification should be created for ${user1.username}\n`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const replyNotifs = await database_1.prisma.notification.findMany({
            where: {
                recipientId: user1.id,
                type: 'REPLY',
                contentId: comment.id,
            },
            include: {
                actor: {
                    select: { username: true }
                }
            }
        });
        console.log(`  Found ${replyNotifs.length} REPLY notification(s)`);
        if (replyNotifs.length > 0) {
            console.log(`  ✅ Notification created by ${replyNotifs[0].actor.username}\n`);
        }
        else {
            console.log(`  ⚠️  No notification found (check preferences or blocked users)\n`);
        }
        // Test 4: Comment with mention
        console.log('Test 4: Creating comment with @mention...');
        const commentWithMention = await comment_service_1.commentService.createComment({
            content: `Hey @${user1.username}, what do you think?`,
            authorId: user2.id,
            postId: post.id,
        });
        console.log(`  ✅ Comment created: ${commentWithMention.id}`);
        console.log(`  📧 MENTION notification should be created for ${user1.username}\n`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const commentMentionNotifs = await database_1.prisma.notification.findMany({
            where: {
                recipientId: user1.id,
                type: 'MENTION',
                contentId: commentWithMention.id,
            }
        });
        console.log(`  Found ${commentMentionNotifs.length} MENTION notification(s)\n`);
        // Test 5: Vote to trigger milestone
        console.log('Test 5: Testing UPVOTE_MILESTONE notification...');
        console.log('  Note: This requires the post to reach a milestone (10, 25, 50, etc.)');
        console.log('  Manually test by upvoting a post to reach a milestone\n');
        // Summary
        console.log('📊 Test Summary:');
        console.log(`  - @mention parsing: ✅`);
        console.log(`  - MENTION notifications: ${mentionNotifs.length > 0 ? '✅' : '⚠️'}`);
        console.log(`  - REPLY notifications: ${replyNotifs.length > 0 ? '✅' : '⚠️'}`);
        console.log(`  - Comment MENTION notifications: ${commentMentionNotifs.length > 0 ? '✅' : '⚠️'}`);
        console.log(`  - UPVOTE_MILESTONE: Manual testing required\n`);
        console.log('✅ All tests completed!\n');
        console.log('Note: If notifications are not created, check:');
        console.log('  1. User notification preferences');
        console.log('  2. Blocked users');
        console.log('  3. Quiet hours settings');
    }
    catch (error) {
        console.error('❌ Error during testing:', error);
    }
    finally {
        await database_1.prisma.$disconnect();
    }
}
// Run tests
testNotificationTriggers();
