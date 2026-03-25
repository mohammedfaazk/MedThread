import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNavinReviews() {
  try {
    console.log('Checking reviews by Navin...\n');
    
    // Find Navin's user
    const navin = await prisma.user.findFirst({
      where: { email: 'navin@gmail.com' }
    });
    
    if (!navin) {
      console.log('❌ Navin user not found');
      return;
    }
    
    console.log('✓ Navin user found:', navin.id, navin.name);
    
    // Find all reviews by Navin
    const reviews = await prisma.review.findMany({
      where: { patientId: navin.id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialty: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\nFound ${reviews.length} reviews by Navin:\n`);
    
    reviews.forEach((review, index) => {
      console.log(`Review ${index + 1}:`);
      console.log('  ID:', review.id);
      console.log('  Doctor:', review.doctor.name, `(${review.doctor.email})`);
      console.log('  Rating:', review.rating);
      console.log('  Comment:', review.comment);
      console.log('  Created:', review.createdAt);
      console.log('');
    });
    
    // Check all reviews in database
    const allReviews = await prisma.review.findMany({
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true, email: true } }
      }
    });
    
    console.log(`\nTotal reviews in database: ${allReviews.length}\n`);
    allReviews.forEach((review, index) => {
      console.log(`${index + 1}. ${review.patient.name} → ${review.doctor.name} (${review.rating}★)`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNavinReviews();
