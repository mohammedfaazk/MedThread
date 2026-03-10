"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorsByAreaRouter = void 0;
const express_1 = require("express");
const pincode_proximity_service_1 = require("../services/pincode-proximity.service");
const database_1 = require("@medthread/database");
exports.doctorsByAreaRouter = (0, express_1.Router)();
/**
 * GET /api/v1/doctors/by-area
 * Get doctors sorted by proximity to a pincode
 * Query params:
 * - pincode: Reference pincode (required)
 * - specialty: Filter by specialty (optional)
 * - verified: Filter verified doctors only (optional, default: true)
 * - limit: Number of results (optional, default: 20)
 * - offset: Pagination offset (optional, default: 0)
 */
exports.doctorsByAreaRouter.get('/by-area', async (req, res) => {
    try {
        const { pincode, specialty, verified, limit, offset } = req.query;
        if (!pincode || typeof pincode !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Pincode is required'
            });
        }
        const doctors = await pincode_proximity_service_1.pincodeProximityService.getDoctorsByProximity(pincode, {
            specialty: specialty,
            verified: verified === 'false' ? false : true,
            limit: limit ? parseInt(limit) : 20,
            offset: offset ? parseInt(offset) : 0
        });
        // Group by proximity for better UX
        const grouped = pincode_proximity_service_1.pincodeProximityService.groupByProximity(doctors, pincode);
        res.json({
            success: true,
            data: {
                doctors,
                grouped: {
                    exact: grouped.exact.length,
                    sameRegion: grouped.sameRegion.length,
                    sameState: grouped.sameState.length,
                    sameZone: grouped.sameZone.length,
                    others: grouped.others.length
                },
                total: doctors.length,
                filters: {
                    pincode,
                    specialty: specialty || 'all',
                    verified: verified === 'false' ? false : true
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching doctors by area:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch doctors'
        });
    }
});
/**
 * GET /api/v1/doctors/top-by-area
 * Get top performing doctors in an area for a time period
 * Query params:
 * - pincode: Area pincode (required)
 * - period: day | week | month (optional, default: week)
 * - limit: Number of results (optional, default: 10)
 */
exports.doctorsByAreaRouter.get('/top-by-area', async (req, res) => {
    try {
        const { pincode, period, limit } = req.query;
        if (!pincode || typeof pincode !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Pincode is required'
            });
        }
        const validPeriod = ['day', 'week', 'month'].includes(period)
            ? period
            : 'week';
        const topDoctors = await pincode_proximity_service_1.pincodeProximityService.getTopDoctorsByArea(pincode, validPeriod, limit ? parseInt(limit) : 10);
        res.json({
            success: true,
            data: {
                doctors: topDoctors,
                period: validPeriod,
                pincode,
                total: topDoctors.length
            }
        });
    }
    catch (error) {
        console.error('Error fetching top doctors by area:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch top doctors'
        });
    }
});
/**
 * GET /api/v1/doctors/nearby-areas
 * Find nearby pincodes/areas
 * Query params:
 * - pincode: Reference pincode (required)
 * - radius: region | state | zone (optional, default: region)
 */
exports.doctorsByAreaRouter.get('/nearby-areas', async (req, res) => {
    try {
        const { pincode, radius } = req.query;
        if (!pincode || typeof pincode !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Pincode is required'
            });
        }
        const validRadius = ['region', 'state', 'zone'].includes(radius)
            ? radius
            : 'region';
        const nearbyPincodes = await pincode_proximity_service_1.pincodeProximityService.findNearbyPincodes(pincode, validRadius);
        res.json({
            success: true,
            data: {
                pincode,
                radius: validRadius,
                nearbyPincodes,
                count: nearbyPincodes.length
            }
        });
    }
    catch (error) {
        console.error('Error finding nearby areas:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to find nearby areas'
        });
    }
});
/**
 * GET /api/v1/doctors/area-stats
 * Get statistics about doctors in an area
 * Query params:
 * - pincode: Area pincode (required)
 */
exports.doctorsByAreaRouter.get('/area-stats', async (req, res) => {
    try {
        const { pincode } = req.query;
        if (!pincode || typeof pincode !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Pincode is required'
            });
        }
        const regionPrefix = pincode.substring(0, 3);
        // Get doctor counts by proximity level
        const [exact, region, state] = await Promise.all([
            database_1.prisma.user.count({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: 'APPROVED',
                    pincode: pincode
                }
            }),
            database_1.prisma.user.count({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: 'APPROVED',
                    pincode: {
                        startsWith: regionPrefix
                    }
                }
            }),
            database_1.prisma.user.count({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: 'APPROVED',
                    pincode: {
                        startsWith: pincode.substring(0, 2)
                    }
                }
            })
        ]);
        // Get specialty distribution in the area
        const specialtyDistribution = await database_1.prisma.user.groupBy({
            by: ['specialty'],
            where: {
                role: 'DOCTOR',
                doctorVerificationStatus: 'APPROVED',
                pincode: {
                    startsWith: regionPrefix
                },
                specialty: {
                    not: null
                }
            },
            _count: {
                specialty: true
            },
            orderBy: {
                _count: {
                    specialty: 'desc'
                }
            },
            take: 10
        });
        res.json({
            success: true,
            data: {
                pincode,
                doctorCounts: {
                    exactMatch: exact,
                    sameRegion: region,
                    sameState: state
                },
                topSpecialties: specialtyDistribution.map(s => ({
                    specialty: s.specialty,
                    count: s._count.specialty
                }))
            }
        });
    }
    catch (error) {
        console.error('Error fetching area stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch area statistics'
        });
    }
});
exports.default = exports.doctorsByAreaRouter;
