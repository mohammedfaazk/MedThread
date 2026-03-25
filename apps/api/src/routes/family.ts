import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '@medthread/database';

const router = Router();

// Get all family groups for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;

    const groups = await prisma.familyGroup.findMany({
      where: {
        OR: [
          { adminUserId: userId },
          {
            members: {
              path: '$[*].userId',
              array_contains: userId
            }
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Error fetching family groups:', error);
    res.status(500).json({ error: 'Failed to fetch family groups' });
  }
});

// Create new family group
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { name, members, emergencyContacts } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const group = await prisma.familyGroup.create({
      data: {
        name,
        adminUserId: userId,
        members: members || [],
        emergencyContacts: emergencyContacts || [],
        sharedData: {}
      }
    });

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error creating family group:', error);
    res.status(500).json({ error: 'Failed to create family group' });
  }
});

// Get single family group
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const group = await prisma.familyGroup.findFirst({
      where: {
        id,
        OR: [
          { adminUserId: userId },
          {
            members: {
              path: '$[*].userId',
              array_contains: userId
            }
          }
        ]
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Family group not found' });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error fetching family group:', error);
    res.status(500).json({ error: 'Failed to fetch family group' });
  }
});

// Add member to family group
router.post('/:id/members', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { memberId, relation, permissions } = req.body;

    // Verify user is admin
    const group = await prisma.familyGroup.findFirst({
      where: { id, adminUserId: userId }
    });

    if (!group) {
      return res.status(403).json({ error: 'Only admin can add members' });
    }

    // Add member
    const members = group.members as any[];
    members.push({
      userId: memberId,
      relation,
      permissions: permissions || ['VIEW'],
      addedAt: new Date().toISOString()
    });

    const updated = await prisma.familyGroup.update({
      where: { id },
      data: { members }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Update family group
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { name, emergencyContacts, sharedData } = req.body;

    const group = await prisma.familyGroup.updateMany({
      where: {
        id,
        adminUserId: userId
      },
      data: {
        ...(name && { name }),
        ...(emergencyContacts && { emergencyContacts }),
        ...(sharedData && { sharedData })
      }
    });

    if (group.count === 0) {
      return res.status(404).json({ error: 'Family group not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Family group updated'
    });
  } catch (error) {
    console.error('Error updating family group:', error);
    res.status(500).json({ error: 'Failed to update family group' });
  }
});

// Delete family group
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const group = await prisma.familyGroup.deleteMany({
      where: {
        id,
        adminUserId: userId
      }
    });

    if (group.count === 0) {
      return res.status(404).json({ error: 'Family group not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Family group deleted'
    });
  } catch (error) {
    console.error('Error deleting family group:', error);
    res.status(500).json({ error: 'Failed to delete family group' });
  }
});

export default router;
