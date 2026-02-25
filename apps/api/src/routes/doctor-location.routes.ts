import { Router } from 'express';
import { prisma } from '@medthread/database';
import { authenticate } from '../middleware/auth.refactored';
import { locationService } from '../services/location.service';
import { availabilityService } from '../services/availability.service';
import { geocodingService } from '../services/geocoding.service';

export const doctorLocationRouter = Router();

/**
 * GET /api/posts/:postId/replies/doctors
 * Get doctor replies with location and availability data
 */
doctorLocationRouter.get('/posts/:postId/replies/doctors', async (req, res) => {
  try {
    const { postId } = req.params;
    const {
      lat,
      lng,
      radius,
      telemedicine,
      inPersonOnly,
      emergency,
      insurance,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const skip = (pageNum - 1) * limitNum;

    // Get patient location if provided
    const patientLat = lat ? parseFloat(lat as string) : null;
    const patientLng = lng ? parseFloat(lng as string) : null;

    // Validate coordinates if provided
    if (patientLat !== null && patientLng !== null) {
      if (!locationService.validateCoordinates(patientLat, patientLng)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid coordinates provided'
        });
      }
    }

    // Get all comments from doctors on this post
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        author: {
          role: {
            in: ['DOCTOR', 'NURSE', 'PHARMACIST']
          }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true,
            avatar: true,
            verified: true,
            specialty: true,
            subSpecialty: true,
            yearsOfExperience: true,
            hospitalAffiliation: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get unique doctor IDs
    const doctorIds = [...new Set(comments.map(c => c.authorId))];

    if (doctorIds.length === 0) {
      return res.json({
        success: true,
        data: {
          replies: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            totalPages: 0
          }
        }
      });
    }

    // Fetch clinic data for all doctors
    const clinics = await prisma.$queryRaw<any[]>`
      SELECT 
        dc.*,
        json_agg(
          json_build_object(
            'id', ch.id,
            'day_of_week', ch.day_of_week,
            'open_time', ch.open_time::text,
            'close_time', ch.close_time::text,
            'is_closed', ch.is_closed
          )
        ) FILTER (WHERE ch.id IS NOT NULL) as hours
      FROM "DoctorClinic" dc
      LEFT JOIN "ClinicHours" ch ON dc.id = ch.clinic_id
      WHERE dc.doctor_id = ANY(${doctorIds})
      GROUP BY dc.id
    `;

    // Fetch availability data
    const availabilities = await prisma.$queryRaw<any[]>`
      SELECT * FROM "DoctorAvailability"
      WHERE doctor_id = ANY(${doctorIds})
    `;

    // Create lookup maps
    const clinicsByDoctor = new Map<string, any[]>();
    clinics.forEach(clinic => {
      if (!clinicsByDoctor.has(clinic.doctor_id)) {
        clinicsByDoctor.set(clinic.doctor_id, []);
      }
      clinicsByDoctor.get(clinic.doctor_id)!.push(clinic);
    });

    const availabilityByDoctor = new Map<string, any>();
    availabilities.forEach(avail => {
      availabilityByDoctor.set(avail.doctor_id, avail);
    });

    // Build reply data with location info
    let repliesWithLocation = comments.map(comment => {
      const doctorClinics = clinicsByDoctor.get(comment.authorId) || [];
      const primaryClinic = doctorClinics.find(c => c.is_primary) || doctorClinics[0];
      const availability = availabilityByDoctor.get(comment.authorId);

      let distance = null;
      if (patientLat !== null && patientLng !== null && primaryClinic) {
        const distResult = locationService.calculateDistanceFormatted(
          patientLat,
          patientLng,
          parseFloat(primaryClinic.latitude),
          parseFloat(primaryClinic.longitude)
        );
        distance = distResult;
      }

      // Get clinic status
      let clinicStatus = null;
      if (primaryClinic && primaryClinic.hours) {
        clinicStatus = availabilityService.getClinicStatus(
          primaryClinic.hours || [],
          [] // TODO: Fetch exceptions
        );
      }

      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        upvotes: comment.upvotes,
        score: comment.score,
        doctor: {
          id: comment.author.id,
          username: comment.author.username,
          role: comment.author.role,
          avatar: comment.author.avatar,
          verified: comment.author.verified,
          specialty: comment.author.specialty,
          subSpecialty: comment.author.subSpecialty,
          yearsOfExperience: comment.author.yearsOfExperience,
          hospitalAffiliation: comment.author.hospitalAffiliation,
          clinic: primaryClinic ? {
            id: primaryClinic.id,
            name: primaryClinic.clinic_name,
            address: primaryClinic.address,
            city: primaryClinic.city,
            state: primaryClinic.state,
            country: primaryClinic.country,
            latitude: parseFloat(primaryClinic.latitude),
            longitude: parseFloat(primaryClinic.longitude),
            phone: primaryClinic.phone,
            distance
          } : null,
          availability: availability ? {
            telemedicineAvailable: availability.telemedicine_available,
            inPersonAvailable: availability.in_person_available,
            emergencyAvailable: availability.emergency_available,
            insuranceAccepted: availability.insurance_accepted || [],
            acceptsAllInsurance: availability.accepts_all_insurance,
            nextAvailableSlot: availability.next_available_slot
          } : null,
          clinicStatus
        }
      };
    });

    // Apply filters
    if (radius && patientLat !== null && patientLng !== null) {
      const radiusKm = parseFloat(radius as string);
      repliesWithLocation = repliesWithLocation.filter(reply => 
        reply.doctor.clinic?.distance?.km !== undefined && 
        reply.doctor.clinic.distance.km <= radiusKm
      );
    }

    if (telemedicine === 'true') {
      repliesWithLocation = repliesWithLocation.filter(reply =>
        reply.doctor.availability?.telemedicineAvailable === true
      );
    }

    if (inPersonOnly === 'true') {
      repliesWithLocation = repliesWithLocation.filter(reply =>
        reply.doctor.availability?.inPersonAvailable === true &&
        reply.doctor.availability?.telemedicineAvailable === false
      );
    }

    if (emergency === 'true') {
      repliesWithLocation = repliesWithLocation.filter(reply =>
        reply.doctor.availability?.emergencyAvailable === true
      );
    }

    if (insurance) {
      repliesWithLocation = repliesWithLocation.filter(reply =>
        reply.doctor.availability &&
        availabilityService.acceptsInsurance(reply.doctor.availability, insurance as string)
      );
    }

    // Sort by distance if location provided, otherwise by score
    if (patientLat !== null && patientLng !== null) {
      repliesWithLocation.sort((a, b) => {
        const distA = a.doctor.clinic?.distance?.km ?? Infinity;
        const distB = b.doctor.clinic?.distance?.km ?? Infinity;
        return distA - distB;
      });
    } else {
      repliesWithLocation.sort((a, b) => b.score - a.score);
    }

    // Paginate
    const total = repliesWithLocation.length;
    const paginatedReplies = repliesWithLocation.slice(skip, skip + limitNum);

    res.json({
      success: true,
      data: {
        replies: paginatedReplies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('[API] Error fetching doctor replies with location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor replies'
    });
  }
});

