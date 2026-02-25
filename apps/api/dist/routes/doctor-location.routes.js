"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorLocationRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const auth_refactored_1 = require("../middleware/auth.refactored");
const location_service_1 = require("../services/location.service");
const availability_service_1 = require("../services/availability.service");
exports.doctorLocationRouter = (0, express_1.Router)();
/**
 * GET /api/posts/:postId/replies/doctors
 * Get doctor replies with location and availability data
 */
exports.doctorLocationRouter.get('/posts/:postId/replies/doctors', async (req, res) => {
    try {
        const { postId } = req.params;
        const { lat, lng, radius, telemedicine, inPersonOnly, emergency, insurance, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 50);
        const skip = (pageNum - 1) * limitNum;
        // Get patient location if provided
        const patientLat = lat ? parseFloat(lat) : null;
        const patientLng = lng ? parseFloat(lng) : null;
        // Validate coordinates if provided
        if (patientLat !== null && patientLng !== null) {
            if (!location_service_1.locationService.validateCoordinates(patientLat, patientLng)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid coordinates provided'
                });
            }
        }
        // Get all comments from doctors on this post
        const comments = await database_1.prisma.comment.findMany({
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
        const clinics = await database_1.prisma.$queryRaw `
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
        const availabilities = await database_1.prisma.$queryRaw `
      SELECT * FROM "DoctorAvailability"
      WHERE doctor_id = ANY(${doctorIds})
    `;
        // Create lookup maps
        const clinicsByDoctor = new Map();
        clinics.forEach(clinic => {
            if (!clinicsByDoctor.has(clinic.doctor_id)) {
                clinicsByDoctor.set(clinic.doctor_id, []);
            }
            clinicsByDoctor.get(clinic.doctor_id).push(clinic);
        });
        const availabilityByDoctor = new Map();
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
                const distResult = location_service_1.locationService.calculateDistanceFormatted(patientLat, patientLng, parseFloat(primaryClinic.latitude), parseFloat(primaryClinic.longitude));
                distance = distResult;
            }
            // Get clinic status
            let clinicStatus = null;
            if (primaryClinic && primaryClinic.hours) {
                clinicStatus = availability_service_1.availabilityService.getClinicStatus(primaryClinic.hours || [], [] // TODO: Fetch exceptions
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
            const radiusKm = parseFloat(radius);
            repliesWithLocation = repliesWithLocation.filter(reply => reply.doctor.clinic?.distance?.km !== undefined &&
                reply.doctor.clinic.distance.km <= radiusKm);
        }
        if (telemedicine === 'true') {
            repliesWithLocation = repliesWithLocation.filter(reply => reply.doctor.availability?.telemedicineAvailable === true);
        }
        if (inPersonOnly === 'true') {
            repliesWithLocation = repliesWithLocation.filter(reply => reply.doctor.availability?.inPersonAvailable === true &&
                reply.doctor.availability?.telemedicineAvailable === false);
        }
        if (emergency === 'true') {
            repliesWithLocation = repliesWithLocation.filter(reply => reply.doctor.availability?.emergencyAvailable === true);
        }
        if (insurance) {
            repliesWithLocation = repliesWithLocation.filter(reply => reply.doctor.availability &&
                availability_service_1.availabilityService.acceptsInsurance(reply.doctor.availability, insurance));
        }
        // Sort by distance if location provided, otherwise by score
        if (patientLat !== null && patientLng !== null) {
            repliesWithLocation.sort((a, b) => {
                const distA = a.doctor.clinic?.distance?.km ?? Infinity;
                const distB = b.doctor.clinic?.distance?.km ?? Infinity;
                return distA - distB;
            });
        }
        else {
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
    }
    catch (error) {
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
exports.doctorLocationRouter.post('/doctors/clinics', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        // Verify doctor role
        if (!['DOCTOR', 'NURSE', 'PHARMACIST'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Only healthcare professionals can add clinics'
            });
        }
        const { clinicName, address, city, state, country, postalCode, latitude, longitude, phone, isPrimary, hours } = req.body;
        // Validate required fields
        if (!clinicName || !address || !city || !country || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        // Validate coordinates
        if (!location_service_1.locationService.validateCoordinates(latitude, longitude)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates'
            });
        }
        // If setting as primary, unset other primary clinics
        if (isPrimary) {
            await database_1.prisma.$executeRaw `
        UPDATE "DoctorClinic"
        SET is_primary = false
        WHERE doctor_id = ${userId}
      `;
        }
        // Create clinic
        const clinic = await database_1.prisma.$queryRaw `
      INSERT INTO "DoctorClinic" (
        doctor_id, clinic_name, address, city, state, country,
        postal_code, latitude, longitude, phone, is_primary
      ) VALUES (
        ${userId}, ${clinicName}, ${address}, ${city}, ${state || null}, ${country},
        ${postalCode || null}, ${latitude}, ${longitude}, ${phone || null}, ${isPrimary || false}
      )
      RETURNING *
    `;
        const createdClinic = clinic[0];
        // Create clinic hours if provided
        if (hours && Array.isArray(hours)) {
            for (const hour of hours) {
                await database_1.prisma.$executeRaw `
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
    }
    catch (error) {
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
exports.doctorLocationRouter.put('/doctors/availability', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        // Verify doctor role
        if (!['DOCTOR', 'NURSE', 'PHARMACIST'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Only healthcare professionals can update availability'
            });
        }
        const { telemedicineAvailable, inPersonAvailable, emergencyAvailable, insuranceAccepted, acceptsAllInsurance, averageWaitTimeMinutes, nextAvailableSlot } = req.body;
        // Upsert availability
        await database_1.prisma.$executeRaw `
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
        const availability = await database_1.prisma.$queryRaw `
      SELECT * FROM "DoctorAvailability"
      WHERE doctor_id = ${userId}
    `;
        res.json({
            success: true,
            data: { availability: availability[0] }
        });
    }
    catch (error) {
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
exports.doctorLocationRouter.get('/doctors/clinics', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const clinics = await database_1.prisma.$queryRaw `
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
    }
    catch (error) {
        console.error('[API] Error fetching clinics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch clinics'
        });
    }
});
exports.default = exports.doctorLocationRouter;
