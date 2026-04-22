/**
 * Add Pending Doctors for Admin Verification
 * Creates 2 unverified doctors that will appear in admin dashboard
 */

import { prisma } from '@medthread/database';
import bcrypt from 'bcryptjs';

async function addPendingDoctors() {
  console.log('👨‍⚕️ Adding Pending Doctors for Verification\n');

  try {
    // Doctor 1: Dr. Sarah Johnson - Cardiologist
    console.log('1️⃣ Creating Dr. Sarah Johnson (Cardiologist)...');
    
    const hashedPassword1 = await bcrypt.hash('doctor123', 10);
    
    const doctor1 = await prisma.user.create({
      data: {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@medthread.com',
        username: 'dr_sarah_johnson',
        password: hashedPassword1,
        passwordHash: hashedPassword1,
        role: 'DOCTOR',
        verified: false, // UNVERIFIED - will appear in pending
        verificationStatus: 'PENDING',
        bio: 'Board-certified Cardiologist with 12 years of experience in interventional cardiology and heart disease prevention.',
        profilePicture: 'https://i.pravatar.cc/300?img=47',
        location: 'Mumbai, Maharashtra',
        createdAt: new Date(),
        doctorProfile: {
          create: {
            specialization: 'Cardiology',
            qualifications: ['MBBS', 'MD (Cardiology)', 'DM (Interventional Cardiology)'],
            experience: 12,
            licenseNumber: 'MCI-2012-45678',
            consultationFee: 1500,
            about: 'Specialized in treating complex heart conditions, performing angioplasty, and preventive cardiology. Published researcher with 20+ papers in international journals.',
            languages: ['English', 'Hindi', 'Marathi'],
            awards: [
              'Best Cardiologist Award 2022 - Indian Medical Association',
              'Excellence in Patient Care 2021'
            ],
            education: [
              {
                degree: 'MBBS',
                institution: 'Grant Medical College, Mumbai',
                year: 2010
              },
              {
                degree: 'MD (Cardiology)',
                institution: 'All India Institute of Medical Sciences, Delhi',
                year: 2014
              },
              {
                degree: 'DM (Interventional Cardiology)',
                institution: 'PGI Chandigarh',
                year: 2017
              }
            ],
            hospitalAffiliations: [
              'Lilavati Hospital, Mumbai',
              'Breach Candy Hospital, Mumbai'
            ],
            verificationDocuments: {
              medicalLicense: 'https://example.com/docs/sarah-license.pdf',
              degreesCertificates: [
                'https://example.com/docs/sarah-mbbs.pdf',
                'https://example.com/docs/sarah-md.pdf',
                'https://example.com/docs/sarah-dm.pdf'
              ],
              governmentId: 'https://example.com/docs/sarah-aadhar.pdf'
            },
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            availability: {
              monday: { available: true, slots: ['09:00-13:00', '15:00-18:00'] },
              tuesday: { available: true, slots: ['09:00-13:00', '15:00-18:00'] },
              wednesday: { available: true, slots: ['09:00-13:00'] },
              thursday: { available: true, slots: ['09:00-13:00', '15:00-18:00'] },
              friday: { available: true, slots: ['09:00-13:00', '15:00-18:00'] },
              saturday: { available: true, slots: ['10:00-14:00'] },
              sunday: { available: false, slots: [] }
            }
          }
        }
      },
      include: {
        doctorProfile: true
      }
    });

    console.log('✅ Dr. Sarah Johnson created');
    console.log(`   Email: ${doctor1.email}`);
    console.log(`   Password: doctor123`);
    console.log(`   Status: ${doctor1.verificationStatus}`);
    console.log(`   License: ${doctor1.doctorProfile?.licenseNumber}`);

    // Doctor 2: Dr. Rajesh Kumar - Orthopedic Surgeon
    console.log('\n2️⃣ Creating Dr. Rajesh Kumar (Orthopedic Surgeon)...');
    
    const hashedPassword2 = await bcrypt.hash('doctor123', 10);
    
    const doctor2 = await prisma.user.create({
      data: {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@medthread.com',
        username: 'dr_rajesh_kumar',
        password: hashedPassword2,
        passwordHash: hashedPassword2,
        role: 'DOCTOR',
        verified: false, // UNVERIFIED - will appear in pending
        verificationStatus: 'PENDING',
        bio: 'Experienced Orthopedic Surgeon specializing in joint replacement, sports injuries, and arthroscopic surgery.',
        profilePicture: 'https://i.pravatar.cc/300?img=12',
        location: 'Bangalore, Karnataka',
        createdAt: new Date(),
        doctorProfile: {
          create: {
            specialization: 'Orthopedics',
            qualifications: ['MBBS', 'MS (Orthopedics)', 'Fellowship in Joint Replacement'],
            experience: 15,
            licenseNumber: 'MCI-2009-34567',
            consultationFee: 1200,
            about: 'Expert in minimally invasive orthopedic procedures, joint replacement surgery, and sports medicine. Performed over 2000 successful surgeries.',
            languages: ['English', 'Hindi', 'Kannada', 'Tamil'],
            awards: [
              'Outstanding Orthopedic Surgeon 2023 - Karnataka Medical Council',
              'Best Doctor Award 2020 - Bangalore Medical Association'
            ],
            education: [
              {
                degree: 'MBBS',
                institution: 'Bangalore Medical College',
                year: 2007
              },
              {
                degree: 'MS (Orthopedics)',
                institution: 'St. Johns Medical College, Bangalore',
                year: 2011
              },
              {
                degree: 'Fellowship in Joint Replacement',
                institution: 'Singapore General Hospital',
                year: 2013
              }
            ],
            hospitalAffiliations: [
              'Manipal Hospital, Bangalore',
              'Apollo Hospital, Bangalore',
              'Columbia Asia Hospital, Bangalore'
            ],
            verificationDocuments: {
              medicalLicense: 'https://example.com/docs/rajesh-license.pdf',
              degreesCertificates: [
                'https://example.com/docs/rajesh-mbbs.pdf',
                'https://example.com/docs/rajesh-ms.pdf',
                'https://example.com/docs/rajesh-fellowship.pdf'
              ],
              governmentId: 'https://example.com/docs/rajesh-aadhar.pdf'
            },
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            availability: {
              monday: { available: true, slots: ['10:00-14:00', '16:00-19:00'] },
              tuesday: { available: true, slots: ['10:00-14:00', '16:00-19:00'] },
              wednesday: { available: true, slots: ['10:00-14:00', '16:00-19:00'] },
              thursday: { available: true, slots: ['10:00-14:00'] },
              friday: { available: true, slots: ['10:00-14:00', '16:00-19:00'] },
              saturday: { available: true, slots: ['10:00-13:00'] },
              sunday: { available: false, slots: [] }
            }
          }
        }
      },
      include: {
        doctorProfile: true
      }
    });

    console.log('✅ Dr. Rajesh Kumar created');
    console.log(`   Email: ${doctor2.email}`);
    console.log(`   Password: doctor123`);
    console.log(`   Status: ${doctor2.verificationStatus}`);
    console.log(`   License: ${doctor2.doctorProfile?.licenseNumber}`);

    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log('✅ 2 pending doctors added successfully!');
    console.log('');
    console.log('These doctors will appear in the Admin Dashboard under:');
    console.log('   Admin → Doctor Verification → Pending Approvals');
    console.log('');
    console.log('Doctor Details:');
    console.log('');
    console.log('1. Dr. Sarah Johnson');
    console.log('   - Email: sarah.johnson@medthread.com');
    console.log('   - Password: doctor123');
    console.log('   - Specialty: Cardiology');
    console.log('   - Experience: 12 years');
    console.log('   - License: MCI-2012-45678');
    console.log('   - Submitted: 2 days ago');
    console.log('');
    console.log('2. Dr. Rajesh Kumar');
    console.log('   - Email: rajesh.kumar@medthread.com');
    console.log('   - Password: doctor123');
    console.log('   - Specialty: Orthopedics');
    console.log('   - Experience: 15 years');
    console.log('   - License: MCI-2009-34567');
    console.log('   - Submitted: 5 days ago');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('1. Login as admin (admin@medthread.com / admin123)');
    console.log('2. Go to Admin Dashboard');
    console.log('3. Navigate to Doctor Verification section');
    console.log('4. You should see 2 pending doctors');
    console.log('5. Review their credentials and approve/reject');
    console.log('');
    console.log('📝 NOTE: These doctors cannot login or access the platform');
    console.log('   until they are verified by admin.');

  } catch (error: any) {
    console.error('❌ Error adding pending doctors:', error);
    
    if (error.code === 'P2002') {
      console.error('\n⚠️  Doctors with these emails already exist!');
      console.error('   Delete them first or use different emails.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

addPendingDoctors();
