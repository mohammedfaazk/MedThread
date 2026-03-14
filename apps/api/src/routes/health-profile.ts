import { Router } from 'express'
import { HealthProfileService } from '../services/health-profile.service'
import { authenticate } from '../middleware/auth'

const router = Router()
const healthProfileService = new HealthProfileService()

// Get health profile
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId
    const result = await healthProfileService.getHealthProfile(userId)
    
    res.json(result)
  } catch (error) {
    console.error('Health profile fetch error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Create or update health profile
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId
    const data = req.body
    
    // Validate required fields
    const requiredFields = ['ageGroup', 'biologicalSex', 'nationality', 'weightRange', 'heightRange', 'activityLevel']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      })
    }
    
    const result = await healthProfileService.createOrUpdateHealthProfile(userId, data)
    
    if (result.success) {
      res.status(201).json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Health profile creation error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Delete health profile
router.delete('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId
    const result = await healthProfileService.deleteHealthProfile(userId)
    
    res.json(result)
  } catch (error) {
    console.error('Health profile deletion error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router