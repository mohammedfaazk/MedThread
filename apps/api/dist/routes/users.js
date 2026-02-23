"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.get('/:id', async (req, res) => {
    try {
        const user = await database_1.prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                verified: true,
                totalKarma: true,
                doctorVerificationStatus: true,
                // Doctor professional info
                specialty: true,
                subSpecialty: true,
                yearsOfExperience: true,
                hospitalAffiliation: true,
                clinicAddress: true,
                medicalLicenseNumber: true,
                licenseIssuingAuthority: true,
                licenseExpiryDate: true,
                // Contact and profile
                phone: true,
                bio: true,
                avatar: true,
                createdAt: true,
                verifiedAt: true,
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        console.error('[API] Error fetching user:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
});
// PUT endpoint for updating user profile
exports.userRouter.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        // Remove fields that shouldn't be updated via this endpoint
        delete updateData.id;
        delete updateData.email;
        delete updateData.role;
        delete updateData.medicalLicenseNumber;
        delete updateData.licenseIssuingAuthority;
        delete updateData.licenseExpiryDate;
        delete updateData.doctorVerificationStatus;
        delete updateData.verified;
        const updatedUser = await database_1.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                verified: true,
                totalKarma: true,
                doctorVerificationStatus: true,
                specialty: true,
                subSpecialty: true,
                yearsOfExperience: true,
                hospitalAffiliation: true,
                clinicAddress: true,
                bio: true,
                phone: true,
                medicalLicenseNumber: true,
                licenseIssuingAuthority: true,
                licenseExpiryDate: true,
                createdAt: true
            }
        });
        res.json({ success: true, data: updatedUser });
    }
    catch (error) {
        console.error('[API] Error updating user profile:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
});
exports.default = exports.userRouter;
