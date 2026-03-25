import axios from 'axios';

async function testTranslation() {
  try {
    console.log('Testing translation API...');
    
    const response = await axios.post('http://localhost:3001/api/v1/technical/translate', {
      text: 'Hello, how are you?',
      targetLang: 'hi',
      sourceLang: 'en'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });

    console.log('Success:', response.data);
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testTranslation();