/**
 * POST /api/doctors/clinics
 * Create a new clinic for authenticated doctor
 */
doctorLocationRouter.post('/doctors/clinics', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    // Verify doctor role
    if (!['DOCTOR', 'NURSE', 'PHARMACIST'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Only healthcare professionals can add clinics'
      });
    }

    const {
      clinicName,
      address,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      phone,
      isPrimary,
      hours
    } = req.body;

    // Validate required fields
    if (!clinicName || !address || !city || !country) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: clinicName, address, city, country'
      });
    }

    let finalLat = latitude;
    let finalLng = longitude;
    let formattedAddress = address;

    // If coordinates not provided, geocode the address
    if (!latitude || !longitude) {
      const fullAddress = `${address}, ${city}, ${state || ''}, ${country}`.replace(/,\s*,/g, ',');
      const geocodeResult = await geocodingService.geocodeAddress(fullAddress);
      
      if (!geocodeResult) {
        return res.status(400).json({
          success: false,
          error: 'Could not geocode address. Please provide valid latitude and longitude, or check the address format.'
        });
      }

      finalLat = geocodeResult.lat;
      finalLng = geocodeResult.lng;
      formattedAddress = geocodeResult.formattedAddress;
      
      console.log(`[Geocoding] Address "${fullAddress}" → (${finalLat}, ${finalLng})`);
    }

    // Validate coordinates
    if (!locationService.validateCoordinates(finalLat, finalLng)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates'
      });
    }

    // If setting as primary, unset other primary clinics
    if (isPrimary) {
      await prisma.$executeRaw`
        UPDATE "DoctorClinic"
        SET is_primary = false
        WHERE doctor_id = ${userId}
      `;
    }

    // Create clinic
    const clinic = await prisma.$queryRaw<any[]>`
      INSERT INTO "DoctorClinic" (
        doctor_id, clinic_name, address, city, state, country,
        postal_code, latitude, longitude, phone, is_primary
      ) VALUES (
        ${userId}, ${clinicName}, ${formattedAddress}, ${city}, ${state || null}, ${country},
        ${postalCode || null}, ${finalLat}, ${finalLng}, ${phone || null}, ${isPrimary || false}
      )
      RETURNING *
    `;

    const createdClinic = clinic[0];

    // Create clinic hours if provided
    if (hours && Array.isArray(hours)) {
      for (const hour of hours) {
        await prisma.$executeRaw`
          INSERT INTO "ClinicHours" (
            clinic_id, day_of_week, open_time, close_time, is_closed
          ) VALUES (
            ${createdClinic.id}, ${hour.dayOfWeek}, ${hour.openTime}::time,
            ${hour.closeTime}::time, ${hour.isClosed || false}
          )
          ON CONFLICT (clinic_id, day_of_week) DO UPDATE
          SET open_time = ${hour.openTime}::time,
              close_time = ${hour.closeTime}::time,
              is_closed = ${hour.isClosed || false}
        `;
      }
    }

    res.status(201).json({
      success: true,
      data: { clinic: createdClinic }
    });
  } catch (error) {
    console.error('[API] Error creating clinic:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create clinic'
    });
  }
});

