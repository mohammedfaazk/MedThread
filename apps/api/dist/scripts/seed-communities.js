"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("@medthread/database");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const defaultCommunities = [
    {
        name: 'general',
        displayName: 'General Health',
        description: 'General health discussions and questions'
    },
    {
        name: 'cardiology',
        displayName: 'Cardiology',
        description: 'Heart and cardiovascular health'
    },
    {
        name: 'neurology',
        displayName: 'Neurology',
        description: 'Brain, nervous system, and neurological conditions'
    },
    {
        name: 'pediatrics',
        displayName: 'Pediatrics',
        description: 'Child health and development'
    },
    {
        name: 'mental_health',
        displayName: 'Mental Health',
        description: 'Mental health, psychology, and emotional wellbeing'
    },
    {
        name: 'dermatology',
        displayName: 'Dermatology',
        description: 'Skin, hair, and nail conditions'
    },
    {
        name: 'orthopedics',
        displayName: 'Orthopedics',
        description: 'Bones, joints, muscles, and sports medicine'
    },
    {
        name: 'gastroenterology',
        displayName: 'Gastroenterology',
        description: 'Digestive system and gastrointestinal health'
    },
    {
        name: 'oncology',
        displayName: 'Oncology',
        description: 'Cancer prevention, treatment, and support'
    },
    {
        name: 'endocrinology',
        displayName: 'Endocrinology',
        description: 'Hormones, diabetes, and metabolic disorders'
    }
];
async function seedCommunities() {
    console.log('\n🌱 Seeding communities...\n');
    try {
        // Get or create admin user to be the creator
        let admin = await database_1.prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });
        if (!admin) {
            console.log('⚠️  No admin user found. Creating one...');
            const bcrypt = require('bcrypt');
            const passwordHash = await bcrypt.hash('Admin@123456', 12);
            admin = await database_1.prisma.user.create({
                data: {
                    email: 'admin@medthread.com',
                    username: 'admin',
                    passwordHash,
                    role: 'ADMIN',
                    verified: true,
                    emailVerified: true,
                }
            });
            console.log('✅ Admin user created\n');
        }
        let created = 0;
        let skipped = 0;
        for (const communityData of defaultCommunities) {
            // Check if community already exists
            const existing = await database_1.prisma.community.findUnique({
                where: { name: communityData.name }
            });
            if (existing) {
                console.log(`⏭️  Skipping ${communityData.name} (already exists)`);
                skipped++;
                continue;
            }
            // Create community
            const community = await database_1.prisma.community.create({
                data: {
                    name: communityData.name,
                    displayName: communityData.displayName,
                    description: communityData.description,
                    memberCount: 1,
                }
            });
            // Add admin as member and moderator
            await Promise.all([
                database_1.prisma.communityMember.create({
                    data: {
                        userId: admin.id,
                        communityId: community.id,
                    }
                }),
                database_1.prisma.communityModerator.create({
                    data: {
                        userId: admin.id,
                        communityId: community.id,
                        permissions: {
                            all: true,
                            posts: true,
                            comments: true,
                            users: true,
                            settings: true,
                            flair: true,
                        }
                    }
                })
            ]);
            console.log(`✅ Created m/${communityData.name}`);
            created++;
        }
        console.log(`\n📊 Summary:`);
        console.log(`   Created: ${created}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total: ${defaultCommunities.length}\n`);
    }
    catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    }
    finally {
        await database_1.prisma.$disconnect();
    }
}
seedCommunities()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
