import { urgentMessageService } from './src/services/urgent-message.service';

console.log('\n🧪 TESTING URGENT MESSAGE DETECTION');
console.log('═'.repeat(80));

const testMessages = [
  'chest pain',
  'bleeding heavily',
  'emergency help needed',
  'I have a headache',
  'feeling better today',
  'severe pain in my leg',
  'difficulty breathing',
  'just checking in'
];

testMessages.forEach(message => {
  const result = urgentMessageService.detectUrgency(message);
  console.log(`\nMessage: "${message}"`);
  console.log(`  Is Urgent: ${result.isUrgent}`);
  console.log(`  Level: ${result.urgencyLevel || 'none'}`);
  console.log(`  Reason: ${result.reason || 'N/A'}`);
});

console.log('\n═'.repeat(80));
