import { Router } from 'express'
import { DietPlanService } from '../services/diet-plan.service'
import { authenticate } from '../middleware/auth'

const router = Router()
const dietPlanService = new DietPlanService()

// Generate new diet plan
router.post('/generate', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId
    const { dailyCalorieGoal } = req.body
    
    // Validate calorie goal
    if (!dailyCalorieGoal || dailyCalorieGoal < 1000 || dailyCalorieGoal > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Daily calorie goal must be between 1000 and 5000'
      })
    }
    
    const result = await dietPlanService.generateDietPlan(userId, parseInt(dailyCalorieGoal))
    
    if (result.success) {
      res.status(201).json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Diet plan generation error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Get active diet plan
router.get('/active', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId
    const result = await dietPlanService.getActiveDietPlan(userId)
    
    res.json(result)
  } catch (error) {
    console.error('Active diet plan fetch error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Save diet plan
router.post('/:dietPlanId/save', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId
    const { dietPlanId } = req.params
    
    const result = await dietPlanService.saveDietPlan(userId, dietPlanId)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Diet plan save error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router