import { Router } from 'express';
import { authenticate as auth } from '../middleware/auth';
import { requireVerifiedDoctor } from '../middleware/requireVerifiedDoctor';
import { communityService } from '../services/community.service';
import { parseIntSafe, validateEnum } from '../utils/validation';

const router = Router();

// Get all communities
router.get('/', async (req, res, next) => {
  try {
    const page = parseIntSafe(req.query.page, 1, { min: 1, max: 1000, fieldName: 'page' });
    const limit = parseIntSafe(req.query.limit, 100, { min: 1, max: 100, fieldName: 'limit' });
    const sortBy = validateEnum(req.query.sortBy, ['members', 'new', 'active'] as const, 'sortBy', 'members');

    const result = await communityService.getCommunities({
      search: req.query.search as string,
      sortBy,
      page,
      limit,
    });

    // Return just the communities array for simplicity
    res.json(result.communities);
  } catch (error) {
    next(error);
  }
});

// Create community - requires verified doctor
router.post('/', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const { name, displayName, description, isNSFW, isPrivate } = req.body;

    const community = await communityService.createCommunity({
      name,
      displayName,
      description,
      isNSFW,
      isPrivate,
      creatorId: req.userId!,
    });

    res.status(201).json(community);
  } catch (error) {
    next(error);
  }
});

// Get single community
router.get('/:name', async (req, res, next) => {
  try {
    // Extract userId from token if provided (optional auth)
    let userId: string | undefined;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        userId = decoded.userId;
      } catch (error) {
        // Invalid token, continue without userId
      }
    }

    const community = await communityService.getCommunityByName(req.params.name, userId);
    res.json(community);
  } catch (error) {
    next(error);
  }
});

// Update community - requires verified doctor
router.put('/:id', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const { displayName, description, icon, banner, rules, theme } = req.body;

    const community = await communityService.updateCommunity(
      req.params.id,
      req.userId!,
      { displayName, description, icon, banner, rules, theme }
    );

    res.json(community);
  } catch (error) {
    next(error);
  }
});

// Join community - requires verified doctor
router.post('/:id/join', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const result = await communityService.joinCommunity(req.params.id, req.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Leave community - requires verified doctor
router.post('/:id/leave', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const result = await communityService.leaveCommunity(req.params.id, req.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get community members
router.get('/:id/members', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await communityService.getCommunityMembers(req.params.id, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get community moderators
router.get('/:id/moderators', async (req, res, next) => {
  try {
    const moderators = await communityService.getCommunityModerators(req.params.id);
    res.json(moderators);
  } catch (error) {
    next(error);
  }
});

export default router;
