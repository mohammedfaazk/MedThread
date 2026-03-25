import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '@medthread/database';

const router = Router();

// Get all second opinion requests for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    const where: any = {
      patientId: userId
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    const requests = await prisma.secondOpinionRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        responses: {
          select: {
            id: true,
            doctorId: true,
            opinion: true,
            agreement: true,
            confidence: true,
            createdAt: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching second opinion requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Create new second opinion request
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const {
      condition,
      diagnosis,
      treatmentPlan,
      medicalRecords,
      symptoms,
      urgency,
      budget
    } = req.body;

    if (!condition || !diagnosis) {
      return res.status(400).json({ error: 'Condition and diagnosis are required' });
    }

    const request = await prisma.secondOpinionRequest.create({
      data: {
        patientId: userId,
        condition,
        diagnosis,
        treatmentPlan: treatmentPlan || {},
        medicalRecords: medicalRecords || [],
        symptoms: symptoms || [],
        urgency: urgency || 'NORMAL',
        budget: budget ? parseFloat(budget) : null,
        status: 'OPEN',
        responses: []
      }
    });

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error creating second opinion request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Get single second opinion request
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const request = await prisma.secondOpinionRequest.findFirst({
      where: {
        id,
        patientId: userId
      },
      include: {
        responses: {
          include: {
            doctor: {
              select: {
                id: true,
                username: true,
                specialty: true,
                yearsOfExperience: true
              }
            }
          }
        }
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching second opinion request:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Submit doctor response
router.post('/:id/respond', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user!.userId;
    const { opinion, agreement, alternative, reasoning, confidence, price } = req.body;

    if (!opinion || !agreement) {
      return res.status(400).json({ error: 'Opinion and agreement are required' });
    }

    // Verify user is a doctor
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { role: true }
    });

    if (doctor?.role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Only doctors can respond' });
    }

    const response = await prisma.secondOpinionResponse.create({
      data: {
        requestId: id,
        doctorId,
        opinion,
        agreement,
        alternative: alternative || null,
        reasoning,
        confidence: confidence || 0.8,
        price: price ? parseFloat(price) : null
      }
    });

    // Update request status
    await prisma.secondOpinionRequest.update({
      where: { id },
      data: { status: 'IN_REVIEW' }
    });

    res.status(201).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// Mark request as completed
router.patch('/:id/complete', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { selectedDoctorId } = req.body;

    const request = await prisma.secondOpinionRequest.updateMany({
      where: {
        id,
        patientId: userId
      },
      data: {
        status: 'COMPLETED',
        selectedDoctorId: selectedDoctorId || null
      }
    });

    if (request.count === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({
      success: true,
      message: 'Request marked as completed'
    });
  } catch (error) {
    console.error('Error completing request:', error);
    res.status(500).json({ error: 'Failed to complete request' });
  }
});

export default router;
