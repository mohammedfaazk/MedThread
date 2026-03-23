import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { supportGroupsService } from '../services/support-groups.service';

const router = express.Router();

// Get all groups
router.get('/', async (req, res) => {
  try {
    const filters = req.query;
    const groups = await supportGroupsService.getGroups(filters);
    res.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Create group
router.post('/', authenticateToken, async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    const group = await supportGroupsService.createGroup(data);
    res.json({ success: true, group });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get single group
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await supportGroupsService.getGroup(groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ group });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Join group
router.post('/:groupId/join', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { isAnonymous } = req.body;
    
    const group = await supportGroupsService.joinGroup(groupId, req.user.id, isAnonymous);
    res.json({ success: true, group });
  } catch (error: any) {
    console.error('Error joining group:', error);
    res.status(400).json({ error: error.message || 'Failed to join group' });
  }
});

// Leave group
router.post('/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await supportGroupsService.leaveGroup(groupId, req.user.id);
    res.json({ success: true, group });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Get group posts
router.get('/:groupId/posts', async (req, res) => {
  try {
    const { groupId } = req.params;
    const filters = req.query;
    const posts = await supportGroupsService.getGroupPosts(groupId, filters);
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create post
router.post('/:groupId/posts', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const data = { ...req.body, authorId: req.user.id };
    const post = await supportGroupsService.createPost(groupId, data);
    res.json({ success: true, post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Upvote post
router.post('/posts/:postId/upvote', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await supportGroupsService.upvotePost(postId);
    res.json({ success: true, post });
  } catch (error) {
    console.error('Error upvoting post:', error);
    res.status(500).json({ error: 'Failed to upvote post' });
  }
});

// Get user's groups
router.get('/user/:userId/groups', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const groups = await supportGroupsService.getUserGroups(userId);
    res.json({ groups });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
});

// Search groups
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const groups = await supportGroupsService.searchGroups(query);
    res.json({ groups });
  } catch (error) {
    console.error('Error searching groups:', error);
    res.status(500).json({ error: 'Failed to search groups' });
  }
});

export default router;
