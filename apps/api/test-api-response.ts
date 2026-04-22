import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function testAPIResponse() {
  console.log('🧪 Testing what API will return...\n');

  try {
    const requests = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: {
          in: ['PENDING', 'UNDER_REVIEW']
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        doctorVerificationStatus: true,
        medicalLicenseNumber: true,
        licenseIssuingAuthority: true,
        licenseExpiryDate: true,
        specialty: true,
        subSpecialty: true,
        yearsOfExperience: true,
        hospitalAffiliation: true,
        clinicAddress: true,
        medicalUniversity: true,
        graduationYear: true,
        kycDocuments: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    console.log('📋 API will return:\n');
    console.log(JSON.stringify(requests, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIResponse();
