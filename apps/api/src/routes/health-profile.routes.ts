import { Router } from 'express';
import { authenticate } from '../middleware/auth.refactored';
import { prisma } from '@medthread/database';

const router = Router();

/**
 * GET /api/health-profile
 * Get user's health profile
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId }
    });

    if (healthProfile) {
      // Parse currentMedications from JSON string to array
      const responseData = {
        ...healthProfile,
        currentMedications: healthProfile.currentMedications 
          ? JSON.parse(healthProfile.currentMedications as string)
          : []
      };
      res.json({ success: true, data: responseData });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error: any) {
    console.error('[HealthProfile] Error fetching profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/health-profile
 * Update user's health profile
 */
router.put('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const profileData = req.body;

    // Remove userId from update data if present
    delete profileData.userId;
    delete profileData.id;
    delete profileData.createdAt;
    delete profileData.updatedAt;

    // Convert currentMedications array to JSON string if it's an array
    if (Array.isArray(profileData.currentMedications)) {
      profileData.currentMedications = JSON.stringify(profileData.currentMedications);
    }

    // Convert other JSON fields
    if (Array.isArray(profileData.medicalConditions)) {
      profileData.medicalConditions = profileData.medicalConditions;
    }
    if (Array.isArray(profileData.foodAllergies)) {
      profileData.foodAllergies = profileData.foodAllergies;
    }

    const healthProfile = await prisma.healthProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData
      }
    });

    // Parse currentMedications back to array for response
    const responseData = {
      ...healthProfile,
      currentMedications: healthProfile.currentMedications 
        ? JSON.parse(healthProfile.currentMedications as string)
        : []
    };

    res.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error('[HealthProfile] Error updating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/health-profile
 * Create user's health profile (alias for PUT)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const profileData = req.body;

    // Remove userId from update data if present
    delete profileData.userId;
    delete profileData.id;
    delete profileData.createdAt;
    delete profileData.updatedAt;

    // Convert currentMedications array to JSON string if it's an array
    if (Array.isArray(profileData.currentMedications)) {
      profileData.currentMedications = JSON.stringify(profileData.currentMedications);
    }

    // Convert other JSON fields
    if (Array.isArray(profileData.medicalConditions)) {
      profileData.medicalConditions = profileData.medicalConditions;
    }
    if (Array.isArray(profileData.foodAllergies)) {
      profileData.foodAllergies = profileData.foodAllergies;
    }

    const healthProfile = await prisma.healthProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData
      }
    });

    // Parse currentMedications back to array for response
    const responseData = {
      ...healthProfile,
      currentMedications: healthProfile.currentMedications 
        ? JSON.parse(healthProfile.currentMedications as string)
        : []
    };

    res.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error('[HealthProfile] Error creating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
