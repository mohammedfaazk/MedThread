import axios from 'axios';

async function testLibreTranslateDirect() {
  console.log('Testing LibreTranslate API directly...\n');
  
  try {
    // Test 1: Check if API is accessible
    console.log('1. Testing API accessibility...');
    const response = await axios.post('https://libretranslate.com/translate', {
      q: 'Hello, how are you?',
      source: 'en',
      target: 'hi',
      format: 'text'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ API is accessible!');
    console.log('Response:', response.data);
    console.log('\nTranslated text:', response.data.translatedText);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }

  // Test 2: Language detection
  try {
    console.log('\n2. Testing language detection...');
    const detectResponse = await axios.post('https://libretranslate.com/detect', {
      q: 'Hello world'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Detection works!');
    console.log('Detected:', detectResponse.data);
  } catch (error: any) {
    console.error('❌ Detection error:', error.message);
  }
}

testLibreTranslateDirect();
