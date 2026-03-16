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

// Create or update health profile — all fields optional, no required-field validation
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId
    const result = await healthProfileService.createOrUpdateHealthProfile(userId, req.body)
    if (result.success) {
      res.status(201).json(result)
    } else {
      res.status(500).json(result)
    }
  } catch (error) {
    console.error('Health profile creation error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Init — creates an empty profile only if none exists, never overwrites
router.post('/init', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId
    const result = await healthProfileService.createIfNotExists(userId, {
      medicalConditions: [],
      foodAllergies: [],
      riskLevel: 'NONE',
    })
    res.json(result)
  } catch (error) {
    console.error('Health profile init error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Partial update — merge into existing profile
router.put('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId
    const result = await healthProfileService.createOrUpdateHealthProfile(userId, req.body)
    if (result.success) {
      res.json(result)
    } else {
      res.status(500).json(result)
    }
  } catch (error) {
    console.error('Health profile update error:', error)
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
