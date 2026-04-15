import { prisma } from '@medthread/database';

async function seedSampleAlerts() {
  console.log('🚨 Seeding sample emergency alerts...');

  try {
    // Get admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.error('❌ No admin user found. Please create an admin first.');
      return;
    }

    // Create sample alerts
    const alerts = [
      {
        title: 'COVID-19 Vaccination Drive',
        message: 'Free COVID-19 vaccination available at City General Hospital. Walk-ins welcome from 9 AM to 5 PM.',
        type: 'HEALTH_ALERT',
        priority: 'MEDIUM',
        targetAudience: 'ALL',
        targetRegion: 'Chennai, Tamil Nadu',
        isActive: true,
        createdBy: admin.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        title: 'Dengue Outbreak Alert',
        message: 'Increased dengue cases reported in the region. Please take preventive measures: use mosquito repellent, eliminate standing water, and seek medical attention if you experience fever.',
        type: 'HEALTH_ALERT',
        priority: 'HIGH',
        targetAudience: 'ALL',
        targetRegion: 'Chennai, Bangalore, Hyderabad',
        isActive: true,
        createdBy: admin.id,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      },
      {
        title: 'Heat Wave Warning',
        message: 'Extreme heat conditions expected. Stay hydrated, avoid outdoor activities during peak hours (12 PM - 4 PM), and check on elderly neighbors.',
        type: 'HEALTH_ALERT',
        priority: 'HIGH',
        targetAudience: 'ALL',
        targetRegion: 'All regions',
        isActive: true,
        createdBy: admin.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        title: 'Emergency Blood Donation Drive',
        message: 'Critical shortage of O- and AB+ blood types. Urgent donations needed at City General Hospital. Contact: +91-XXXX-XXXX',
        type: 'EMERGENCY',
        priority: 'CRITICAL',
        targetAudience: 'ALL',
        targetRegion: 'Chennai',
        isActive: true,
        createdBy: admin.id,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      },
      {
        title: 'Flu Season Advisory',
        message: 'Seasonal flu cases on the rise. Get your flu shot, practice good hygiene, and stay home if you feel unwell.',
        type: 'HEALTH_ALERT',
        priority: 'MEDIUM',
        targetAudience: 'ALL',
        targetRegion: 'All regions',
        isActive: true,
        createdBy: admin.id,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
      },
      {
        title: 'Water Contamination Alert - EXPIRED',
        message: 'Water supply contamination detected in Zone 5. Boil water before consumption. Bottled water distribution at community centers.',
        type: 'EMERGENCY',
        priority: 'HIGH',
        targetAudience: 'ALL',
        targetRegion: 'Chennai Zone 5',
        isActive: false,
        createdBy: admin.id,
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Expired 5 days ago
      },
      {
        title: 'Mental Health Awareness Week',
        message: 'Free mental health consultations available this week. Book your appointment at participating clinics. Remember: It\'s okay to ask for help.',
        type: 'HEALTH_ALERT',
        priority: 'MEDIUM',
        targetAudience: 'ALL',
        targetRegion: 'All regions',
        isActive: true,
        createdBy: admin.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    ];

    // Create alerts
    for (const alertData of alerts) {
      const alert = await prisma.emergencyBroadcast.create({
        data: alertData
      });
      console.log(`✅ Created alert: ${alert.title} (${alert.priority})`);
    }

    console.log('\n🎉 Successfully seeded sample alerts!');
    console.log(`📊 Total alerts created: ${alerts.length}`);
    console.log(`   - Active: ${alerts.filter(a => a.isActive).length}`);
    console.log(`   - Expired: ${alerts.filter(a => !a.isActive).length}`);
    console.log('\n🔗 Visit http://localhost:3000/alerts-history to view them!');

  } catch (error) {
    console.error('❌ Error seeding alerts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleAlerts();
