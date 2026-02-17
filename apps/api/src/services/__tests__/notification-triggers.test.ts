import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '@medthread/database';
import { commentService } from '../comment.service';
import { postService } from '../post.service';
import { awardService } from '../award.service';
import { notificationService } from '../notification.service';

/**
 * Integration tests for notification triggers in post/comment/award services
 * Tests Requirements 3.1, 3.2, 3.3, 3.11
 */
describe('Notification Triggers Integration', () => {
  let testUser1: any;
  let testUser2: any;
  let testCommunity: any;
  let testPost: any;

  beforeAll(async () => {
    // Create test users
    testUser1 = await prisma.user.create({
      data: {
        email: 'test1@example.com',
        username: 'testuser1',
        password: 'hashedpassword',
        role: 'USER',
      }
    });

    testUser2 = await prisma.user.create({
      data: {
        email: 'test2@example.com',
        username: 'testuser2',
        password: 'hashedpassword',
        role: 'USER',
      }
    });

    // Create test community
    testCommunity = await prisma.community.create({
      data: {
        name: 'testcommunity',
        displayName: 'Test Community',
        description: 'Test community for notifications',
        creatorId: testUser1.id,
      }
    });

    // Create test post
    testPost = await postService.createPost({
      title: 'Test Post',
      content: 'This is a test post',
      authorId: testUser1.id,
      communityId: testCommunity.id,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { recipientId: testUser1.id },
          { recipientId: testUser2.id },
        ]
      }
    });
    await prisma.comment.deleteMany({ where: { postId: testPost.id } });
    await prisma.post.deleteMany({ where: { id: testPost.id } });
    await prisma.community.deleteMany({ where: { id: testCommunity.id } });
    await prisma.user.deleteMany({
      where: {
        id: { in: [testUser1.id, testUser2.id] }
      }
    });
  });

  describe('REPLY Notifications', () => {
    it('should create REPLY notification when commenting on a post', async () => {
      // User2 comments on User1's post
      const comment = await commentService.createComment({
        content: 'This is a reply to the post',
        authorId: testUser2.id,
        postId: testPost.id,
      });

      // Wait a bit for async notification creation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if notification was created
      const notifications = await prisma.notification.findMany({
        where: {
          recipientId: testUser1.id,
          type: 'REPLY',
          contentId: comment.id,
        }
      });

      expect(notifications.length).toBe(1);
      expect(notifications[0].actorId).toBe(testUser2.id);
      expect(notifications[0].contentType).toBe('COMMENT');
    });

    it('should create REPLY notification when replying to a comment', async () => {
      // Create parent comment
      const parentComment = await commentService.createComment({
        content: 'Parent comment',
        authorId: testUser1.id,
        postId: testPost.id,
      });

      // Clear previous notifications
      await prisma.notification.deleteMany({
        where: { recipientId: testUser1.id }
      });

      // User2 replies to User1's comment
      const replyComment = await commentService.createComment({
        content: 'Reply to comment',
        authorId: testUser2.id,
        postId: testPost.id,
        parentId: parentComment.id,
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const notifications = await prisma.notification.findMany({
        where: {
          recipientId: testUser1.id,
          type: 'REPLY',
          contentId: replyComment.id,
        }
      });

      expect(notifications.length).toBe(1);
      expect(notifications[0].actorId).toBe(testUser2.id);
    });

    it('should NOT create REPLY notification when replying to self', async () => {
      const comment = await commentService.createComment({
        content: 'Self reply',
        authorId: testUser1.id,
        postId: testPost.id,
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const notifications = await prisma.notification.findMany({
        where: {
          recipientId: testUser1.id,
          type: 'REPLY',
          contentId: comment.id,
        }
      });

      expect(notifications.length).toBe(0);
    });
  });

  describe('MENTION Notifications', () => {
    it('should create MENTION notification when mentioned in comment', async () => {
      const comment = await commentService.createComment({
        content: 'Hey @testuser1, check this out!',
        authorId: testUser2.id,
        postId: testPost.id,
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const notifications = await prisma.notification.findMany({
        where: {
          recipientId: testUser1.id,
          type: 'MENTION',
          contentId: comment.id,
        }
      });

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].actorId).toBe(testUser2.id);
    });

    it('should create MENTION notification when mentioned in post', async () => {
      const post = await postService.createPost({
        title: 'Mentioning someone',
        content: 'Hey @testuser2, what do you think?',
        authorId: testUser1.id,
        communityId: testCommunity.id,
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const notifications = await prisma.notification.findMany({
        where: {
          recipientId: testUser2.id,
          type: 'MENTION',
          contentId: post.id,
        }
      });

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].actorId).toBe(testUser1.id);
    });

    it('should parse multiple mentions correctly', async () => {
      const mentions = commentService.parseMentions('Hey @testuser1 and @testuser2, check this!');
      expect(mentions).toContain('testuser1');
      expect(mentions).toContain('testuser2');
      expect(mentions.length).toBe(2);
    });

    it('should handle duplicate mentions', async () => {
      const mentions = commentService.parseMentions('@testuser1 @testuser1 @testuser1');
      expect(mentions).toEqual(['testuser1']);
    });
  });

  describe('UPVOTE_MILESTONE Notifications', () => {
    it('should create UPVOTE_MILESTONE notification when post reaches threshold', async () => {
      // Create a new post
      const post = await postService.createPost({
        title: 'Popular Post',
        content: 'This will be popular',
        authorId: testUser1.id,
        communityId: testCommunity.id,
      });

      // Clear notifications
      await prisma.notification.deleteMany({
        where: { recipientId: testUser1.id }
      });

      // Simulate 10 upvotes (milestone)
      for (let i = 0; i < 10; i++) {
        await prisma.post.update({
          where: { id: post.id },
          data: { upvotes: { increment: 1 } }
        });
      }

      // Now vote to trigger the milestone
      await postService.votePost(post.id, testUser2.id, 1);

      await new Promise(resolve => setTimeout(resolve, 100));

      const notifications = await prisma.notification.findMany({
        where: {
          recipientId: testUser1.id,
          type: 'UPVOTE_MILESTONE',
          contentId: post.id,
        }
      });

      // Should have milestone notification
      expect(notifications.length).toBeGreaterThan(0);
    });
  });

  describe('parseMentions utility', () => {
    it('should extract usernames from @mentions', () => {
      const mentions = postService.parseMentions('Hello @user1 and @user2!');
      expect(mentions).toEqual(['user1', 'user2']);
    });

    it('should handle no mentions', () => {
      const mentions = postService.parseMentions('No mentions here');
      expect(mentions).toEqual([]);
    });

    it('should handle mentions at start and end', () => {
      const mentions = postService.parseMentions('@start middle @end');
      expect(mentions).toEqual(['start', 'end']);
    });
  });
});
