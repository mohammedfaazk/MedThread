import axios from 'axios';

async function testMyMemoryAPI() {
  console.log('Testing MyMemory Translation API (100% Free!)...\n');
  
  try {
    console.log('1. Testing English to Hindi...');
    const response1 = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: 'Hello, how are you?',
        langpair: 'en|hi'
      },
      timeout: 10000
    });

    console.log('✅ Success!');
    console.log('Original:', 'Hello, how are you?');
    console.log('Translated:', response1.data.responseData.translatedText);
    
    console.log('\n2. Testing English to Spanish...');
    const response2 = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: 'Good morning, doctor',
        langpair: 'en|es'
      },
      timeout: 10000
    });

    console.log('✅ Success!');
    console.log('Original:', 'Good morning, doctor');
    console.log('Translated:', response2.data.responseData.translatedText);

    console.log('\n3. Testing English to French...');
    const response3 = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: 'I have a headache',
        langpair: 'en|fr'
      },
      timeout: 10000
    });

    console.log('✅ Success!');
    console.log('Original:', 'I have a headache');
    console.log('Translated:', response3.data.responseData.translatedText);

    console.log('\n✅ MyMemory API is working perfectly!');
    console.log('🎉 NO API KEY REQUIRED!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testMyMemoryAPI();
