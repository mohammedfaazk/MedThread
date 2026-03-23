import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Realistic comment templates by specialty and context
const commentTemplates = {
  cardiology: {
    patient: [
      "Thank you for this detailed explanation! I've been experiencing similar symptoms and this really helps me understand what to look for.",
      "My cardiologist mentioned something similar during my last visit. This post clarifies a lot of the medical terms he used.",
      "I've been dealing with heart palpitations for months. Should I be concerned if they happen during exercise?",
      "This is exactly what I needed to read. I have a family history of heart disease and want to be proactive about prevention.",
      "Great information! I'm sharing this with my elderly father who has been having some cardiac concerns lately.",
      "As someone who recently had a heart procedure, I can confirm this advice is spot on. Thank you for sharing your expertise.",
      "I wish more doctors explained things this clearly. This post has eased a lot of my anxiety about my upcoming cardiac tests.",
      "My symptoms match what you've described here. I think it's time I schedule an appointment with a cardiologist.",
      "This post came at the perfect time. I've been putting off seeing a doctor about my chest pain, but now I understand the importance.",
      "Excellent breakdown of the different types of heart conditions. This helps me ask better questions during my appointments."
    ],
    doctor: [
      "Excellent post! I'd also add that patients should monitor their blood pressure regularly, especially if they have a family history.",
      "Great explanation of the pathophysiology. In my practice, I often see patients who benefit from early intervention strategies.",
      "This aligns perfectly with the latest cardiology guidelines. I particularly appreciate how you've made it accessible to patients.",
      "I've found that patient education like this significantly improves compliance with treatment protocols in my clinic.",
      "Well articulated! I often refer my patients to resources like this to help them understand their conditions better.",
      "From a clinical perspective, this is exactly the kind of information that empowers patients to take control of their heart health.",
      "I'd like to add that lifestyle modifications can be just as important as medications in many cardiac conditions.",
      "This post does an excellent job of explaining when patients should seek immediate medical attention versus routine care.",
      "In my 15 years of practice, I've seen how proper patient education leads to better outcomes. This is a great example.",
      "The emphasis on prevention is crucial. I always tell my patients that the best treatment is preventing the problem in the first place."
    ]
  },
  pediatrics: {
    patient: [
      "As a new parent, this information is invaluable. I'm always worried about whether my baby's symptoms are normal or concerning.",
      "Thank you for explaining this so clearly! My 3-year-old has been showing these symptoms and I wasn't sure when to call the doctor.",
      "This post has been so helpful. I've been anxious about my child's development milestones and this puts things in perspective.",
      "I wish I had read this earlier! My daughter went through something similar and I was so stressed about it.",
      "Great advice for parents. It's reassuring to know what's normal and what requires medical attention.",
      "My pediatrician mentioned this during our last visit, but your explanation makes it much clearer. Thank you!",
      "As a first-time mom, I appreciate doctors who take the time to educate parents like this. It reduces so much anxiety.",
      "This is exactly what I needed to know before my child's upcoming appointment. Now I know what questions to ask.",
      "I'm sharing this with my mom's group. So many of us have been wondering about these same issues with our kids.",
      "Your explanation about childhood development stages is so helpful. Every parent should read this!"
    ],
    doctor: [
      "Excellent resource for parents! I often share similar information with families in my practice to help them understand normal development.",
      "This is a great example of evidence-based pediatric care explained in parent-friendly terms. Well done!",
      "I appreciate how you've addressed common parental concerns while emphasizing when professional evaluation is needed.",
      "In my pediatric practice, I find that educated parents are better partners in their child's healthcare journey.",
      "This aligns well with current AAP guidelines. I particularly like how you've made complex medical concepts accessible.",
      "Great post! I'd add that parents should trust their instincts - they know their children best and shouldn't hesitate to seek care when concerned.",
      "The emphasis on developmental milestones is crucial. Early intervention can make such a difference in outcomes.",
      "I often tell parents that no question is too small when it comes to their child's health. This post reinforces that message.",
      "Excellent work making pediatric medicine understandable for families. This kind of education improves health outcomes.",
      "As a pediatrician, I see how much anxiety parents have. Posts like this help normalize common childhood experiences."
    ]
  },
  dermatology: {
    patient: [
      "I've been struggling with similar skin issues for years. This gives me hope that there are effective treatments available.",
      "Thank you for explaining the difference between various skin conditions. I've been misdiagnosed before and this helps me advocate for myself.",
      "This is so informative! I had no idea that sun protection was this important for preventing long-term skin damage.",
      "My dermatologist recommended a similar treatment plan. It's reassuring to see another expert confirm this approach.",
      "I've been dealing with acne well into my 30s and felt embarrassed about it. This post makes me feel less alone.",
      "Great explanation of when to see a dermatologist versus trying over-the-counter treatments first.",
      "This post convinced me to finally schedule that skin cancer screening I've been putting off. Thank you for the motivation!",
      "I wish I had known this information years ago. It would have saved me from a lot of trial and error with skincare products.",
      "As someone with sensitive skin, I appreciate the gentle approach you've outlined here. Not all treatments work for everyone.",
      "This is exactly the kind of clear, practical advice I was looking for. My skin concerns don't seem so overwhelming now."
    ],
    doctor: [
      "Excellent overview of current dermatological best practices! I particularly appreciate the emphasis on patient education.",
      "This aligns perfectly with what we're seeing in clinical research. The importance of early detection cannot be overstated.",
      "Great post! I'd add that patients should always patch test new products, especially those with sensitive skin or known allergies.",
      "In my dermatology practice, I find that patients who understand their skin type have much better treatment outcomes.",
      "Well explained! The connection between lifestyle factors and skin health is something I discuss with patients daily.",
      "This is a comprehensive approach that considers both medical treatment and patient quality of life. Excellent work!",
      "I appreciate how you've addressed both the medical and cosmetic aspects of dermatological care. Both are important to patients.",
      "The emphasis on sun protection is crucial. I see too many patients who wish they had started protecting their skin earlier.",
      "Great resource! I often recommend similar approaches to my patients, and it's helpful to have well-written explanations like this.",
      "This post does an excellent job of explaining when self-care is appropriate versus when professional treatment is necessary."
    ]
  },
  neurology: {
    patient: [
      "Thank you for explaining this neurological condition in terms I can understand. Medical terminology can be so overwhelming.",
      "I've been experiencing similar symptoms and wasn't sure if they were serious. This helps me know when to seek medical attention.",
      "My neurologist mentioned this during my appointment, but your explanation makes it much clearer. I feel more informed now.",
      "This post has reduced my anxiety about my upcoming neurological tests. Knowing what to expect makes such a difference.",
      "I'm dealing with chronic headaches and this gives me new insights into potential causes and treatments I hadn't considered.",
      "As someone living with a neurological condition, I appreciate doctors who take the time to educate patients like this.",
      "This information is so valuable for patients and families dealing with neurological issues. Thank you for sharing your expertise.",
      "I've been struggling to explain my symptoms to family members. This post helps me articulate what I'm experiencing.",
      "The section on lifestyle modifications is particularly helpful. It's good to know there are things I can do to help myself.",
      "This gives me hope that there are new treatment options available. I'm going to discuss this with my neurologist."
    ],
    doctor: [
      "Excellent explanation of complex neurological concepts! This kind of patient education is crucial for treatment compliance.",
      "I appreciate how you've balanced the medical complexity with accessibility for patients and families.",
      "This aligns well with current neurological practice guidelines. The emphasis on early intervention is particularly important.",
      "In my neurology practice, I find that informed patients are better able to participate in their treatment decisions.",
      "Great post! The connection between neurological health and overall wellness is something I discuss with patients regularly.",
      "Well articulated approach to a complex topic. I often refer patients to educational resources like this.",
      "The emphasis on multidisciplinary care is spot on. Neurological conditions often benefit from a team approach.",
      "Excellent work making neurology accessible to non-medical audiences while maintaining clinical accuracy.",
      "I particularly appreciate how you've addressed both acute and chronic neurological conditions in a balanced way.",
      "This kind of educational content helps reduce the stigma often associated with neurological conditions. Well done!"
    ]
  },
  orthopedics: {
    patient: [
      "As an athlete, this information about injury prevention is incredibly valuable. I wish I had known this earlier in my career.",
      "Thank you for explaining the recovery process so clearly. I'm currently rehabbing from a similar injury and this gives me realistic expectations.",
      "This post has convinced me to finally address my chronic joint pain instead of just pushing through it.",
      "Great explanation of when surgery is necessary versus when conservative treatment might work. This helps me make informed decisions.",
      "I've been dealing with back pain for months and wasn't sure if I needed to see a specialist. This helps me understand my options.",
      "The section on physical therapy is so helpful. I didn't realize how important it was for long-term recovery.",
      "This gives me confidence that my orthopedic surgeon's treatment plan is the right approach for my condition.",
      "I appreciate the emphasis on prevention. As I get older, I want to stay active and avoid injuries.",
      "This post addresses many of the concerns I had about my upcoming orthopedic procedure. Thank you for the detailed explanation.",
      "The lifestyle modifications you've outlined are practical and achievable. I'm motivated to make these changes."
    ],
    doctor: [
      "Excellent overview of current orthopedic best practices! The emphasis on conservative treatment first is particularly important.",
      "Great post! I'd add that patient compliance with physical therapy protocols is crucial for optimal outcomes.",
      "This aligns well with evidence-based orthopedic care. The multidisciplinary approach you've outlined is key to success.",
      "In my orthopedic practice, I find that educated patients have better surgical outcomes and faster recovery times.",
      "Well explained approach to musculoskeletal health! The prevention strategies you've outlined can save patients years of problems.",
      "I appreciate how you've addressed both acute injuries and chronic conditions. Both require different but equally important approaches.",
      "The emphasis on functional outcomes rather than just pain relief is crucial in modern orthopedic care.",
      "Excellent work explaining when imaging is necessary versus when clinical examination is sufficient for diagnosis.",
      "This post does a great job of setting realistic expectations for recovery timelines. Patients need to understand this.",
      "Great resource! I often discuss similar concepts with my patients, and having well-written explanations like this is invaluable."
    ]
  }
};

