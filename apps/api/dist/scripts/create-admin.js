"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("@medthread/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const readline = __importStar(require("readline"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}
async function createAdmin() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   MedThread Admin User Creation       ║');
    console.log('╚════════════════════════════════════════╝\n');
    try {
        // Check if admin already exists
        const existingAdmin = await database_1.prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log(`   Username: ${existingAdmin.username}`);
            console.log(`   Email: ${existingAdmin.email}\n`);
            const overwrite = await question('Do you want to create another admin? (yes/no): ');
            if (overwrite.toLowerCase() !== 'yes') {
                console.log('\n✅ Keeping existing admin user.\n');
                rl.close();
                process.exit(0);
            }
        }
        // Get admin details
        const email = await question('\nEnter admin email: ');
        const username = await question('Enter admin username: ');
        const password = await question('Enter admin password (min 8 characters): ');
        // Validate inputs
        if (!email || !email.includes('@')) {
            throw new Error('Invalid email address');
        }
        if (!username || username.length < 3) {
            throw new Error('Username must be at least 3 characters');
        }
        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
        // Check if email or username already exists
        const existingUser = await database_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });
        if (existingUser) {
            throw new Error('Email or username already exists');
        }
        // Hash password
        console.log('\n⏳ Creating admin user...');
        const passwordHash = await bcrypt_1.default.hash(password, 12);
        // Create admin user
        const admin = await database_1.prisma.user.create({
            data: {
                email,
                username,
                passwordHash,
                role: 'ADMIN',
                verified: true,
                emailVerified: true,
            }
        });
        console.log('\n✅ Admin user created successfully!\n');
        console.log('╔════════════════════════════════════════╗');
        console.log('║   Admin Credentials                    ║');
        console.log('╠════════════════════════════════════════╣');
        console.log(`║  Email:    ${email.padEnd(28)}║`);
        console.log(`║  Username: ${username.padEnd(28)}║`);
        console.log(`║  Password: ${password.padEnd(28)}║`);
        console.log('╚════════════════════════════════════════╝\n');
        console.log('⚠️  IMPORTANT: Save these credentials securely!\n');
        console.log('You can now login at: http://localhost:3000/admin/login\n');
    }
    catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
    finally {
        rl.close();
        await database_1.prisma.$disconnect();
    }
}
createAdmin();
