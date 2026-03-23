import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Realistic doctor profiles data
const doctorProfiles = [
  {
    email: 'dr.sarah.chen@medthread.com',
    username: 'dr_sarah_chen',
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiology',
    subSpecialty: 'Interventional Cardiology',
    yearsOfExperience: 12,
    graduationYear: 2012,
    medicalUniversity: 'Harvard Medical School',
    hospitalAffiliation: 'Massachusetts General Hospital',
    clinicAddress: 'Boston, MA 02114',
    phone: '+1-617-555-0101',
    bio: 'Board-certified cardiologist specializing in interventional procedures. Passionate about preventive cardiology and patient education.',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    medicalLicenseNumber: 'MA-12345-2012',
    licenseIssuingAuthority: 'Massachusetts Board of Registration in Medicine',
    pincode: '02114'
  },
  {
    email: 'dr.michael.rodriguez@medthread.com',
    username: 'dr_michael_rodriguez',
    name: 'Dr. Michael Rodriguez',
    specialty: 'Pediatrics',
    subSpecialty: 'Pediatric Emergency Medicine',
    yearsOfExperience: 8,
    graduationYear: 2016,
    medicalUniversity: 'Stanford University School of Medicine',
    hospitalAffiliation: 'Stanford Children\'s Hospital',
    clinicAddress: 'Palo Alto, CA 94304',
    phone: '+1-650-555-0102',
    bio: 'Pediatric emergency medicine specialist dedicated to providing compassionate care for children and families during critical moments.',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    medicalLicenseNumber: 'CA-67890-2016',
    licenseIssuingAuthority: 'Medical Board of California',
    pincode: '94304'
  }
];

// Sample posts content for different specialties
const postTemplates = {
  Cardiology: [
    {
      title: 'Understanding Heart Palpitations: When to Worry',
      content: 'Heart palpitations can be concerning, but they\'re often harmless. Here\'s what you need to know about when to seek medical attention...'
    }
  ],
  Pediatrics: [
    {
      title: 'Common Childhood Fevers: A Parent\'s Guide',
      content: 'Fever in children can be scary for parents. Here\'s when to call your pediatrician and how to manage fever at home safely...'
    },
    {
      title: 'Vaccination Schedule Updates for 2026',
      content: 'Important updates to the childhood vaccination schedule. Here\'s what parents need to know about the latest recommendations...'
    }
  ],
  Dermatology: [
    {
      title: 'Skin Cancer Prevention: Beyond Sunscreen',
      content: 'While sunscreen is important, there are many other ways to protect your skin from harmful UV rays...'
    }
  ],
  Neurology: [
    {
      title: 'Migraine Management: New Treatment Options',
      content: 'Recent advances in migraine treatment offer new hope for patients suffering from chronic headaches...'
    }
  ],
  Orthopedics: [
    {
      title: 'Sports Injury Prevention for Athletes',
      content: 'Proper warm-up, conditioning, and technique can prevent most sports-related injuries...'
    }
  ]
};