// Additional general medical comments
const generalComments = {
  patient: [
    "This is exactly the kind of clear medical information I was looking for. Thank you for taking the time to explain this thoroughly.",
    "I really appreciate doctors who make complex medical topics accessible to patients. This helps me be a better advocate for my health.",
    "Your expertise really shows in how you've explained this condition. I feel much more informed about my treatment options now.",
    "This post has answered questions I didn't even know I had. It's so helpful to understand the 'why' behind medical recommendations.",
    "I'm grateful for healthcare professionals who share their knowledge like this. It makes such a difference in patient understanding.",
    "The way you've broken down this medical topic makes it so much easier to understand. Thank you for your clear communication.",
    "This gives me the confidence to have more informed discussions with my healthcare team about my condition.",
    "I've been researching this topic for weeks and this is by far the most helpful and understandable explanation I've found.",
    "Your post has helped me understand my diagnosis better. I feel less anxious now that I know what to expect.",
    "This is the kind of patient education that leads to better health outcomes. Thank you for sharing your medical expertise."
  ],
  doctor: [
    "Excellent clinical insight! This kind of evidence-based information is exactly what our patients need to make informed decisions.",
    "Well articulated medical explanation! I often share similar information with my patients and colleagues.",
    "This aligns perfectly with current clinical guidelines and best practices. Great work making it accessible to patients.",
    "In my clinical experience, this approach has consistently led to better patient outcomes and satisfaction.",
    "Excellent post! The way you've explained the pathophysiology while keeping it patient-friendly is commendable.",
    "This is a great example of how medical professionals can contribute to public health education. Well done!",
    "I appreciate how you've balanced clinical accuracy with patient accessibility. This is exactly what healthcare communication should be.",
    "Great resource for both patients and healthcare providers! I'll be sharing this with my colleagues and patients.",
    "The evidence-based approach you've taken here is exactly what modern medicine should be about. Excellent work!",
    "This kind of educational content helps bridge the gap between medical professionals and patients. Very well done!"
  ]
};
async function updateSeededComments() {
  console.log('💬 Starting comment content update...');
  
  try {
    // Get all seeded comments
    const seededComments = await prisma.comment.findMany({
      where: {
        content: {
          startsWith: '[Seeded]'
        }
      },
      include: {
        author: true,
        post: {
          include: {
            author: true,
            community: true
          }
        }
      }
    });

    console.log(`Found ${seededComments.length} seeded comments to update`);

    for (const comment of seededComments) {
      const authorRole = comment.author.role;
      const postAuthorSpecialty = comment.post.author.specialty?.toLowerCase();
      const communityName = comment.post.community?.name?.toLowerCase();
      
      // Determine comment type based on author role and context
      let commentPool: string[] = [];
      
      if (authorRole === 'PATIENT') {
        // Patient commenting on doctor's post
        if (postAuthorSpecialty && commentTemplates[postAuthorSpecialty as keyof typeof commentTemplates]) {
          commentPool = commentTemplates[postAuthorSpecialty as keyof typeof commentTemplates].patient;
        } else if (communityName && commentTemplates[communityName as keyof typeof commentTemplates]) {
          commentPool = commentTemplates[communityName as keyof typeof commentTemplates].patient;
        } else {
          commentPool = generalComments.patient;
        }
      } else if (authorRole === 'DOCTOR' || authorRole === 'VERIFIED_DOCTOR') {
        // Doctor commenting on another doctor's post
        if (postAuthorSpecialty && commentTemplates[postAuthorSpecialty as keyof typeof commentTemplates]) {
          commentPool = commentTemplates[postAuthorSpecialty as keyof typeof commentTemplates].doctor;
        } else if (communityName && commentTemplates[communityName as keyof typeof commentTemplates]) {
          commentPool = commentTemplates[communityName as keyof typeof commentTemplates].doctor;
        } else {
          commentPool = generalComments.doctor;
        }
      } else {
        // Default to general patient comments for other roles
        commentPool = generalComments.patient;
      }

      // Select a random comment from the appropriate pool
      const randomComment = commentPool[Math.floor(Math.random() * commentPool.length)];
      
      // Update the comment with realistic content
      await prisma.comment.update({
        where: { id: comment.id },
        data: {
          content: randomComment
        }
      });

      console.log(`✅ Updated comment by ${comment.author.username} in ${communityName || 'general'}`);
    }

    // Also update seeded posts to remove [Seeded] prefix
    const seededPosts = await prisma.post.findMany({
      where: {
        title: {
          startsWith: '[Seeded]'
        }
      }
    });

    console.log(`Found ${seededPosts.length} seeded posts to update`);

    for (const post of seededPosts) {
      // Remove [Seeded] prefix from title
      const newTitle = post.title.replace('[Seeded] ', '');
      
      await prisma.post.update({
        where: { id: post.id },
        data: {
          title: newTitle
        }
      });

      console.log(`✅ Updated post title: "${newTitle}"`);
    }

    // Update seeded user bios to remove [Seeded] prefix
    const seededUsers = await prisma.user.findMany({
      where: {
        bio: {
          startsWith: '[Seeded]'
        }
      }
    });

    console.log(`Found ${seededUsers.length} seeded users to update`);

    for (const user of seededUsers) {
      // Remove [Seeded] prefix from bio but keep a subtle marker for identification
      const newBio = user.bio?.replace('[Seeded] ', '') + ' 🌱';
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          bio: newBio
        }
      });

      console.log(`✅ Updated bio for ${user.username}`);
    }

    // Update seeded patient feedback records
    const seededFeedback = await prisma.patientFeedback.findMany({
      where: {
        id: {
          startsWith: 'seeded_feedback_'
        }
      }
    });

    console.log(`Found ${seededFeedback.length} seeded feedback records to update`);

    // Update seeded doctor ratings
    const seededRatings = await prisma.doctorRating.findMany({
      where: {
        feedback: {
          startsWith: '[Seeded]'
        }
      }
    });

    console.log(`Found ${seededRatings.length} seeded ratings to update`);

    const ratingFeedbacks = [
      "Dr. was very thorough and explained everything clearly. I felt heard and understood throughout my appointment.",
      "Excellent bedside manner and medical expertise. The treatment plan was effective and well-explained.",
      "Professional, knowledgeable, and caring. I would definitely recommend this doctor to others.",
      "Great communication skills and took time to answer all my questions. Very satisfied with the care received.",
      "The doctor was punctual, prepared, and provided excellent medical care. Very positive experience overall.",
      "Knowledgeable physician who made me feel comfortable discussing my health concerns. Highly recommend.",
      "Thorough examination and clear explanation of my condition. The treatment has been very effective.",
      "Professional and compassionate care. The doctor took time to understand my concerns and address them properly.",
      "Excellent diagnostic skills and treatment approach. I felt confident in the care I received.",
      "Great doctor who combines medical expertise with genuine care for patients. Very satisfied with the outcome.",
      "The appointment was efficient and informative. The doctor provided clear guidance on my treatment options.",
      "Compassionate and skilled physician. The treatment plan was tailored to my specific needs and lifestyle.",
      "Professional service with excellent follow-up care. I felt well-supported throughout my treatment.",
      "The doctor was patient, thorough, and explained complex medical information in understandable terms.",
      "Outstanding medical care with a personal touch. I felt like more than just another patient."
    ];

    for (const rating of seededRatings) {
      const randomFeedback = ratingFeedbacks[Math.floor(Math.random() * ratingFeedbacks.length)];
      
      await prisma.doctorRating.update({
        where: { id: rating.id },
        data: {
          feedback: randomFeedback
        }
      });
    }

    console.log('✅ Content update completed successfully!');
    console.log('');
    console.log('📊 Summary of updates:');
    console.log(`   • ${seededComments.length} comments updated with realistic content`);
    console.log(`   • ${seededPosts.length} post titles cleaned (removed [Seeded] prefix)`);
    console.log(`   • ${seededUsers.length} user bios updated (subtle 🌱 marker added)`);
    console.log(`   • ${seededRatings.length} doctor ratings updated with realistic feedback`);
    console.log('');
    console.log('🎯 All content now appears natural and realistic');
    console.log('🔍 Seeded data still identifiable by 🌱 marker in user bios');
    
  } catch (error) {
    console.error('❌ Error updating comment content:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update function
if (require.main === module) {
  updateSeededComments()
    .catch((error) => {
      console.error('❌ Comment update failed:', error);
      process.exit(1);
    });
}

export { updateSeededComments };