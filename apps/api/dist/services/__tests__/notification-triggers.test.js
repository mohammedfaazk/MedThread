"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const database_1 = require("@medthread/database");
const comment_service_1 = require("../comment.service");
const post_service_1 = require("../post.service");
/**
 * Integration tests for notification triggers in post/comment/award services
 * Tests Requirements 3.1, 3.2, 3.3, 3.11
 */
(0, globals_1.describe)('Notification Triggers Integration', () => {
    let testUser1;
    let testUser2;
    let testCommunity;
    let testPost;
    (0, globals_1.beforeAll)(async () => {
        // Create test users
        testUser1 = await database_1.prisma.user.create({
            data: {
                email: 'test1@example.com',
                username: 'testuser1',
                password: 'hashedpassword',
                role: 'USER',
            }
        });
        testUser2 = await database_1.prisma.user.create({
            data: {
                email: 'test2@example.com',
                username: 'testuser2',
                password: 'hashedpassword',
                role: 'USER',
            }
        });
        // Create test community
        testCommunity = await database_1.prisma.community.create({
            data: {
                name: 'testcommunity',
                displayName: 'Test Community',
                description: 'Test community for notifications',
                creatorId: testUser1.id,
            }
        });
        // Create test post
        testPost = await post_service_1.postService.createPost({
            title: 'Test Post',
            content: 'This is a test post',
            authorId: testUser1.id,
            communityId: testCommunity.id,
        });
    });
    (0, globals_1.afterAll)(async () => {
        // Clean up test data
        await database_1.prisma.notification.deleteMany({
            where: {
                OR: [
                    { recipientId: testUser1.id },
                    { recipientId: testUser2.id },
                ]
            }
        });
        await database_1.prisma.comment.deleteMany({ where: { postId: testPost.id } });
        await database_1.prisma.post.deleteMany({ where: { id: testPost.id } });
        await database_1.prisma.community.deleteMany({ where: { id: testCommunity.id } });
        await database_1.prisma.user.deleteMany({
            where: {
                id: { in: [testUser1.id, testUser2.id] }
            }
        });
    });
    (0, globals_1.describe)('REPLY Notifications', () => {
        (0, globals_1.it)('should create REPLY notification when commenting on a post', async () => {
            // User2 comments on User1's post
            const comment = await comment_service_1.commentService.createComment({
                content: 'This is a reply to the post',
                authorId: testUser2.id,
                postId: testPost.id,
            });
            // Wait a bit for async notification creation
            await new Promise(resolve => setTimeout(resolve, 100));
            // Check if notification was created
            const notifications = await database_1.prisma.notification.findMany({
                where: {
                    recipientId: testUser1.id,
                    type: 'REPLY',
                    contentId: comment.id,
                }
            });
            (0, globals_1.expect)(notifications.length).toBe(1);
            (0, globals_1.expect)(notifications[0].actorId).toBe(testUser2.id);
            (0, globals_1.expect)(notifications[0].contentType).toBe('COMMENT');
        });
        (0, globals_1.it)('should create REPLY notification when replying to a comment', async () => {
            // Create parent comment
            const parentComment = await comment_service_1.commentService.createComment({
                content: 'Parent comment',
                authorId: testUser1.id,
                postId: testPost.id,
            });
            // Clear previous notifications
            await database_1.prisma.notification.deleteMany({
                where: { recipientId: testUser1.id }
            });
            // User2 replies to User1's comment
            const replyComment = await comment_service_1.commentService.createComment({
                content: 'Reply to comment',
                authorId: testUser2.id,
                postId: testPost.id,
                parentId: parentComment.id,
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            const notifications = await database_1.prisma.notification.findMany({
                where: {
                    recipientId: testUser1.id,
                    type: 'REPLY',
                    contentId: replyComment.id,
                }
            });
            (0, globals_1.expect)(notifications.length).toBe(1);
            (0, globals_1.expect)(notifications[0].actorId).toBe(testUser2.id);
        });
        (0, globals_1.it)('should NOT create REPLY notification when replying to self', async () => {
            const comment = await comment_service_1.commentService.createComment({
                content: 'Self reply',
                authorId: testUser1.id,
                postId: testPost.id,
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            const notifications = await database_1.prisma.notification.findMany({
                where: {
                    recipientId: testUser1.id,
                    type: 'REPLY',
                    contentId: comment.id,
                }
            });
            (0, globals_1.expect)(notifications.length).toBe(0);
        });
    });
    (0, globals_1.describe)('MENTION Notifications', () => {
        (0, globals_1.it)('should create MENTION notification when mentioned in comment', async () => {
            const comment = await comment_service_1.commentService.createComment({
                content: 'Hey @testuser1, check this out!',
                authorId: testUser2.id,
                postId: testPost.id,
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            const notifications = await database_1.prisma.notification.findMany({
                where: {
                    recipientId: testUser1.id,
                    type: 'MENTION',
                    contentId: comment.id,
                }
            });
            (0, globals_1.expect)(notifications.length).toBeGreaterThan(0);
            (0, globals_1.expect)(notifications[0].actorId).toBe(testUser2.id);
        });
        (0, globals_1.it)('should create MENTION notification when mentioned in post', async () => {
            const post = await post_service_1.postService.createPost({
                title: 'Mentioning someone',
                content: 'Hey @testuser2, what do you think?',
                authorId: testUser1.id,
                communityId: testCommunity.id,
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            const notifications = await database_1.prisma.notification.findMany({
                where: {
                    recipientId: testUser2.id,
                    type: 'MENTION',
                    contentId: post.id,
                }
            });
            (0, globals_1.expect)(notifications.length).toBeGreaterThan(0);
            (0, globals_1.expect)(notifications[0].actorId).toBe(testUser1.id);
        });
        (0, globals_1.it)('should parse multiple mentions correctly', async () => {
            const mentions = comment_service_1.commentService.parseMentions('Hey @testuser1 and @testuser2, check this!');
            (0, globals_1.expect)(mentions).toContain('testuser1');
            (0, globals_1.expect)(mentions).toContain('testuser2');
            (0, globals_1.expect)(mentions.length).toBe(2);
        });
        (0, globals_1.it)('should handle duplicate mentions', async () => {
            const mentions = comment_service_1.commentService.parseMentions('@testuser1 @testuser1 @testuser1');
            (0, globals_1.expect)(mentions).toEqual(['testuser1']);
        });
    });
    (0, globals_1.describe)('UPVOTE_MILESTONE Notifications', () => {
        (0, globals_1.it)('should create UPVOTE_MILESTONE notification when post reaches threshold', async () => {
            // Create a new post
            const post = await post_service_1.postService.createPost({
                title: 'Popular Post',
                content: 'This will be popular',
                authorId: testUser1.id,
                communityId: testCommunity.id,
            });
            // Clear notifications
            await database_1.prisma.notification.deleteMany({
                where: { recipientId: testUser1.id }
            });
            // Simulate 10 upvotes (milestone)
            for (let i = 0; i < 10; i++) {
                await database_1.prisma.post.update({
                    where: { id: post.id },
                    data: { upvotes: { increment: 1 } }
                });
            }
            // Now vote to trigger the milestone
            await post_service_1.postService.votePost(post.id, testUser2.id, 1);
            await new Promise(resolve => setTimeout(resolve, 100));
            const notifications = await database_1.prisma.notification.findMany({
                where: {
                    recipientId: testUser1.id,
                    type: 'UPVOTE_MILESTONE',
                    contentId: post.id,
                }
            });
            // Should have milestone notification
            (0, globals_1.expect)(notifications.length).toBeGreaterThan(0);
        });
    });
    (0, globals_1.describe)('parseMentions utility', () => {
        (0, globals_1.it)('should extract usernames from @mentions', () => {
            const mentions = post_service_1.postService.parseMentions('Hello @user1 and @user2!');
            (0, globals_1.expect)(mentions).toEqual(['user1', 'user2']);
        });
        (0, globals_1.it)('should handle no mentions', () => {
            const mentions = post_service_1.postService.parseMentions('No mentions here');
            (0, globals_1.expect)(mentions).toEqual([]);
        });
        (0, globals_1.it)('should handle mentions at start and end', () => {
            const mentions = post_service_1.postService.parseMentions('@start middle @end');
            (0, globals_1.expect)(mentions).toEqual(['start', 'end']);
        });
    });
});