// Extended doctor profiles
const allDoctorProfiles = [
  ...doctorProfiles,
  {
    email: 'dr.emily.watson@medthread.com',
    username: 'dr_emily_watson',
    name: 'Dr. Emily Watson',
    specialty: 'Dermatology',
    subSpecialty: 'Dermatopathology',
    yearsOfExperience: 15,
    graduationYear: 2009,
    medicalUniversity: 'Johns Hopkins School of Medicine',
    hospitalAffiliation: 'Johns Hopkins Hospital',
    clinicAddress: 'Baltimore, MD 21287',
    phone: '+1-410-555-0103',
    bio: 'Dermatologist and dermatopathologist with expertise in skin cancer diagnosis and treatment. Advocate for early detection and prevention.',
    avatar: 'https://images.unsplash.com/photo-1594824475317-29bb4b71e7e4?w=400&h=400&fit=crop&crop=face',
    medicalLicenseNumber: 'MD-54321-2009',
    licenseIssuingAuthority: 'Maryland State Board of Physicians',
    pincode: '21287'
  },
  {
    email: 'dr.james.thompson@medthread.com',
    username: 'dr_james_thompson',
    name: 'Dr. James Thompson',
    specialty: 'Neurology',
    subSpecialty: 'Epilepsy',
    yearsOfExperience: 20,
    graduationYear: 2004,
    medicalUniversity: 'Mayo Clinic Alix School of Medicine',
    hospitalAffiliation: 'Mayo Clinic',
    clinicAddress: 'Rochester, MN 55905',
    phone: '+1-507-555-0104',
    bio: 'Neurologist specializing in epilepsy treatment and research. Committed to improving quality of life for patients with neurological conditions.',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    medicalLicenseNumber: 'MN-98765-2004',
    licenseIssuingAuthority: 'Minnesota Board of Medical Practice',
    pincode: '55905'
  },
  {
    email: 'dr.lisa.patel@medthread.com',
    username: 'dr_lisa_patel',
    name: 'Dr. Lisa Patel',
    specialty: 'Orthopedics',
    subSpecialty: 'Sports Medicine',
    yearsOfExperience: 10,
    graduationYear: 2014,
    medicalUniversity: 'UCLA David Geffen School of Medicine',
    hospitalAffiliation: 'UCLA Medical Center',
    clinicAddress: 'Los Angeles, CA 90095',
    phone: '+1-310-555-0105',
    bio: 'Orthopedic surgeon specializing in sports medicine and arthroscopic procedures. Former team physician for professional athletes.',
    avatar: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop&crop=face',
    medicalLicenseNumber: 'CA-13579-2014',
    licenseIssuingAuthority: 'Medical Board of California',
    pincode: '90095'
  }
];

// Sample patient profiles for interactions
const patientProfiles = [
  {
    email: 'patient1@example.com',
    username: 'healthseeker_2024',
    name: 'Alex Johnson'
  },
  {
    email: 'patient2@example.com', 
    username: 'wellness_warrior',
    name: 'Maria Garcia'
  },
  {
    email: 'patient3@example.com',
    username: 'fitness_first',
    name: 'David Kim'
  }
];

