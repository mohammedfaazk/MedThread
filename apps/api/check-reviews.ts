import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function checkReviews() {
    try {
        console.log('Checking all reviews...\n');
        
        const reviews = await prisma.patientFeedback.findMany({
            include: {
                patient: { select: { username: true, email: true } },
                doctor: { select: { username: true, email: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        console.log(`Found ${reviews.length} recent reviews:\n`);

        reviews.forEach((review, index) => {
            console.log(`${index + 1}. Review ID: ${review.id.slice(0, 12)}...`);
            console.log(`   Patient: ${review.patient.username} (${review.patient.email})`);
            console.log(`   Doctor: ${review.doctor.username} (${review.doctor.email})`);
            console.log(`   Overall Rating: ${review.overallRating}/5`);
            if (review.communicationRating) console.log(`   Communication: ${review.communicationRating}/5`);
            if (review.knowledgeRating) console.log(`   Knowledge: ${review.knowledgeRating}/5`);
            if (review.empathyRating) console.log(`   Empathy: ${review.empathyRating}/5`);
            if (review.reviewText) console.log(`   Review: ${review.reviewText.slice(0, 100)}...`);
            console.log(`   Created: ${review.createdAt.toLocaleString()}`);
            console.log('');
        });

        // Count reviews per doctor
        const doctorReviews = await prisma.patientFeedback.groupBy({
            by: ['doctorId'],
            _count: true,
            _avg: {
                overallRating: true
            }
        });

        console.log('Reviews by doctor:');
        for (const dr of doctorReviews) {
            const doctor = await prisma.user.findUnique({
                where: { id: dr.doctorId },
                select: { username: true }
            });
            console.log(`  ${doctor?.username}: ${dr._count} reviews, avg rating: ${dr._avg.overallRating?.toFixed(1)}/5`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkReviews();
