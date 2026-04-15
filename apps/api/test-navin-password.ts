import bcrypt from 'bcrypt';

const hash = '$2b$12$9AVhnJ8rMN9cjUVOlUueN./bU/IjElBgfs6BY4s6Dn8UJfRiBU4T2';

const passwords = [
  'navin123',
  'Navin@123',
  'password',
  'Password@123',
  'navin',
  'Navin123'
];

async function testPasswords() {
  console.log('Testing passwords against hash...\n');
  
  for (const pwd of passwords) {
    const match = await bcrypt.compare(pwd, hash);
    console.log(`${pwd}: ${match ? '✓ MATCH' : '✗'}`);
  }
}

testPasswords();