async function seedDoctors() {
  console.log('🌱 Starting doctor profiles seeding...');
  
  try {
    // First, ensure required communities exist
    const communities = ['cardiology', 'pediatrics', 'dermatology', 'neurology', 'orthopedics'];
    
    for (const communityName of communities) {
      await prisma.community.upsert({
        where: { name: communityName },
        update: {},
        create: {
          name: communityName,
          displayName: communityName.charAt(0).toUpperCase() + communityName.slice(1),
          description: `Community for ${communityName} discussions and medical advice`,
          memberCount: 0
        }
      });
    }
    
    console.log('✅ Communities ensured');

    // Create patient users for interactions
    const createdPatients = [];
    for (const patient of patientProfiles) {
      const existingPatient = await prisma.user.findUnique({
        where: { email: patient.email }
      });
      
      if (!existingPatient) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const newPatient = await prisma.user.create({
          data: {
            email: patient.email,
            username: patient.username,
            passwordHash: hashedPassword,
            role: 'PATIENT',
            verified: true,
            bio: `[Seeded] Patient profile for testing analytics`,
            totalKarma: Math.floor(Math.random() * 100) + 10
          }
        });
        createdPatients.push(newPatient);
        console.log(`✅ Created patient: ${patient.username}`);
      } else {
        createdPatients.push(existingPatient);
      }
    }

    // Create doctor profiles
    const createdDoctors = [];
    for (const doctor of allDoctorProfiles) {
      // Check if doctor already exists
      const existingDoctor = await prisma.user.findUnique({
        where: { email: doctor.email }
      });
      
      if (existingDoctor) {
        console.log(`⚠️  Doctor ${doctor.username} already exists, skipping...`);
        createdDoctors.push(existingDoctor);
        continue;
      }
      
      // Create doctor user
      const hashedPassword = await bcrypt.hash('doctor123', 10);
      const licenseExpiry = new Date();
      licenseExpiry.setFullYear(licenseExpiry.getFullYear() + 2);
      
      const newDoctor = await prisma.user.create({
        data: {
          email: doctor.email,
          username: doctor.username,
          passwordHash: hashedPassword,
          role: 'DOCTOR',
          verified: true,
          doctorVerificationStatus: 'APPROVED',
          medicalLicenseNumber: doctor.medicalLicenseNumber,
          licenseIssuingAuthority: doctor.licenseIssuingAuthority,
          licenseExpiryDate: licenseExpiry,
          specialty: doctor.specialty,
          subSpecialty: doctor.subSpecialty,
          yearsOfExperience: doctor.yearsOfExperience,
          graduationYear: doctor.graduationYear,
          medicalUniversity: doctor.medicalUniversity,
          hospitalAffiliation: doctor.hospitalAffiliation,
          clinicAddress: doctor.clinicAddress,
          phone: doctor.phone,
          bio: `[Seeded] ${doctor.bio}`,
          avatar: doctor.avatar,
          verifiedAt: new Date(),
          verifiedBy: 'system_seed',
          totalKarma: Math.floor(Math.random() * 500) + 100,
          postKarma: Math.floor(Math.random() * 200) + 50,
          commentKarma: Math.floor(Math.random() * 300) + 50
        }
      });
      
      createdDoctors.push(newDoctor);
      console.log(`✅ Created doctor: ${doctor.username}`);
      
      // Join relevant community
      const community = await prisma.community.findUnique({
        where: { name: doctor.specialty.toLowerCase() }
      });
      
      if (community) {
        await prisma.communityMember.upsert({
          where: {
            userId_communityId: {
              userId: newDoctor.id,
              communityId: community.id
            }
          },
          update: {},
          create: {
            userId: newDoctor.id,
            communityId: community.id
          }
        });
        
        // Update community member count
        await prisma.community.update({
          where: { id: community.id },
          data: {
            memberCount: {
              increment: 1
            }
          }
        });
      }
    }
    
    console.log('✅ Doctors created and joined communities');

    // Create posts for each doctor in their specialty communities
    for (const doctor of createdDoctors) {
      const community = await prisma.community.findUnique({
        where: { name: doctor.specialty?.toLowerCase() }
      });
      
      if (community && postTemplates[doctor.specialty as keyof typeof postTemplates]) {
        const templates = postTemplates[doctor.specialty as keyof typeof postTemplates];
        
        for (let i = 0; i < templates.length; i++) {
          const template = templates[i];
          const post = await prisma.post.create({
            data: {
              title: `[Seeded] ${template.title}`,
              content: template.content,
              type: 'TEXT',
              authorId: doctor.id,
              communityId: community.id,
              upvotes: Math.floor(Math.random() * 50) + 10,
              score: Math.floor(Math.random() * 50) + 10,
              commentCount: Math.floor(Math.random() * 15) + 3
            }
          });
          
          // Create comments on posts from other doctors and patients
          const commenters = [...createdDoctors.filter(d => d.id !== doctor.id), ...createdPatients];
          const numComments = Math.floor(Math.random() * 5) + 2;
          
          for (let j = 0; j < numComments && j < commenters.length; j++) {
            const commenter = commenters[j];
            const comment = await prisma.comment.create({
              data: {
                content: `[Seeded] Great insights, Dr. ${doctor.username}! This information is very helpful for patients dealing with these conditions.`,
                authorId: commenter.id,
                postId: post.id,
                upvotes: Math.floor(Math.random() * 20) + 1,
                score: Math.floor(Math.random() * 20) + 1
              }
            });
            
            // Create conversion events for patient comments
            if (commenter.role === 'PATIENT') {
              const shouldConvert = Math.random() > 0.7; // 30% conversion rate
              await prisma.commentConversion.create({
                data: {
                  commentId: comment.id,
                  doctorId: doctor.id,
                  patientId: commenter.id,
                  postId: post.id,
                  profileVisited: true,
                  messageClicked: shouldConvert,
                  visitedAt: new Date(),
                  messageClickedAt: shouldConvert ? new Date() : null
                }
              });
            }
          }
        }
      }
    }
    
    console.log('✅ Posts and comments created');

    // Create appointments and conversations
    for (const doctor of createdDoctors) {
      const numAppointments = Math.floor(Math.random() * 8) + 3;
      
      for (let i = 0; i < numAppointments; i++) {
        const patient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
        const appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() - Math.floor(Math.random() * 30));
        
        const appointment = await prisma.appointment.create({
          data: {
            patientId: patient.id,
            doctorId: doctor.id,
            startTime: appointmentDate,
            endTime: new Date(appointmentDate.getTime() + 60 * 60 * 1000), // 1 hour later
            status: Math.random() > 0.2 ? 'COMPLETED' : 'CANCELLED',
            reason: `[Seeded] Consultation for ${doctor.specialty?.toLowerCase()} concerns`
          }
        });
        
        // Create conversation for completed appointments
        if (appointment.status === 'COMPLETED') {
          const conversation = await prisma.conversation.create({
            data: {
              appointmentId: appointment.id,
              participants: {
                connect: [{ id: doctor.id }, { id: patient.id }]
              }
            }
          });
          
          // Create messages in conversation
          const messages = [
            { senderId: patient.id, content: `[Seeded] Hello Dr. ${doctor.username}, I'm experiencing some symptoms and would like your advice.` },
            { senderId: doctor.id, content: `[Seeded] Hello! I'd be happy to help. Can you describe your symptoms in detail?` },
            { senderId: patient.id, content: `[Seeded] I've been having [symptoms] for the past few days. What do you recommend?` },
            { senderId: doctor.id, content: `[Seeded] Based on your description, I recommend [treatment plan]. Please follow up if symptoms persist.` }
          ];
          
          for (const msg of messages) {
            await prisma.message.create({
              data: {
                senderId: msg.senderId,
                receiverId: msg.senderId === doctor.id ? patient.id : doctor.id,
                content: msg.content,
                conversationId: conversation.id,
                isRead: true
              }
            });
          }
          
          // Create patient feedback
          const outcomes = ['CURED', 'NOT_YET', 'CONSULT_NEW_DOCTOR'];
          const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
          const wasClinicVisit = Math.random() > 0.6; // 40% clinic visits
          
          await prisma.patientFeedback.create({
            data: {
              patientId: patient.id,
              doctorId: doctor.id,
              conversationId: conversation.id,
              appointmentId: appointment.id,
              status: outcome,
              feedbackCount: 1,
              lastFeedbackAt: new Date(),
              curedAt: outcome === 'CURED' ? new Date() : null,
              wasClinicVisit: wasClinicVisit
            }
          });
        }
      }
    }
    
    console.log('✅ Appointments, conversations, and feedback created');

    // Update doctor performance metrics
    for (const doctor of createdDoctors) {
      const doctorStats = await prisma.$queryRaw`
        SELECT 
          COUNT(DISTINCT p.id) as total_posts,
          COUNT(DISTINCT c.id) as total_comments,
          COUNT(DISTINCT cc.id) as conversion_count,
          COUNT(CASE WHEN pf.status = 'CURED' THEN 1 END) as cured_count,
          COUNT(CASE WHEN pf.status = 'NOT_YET' THEN 1 END) as not_yet_count,
          COUNT(CASE WHEN pf.status = 'CONSULT_NEW_DOCTOR' THEN 1 END) as consult_new_count,
          COUNT(CASE WHEN pf."wasClinicVisit" = true THEN 1 END) as clinic_visit_count,
          COUNT(CASE WHEN pf."wasClinicVisit" = true AND pf.status = 'CURED' THEN 1 END) as post_clinic_cure_count
        FROM "User" u
        LEFT JOIN "Post" p ON p."authorId" = u.id
        LEFT JOIN "Comment" c ON c."authorId" = u.id  
        LEFT JOIN "CommentConversion" cc ON cc."doctorId" = u.id AND cc."messageClicked" = true
        LEFT JOIN "PatientFeedback" pf ON pf."doctorId" = u.id
        WHERE u.id = ${doctor.id}
      ` as any[];
      
      const stats = doctorStats[0];
      const curedCount = Number(stats.cured_count) || 0;
      const notYetCount = Number(stats.not_yet_count) || 0;
      const consultNewCount = Number(stats.consult_new_count) || 0;
      
      // Calculate portfolio score (positive for cured, negative for consult new doctor)
      const portfolioScore = (curedCount * 10) - (consultNewCount * 5) + (notYetCount * 2);
      
      await prisma.doctorPerformance.upsert({
        where: { doctorId: doctor.id },
        update: {
          totalPostsCommented: Number(stats.total_posts) || 0,
          totalCommentsCount: Number(stats.total_comments) || 0,
          conversionCount: Number(stats.conversion_count) || 0,
          curedPatientCount: curedCount,
          notYetCount: notYetCount,
          consultNewDoctorCount: consultNewCount,
          portfolioScore: portfolioScore,
          clinicVisitCount: Number(stats.clinic_visit_count) || 0,
          postClinicCureCount: Number(stats.post_clinic_cure_count) || 0,
          helpfulnessScore: Math.random() * 2 + 3, // 3-5 rating
          totalRatings: Math.floor(Math.random() * 50) + 10,
          appointmentsCompleted: Math.floor(Math.random() * 20) + 5,
          totalPatientsHelped: curedCount + notYetCount,
          avgResponseTime: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
          activeEngagementScore: Math.random() * 2 + 3,
          lastActiveAt: new Date()
        },
        create: {
          doctorId: doctor.id,
          totalPostsCommented: Number(stats.total_posts) || 0,
          totalCommentsCount: Number(stats.total_comments) || 0,
          conversionCount: Number(stats.conversion_count) || 0,
          curedPatientCount: curedCount,
          notYetCount: notYetCount,
          consultNewDoctorCount: consultNewCount,
          portfolioScore: portfolioScore,
          clinicVisitCount: Number(stats.clinic_visit_count) || 0,
          postClinicCureCount: Number(stats.post_clinic_cure_count) || 0,
          helpfulnessScore: Math.random() * 2 + 3,
          totalRatings: Math.floor(Math.random() * 50) + 10,
          appointmentsCompleted: Math.floor(Math.random() * 20) + 5,
          totalPatientsHelped: curedCount + notYetCount,
          avgResponseTime: Math.floor(Math.random() * 60) + 15,
          activeEngagementScore: Math.random() * 2 + 3,
          lastActiveAt: new Date()
        }
      });
    }
    
    console.log('✅ Doctor performance metrics updated');

    // Create community activity records
    for (const communityName of communities) {
      const community = await prisma.community.findUnique({
        where: { name: communityName }
      });
      
      if (community) {
        const postCount = await prisma.post.count({
          where: { communityId: community.id }
        });
        
        const commentCount = await prisma.comment.count({
          where: {
            post: {
              communityId: community.id
            }
          }
        });
        
        const memberCount = await prisma.communityMember.count({
          where: { communityId: community.id }
        });
        
        const avgPostsPerDay = postCount / 30; // Assuming 30 days of activity
        const avgCommentsPerPost = postCount > 0 ? commentCount / postCount : 0;
        
        let activityTier = 'INACTIVE';
        if (avgPostsPerDay > 2) activityTier = 'HIGHLY_ACTIVE';
        else if (avgPostsPerDay > 0.5) activityTier = 'MODERATELY_ACTIVE';
        
        await prisma.communityActivity.upsert({
          where: { communityId: community.id },
          update: {
            activityTier,
            totalPosts: postCount,
            totalComments: commentCount,
            totalMembers: memberCount,
            avgPostsPerDay,
            avgCommentsPerPost,
            lastActivityAt: new Date()
          },
          create: {
            communityId: community.id,
            activityTier,
            totalPosts: postCount,
            totalComments: commentCount,
            totalMembers: memberCount,
            avgPostsPerDay,
            avgCommentsPerPost,
            lastActivityAt: new Date()
          }
        });
      }
    }
    
    console.log('✅ Community activity records created');
    
    console.log('🎉 Doctor seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${createdDoctors.length} doctors created`);
    console.log(`   - ${createdPatients.length} patients created`);
    console.log(`   - ${communities.length} communities ensured`);
    console.log(`   - Posts, comments, appointments, and analytics data generated`);
    console.log(`   - All records marked with [Seeded] prefix for easy identification`);
    
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedDoctors()
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDoctors };