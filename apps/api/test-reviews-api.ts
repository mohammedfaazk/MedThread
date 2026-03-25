import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testReviewsAPI() {
  try {
    console.log('Testing reviews API...\n');
    
    // Get verified doctors
    const doctorsResponse = await axios.get(`${API_URL}/api/doctor-verification/verified`);
    const doctors = doctorsResponse.data.data || doctorsResponse.data;
    
    console.log(`Found ${doctors.length} verified doctors\n`);
    
    // Check reviews for each doctor
    for (const doctor of doctors) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Doctor: ${doctor.name} (${doctor.email})`);
      console.log(`Doctor ID: ${doctor.id}`);
      console.log(`Specialty: ${doctor.specialty}`);
      
      const reviewsResponse = await axios.get(`${API_URL}/api/reviews/doctor/${doctor.id}`);
      
      if (reviewsResponse.data.success) {
        const { reviews, stats } = reviewsResponse.data.data;
        console.log(`\n📊 Stats:`);
        console.log(`  Total Reviews: ${stats.totalReviews}`);
        console.log(`  Average Rating: ${stats.averageRating.toFixed(1)}★`);
        console.log(`  Distribution:`, stats.ratingDistribution);
        
        if (reviews.length > 0) {
          console.log('\n📝 Reviews:');
          reviews.forEach((review: any, index: number) => {
            console.log(`\n  ${index + 1}. By ${review.patient.username}`);
            console.log(`     Rating: ${review.overallRating}★`);
            if (review.communicationRating) console.log(`     Communication: ${review.communicationRating}★`);
            if (review.knowledgeRating) console.log(`     Knowledge: ${review.knowledgeRating}★`);
            if (review.empathyRating) console.log(`     Empathy: ${review.empathyRating}★`);
            if (review.reviewText) console.log(`     Comment: "${review.reviewText}"`);
            console.log(`     Date: ${new Date(review.createdAt).toLocaleDateString()}`);
          });
        } else {
          console.log('\n  No reviews yet');
        }
      }
    }
    
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testReviewsAPI();