/**
 * PUT /api/doctors/availability
 * Update doctor availability settings
 */
doctorLocationRouter.put('/doctors/availability', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    // Verify doctor role
    if (!['DOCTOR', 'NURSE', 'PHARMACIST'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Only healthcare professionals can update availability'
      });
    }

    const {
      telemedicineAvailable,
      inPersonAvailable,
      emergencyAvailable,
      insuranceAccepted,
      acceptsAllInsurance,
      averageWaitTimeMinutes,
      nextAvailableSlot
    } = req.body;

    // Upsert availability
    await prisma.$executeRaw`
      INSERT INTO "DoctorAvailability" (
        doctor_id, telemedicine_available, in_person_available,
        emergency_available, insurance_accepted, accepts_all_insurance,
        average_wait_time_minutes, next_available_slot, updated_at
      ) VALUES (
        ${userId}, ${telemedicineAvailable || false}, ${inPersonAvailable || true},
        ${emergencyAvailable || false}, ${insuranceAccepted || []}::text[],
        ${acceptsAllInsurance || false}, ${averageWaitTimeMinutes || null},
        ${nextAvailableSlot || null}::timestamp, CURRENT_TIMESTAMP
      )
      ON CONFLICT (doctor_id) DO UPDATE
      SET telemedicine_available = ${telemedicineAvailable || false},
          in_person_available = ${inPersonAvailable || true},
          emergency_available = ${emergencyAvailable || false},
          insurance_accepted = ${insuranceAccepted || []}::text[],
          accepts_all_insurance = ${acceptsAllInsurance || false},
          average_wait_time_minutes = ${averageWaitTimeMinutes || null},
          next_available_slot = ${nextAvailableSlot || null}::timestamp,
          updated_at = CURRENT_TIMESTAMP
    `;

    // Fetch updated availability
    const availability = await prisma.$queryRaw<any[]>`
      SELECT * FROM "DoctorAvailability"
      WHERE doctor_id = ${userId}
    `;

    res.json({
      success: true,
      data: { availability: availability[0] }
    });
  } catch (error) {
    console.error('[API] Error updating availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update availability'
    });
  }
});

/**
 * GET /api/doctors/clinics
 * Get all clinics for authenticated doctor
 */
doctorLocationRouter.get('/doctors/clinics', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const clinics = await prisma.$queryRaw<any[]>`
      SELECT 
        dc.*,
        json_agg(
          json_build_object(
            'id', ch.id,
            'day_of_week', ch.day_of_week,
            'open_time', ch.open_time::text,
            'close_time', ch.close_time::text,
            'is_closed', ch.is_closed
          ) ORDER BY ch.day_of_week
        ) FILTER (WHERE ch.id IS NOT NULL) as hours
      FROM "DoctorClinic" dc
      LEFT JOIN "ClinicHours" ch ON dc.id = ch.clinic_id
      WHERE dc.doctor_id = ${userId}
      GROUP BY dc.id
      ORDER BY dc.is_primary DESC, dc.created_at DESC
    `;

    res.json({
      success: true,
      data: { clinics }
    });
  } catch (error) {
    console.error('[API] Error fetching clinics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clinics'
    });
  }
});

export default doctorLocationRouter;
