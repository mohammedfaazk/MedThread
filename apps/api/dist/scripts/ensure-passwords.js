"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAllUsersHavePasswords = ensureAllUsersHavePasswords;
const database_1 = require("@medthread/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Ensures all users have valid passwords
 * This runs on API startup to prevent login issues
 */
async function ensureAllUsersHavePasswords() {
    try {
        // Find users without passwords
        const usersWithoutPasswords = await database_1.prisma.user.findMany({
            where: {
                passwordHash: null
            },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
            }
        });
        if (usersWithoutPasswords.length === 0) {
            console.log('✅ All users have valid passwords');
            return;
        }
        console.log(`⚠️  Found ${usersWithoutPasswords.length} users without passwords. Fixing...`);
        for (const user of usersWithoutPasswords) {
            // Set default password based on role
            let defaultPassword = 'Password@123456';
            if (user.role === 'ADMIN') {
                defaultPassword = 'Admin@123456';
            }
            else if (user.role === 'DOCTOR') {
                defaultPassword = 'Doctor@123456';
            }
            else {
                defaultPassword = 'Patient@123456';
            }
            const hashedPassword = await bcrypt_1.default.hash(defaultPassword, 10);
            await database_1.prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: hashedPassword }
            });
            console.log(`   ✅ Fixed password for ${user.username} (${user.email})`);
        }
        console.log('✅ All user passwords fixed');
    }
    catch (error) {
        console.error('❌ Error ensuring passwords:', error);
        // Don't throw - allow API to start even if this fails
    }
}
