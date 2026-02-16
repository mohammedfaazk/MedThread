import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { accountService } from '../services/account.service';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * GET /api/v1/account/deletion-preview
 * Get preview of what will be deleted
 */
router.get('/deletion-preview', authenticate, asyncHandler(async (req, res) => {
  const preview = await accountService.getAccountDeletionPreview(req.userId!);
  
  res.json({
    success: true,
    data: preview
  });
}));

/**
 * POST /api/v1/account/deactivate
 * Deactivate account (reversible)
 */
router.post('/deactivate', authenticate, asyncHandler(async (req, res) => {
  const result = await accountService.deactivateAccount(req.userId!);
  
  res.json({
    success: true,
    message: result.message,
    data: {
      username: result.username,
      email: result.email,
    }
  });
}));

/**
 * POST /api/v1/account/reactivate
 * Reactivate account
 */
router.post('/reactivate', authenticate, asyncHandler(async (req, res) => {
  const result = await accountService.reactivateAccount(req.userId!);
  
  res.json({
    success: true,
    message: result.message,
    data: {
      username: result.username,
    }
  });
}));

/**
 * DELETE /api/v1/account/delete-permanently
 * Permanently delete account and all data
 */
router.delete('/delete-permanently', authenticate, asyncHandler(async (req, res) => {
  const { confirmation } = req.body;

  // Require explicit confirmation
  if (confirmation !== 'DELETE MY ACCOUNT') {
    return res.status(400).json({
      success: false,
      error: 'Confirmation text does not match. Please type "DELETE MY ACCOUNT" to confirm.'
    });
  }

  const result = await accountService.deleteAccountPermanently(req.userId!);
  
  res.json({
    success: true,
    message: result.message,
    data: {
      username: result.username,
      email: result.email,
    }
  });
}));

export default router;
