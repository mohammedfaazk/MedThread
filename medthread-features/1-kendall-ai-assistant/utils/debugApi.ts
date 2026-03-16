// Debug utility to test Gemini API integration

export const debugGeminiAPI = async () => {
  console.log('=== Gemini API Debug ===');
  
  // Check environment variable
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  console.log('API Key length:', apiKey?.length || 0);
  
  // Check online status
  console.log('Navigator online:', navigator.onLine);
  
  if (!apiKey) {
    console.error('❌ VITE_GEMINI_API_KEY not found in environment variables');
    return false;
  }
  
  // First, let's list available models
  try {
    console.log('🔍 Listing available models...');
    const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      console.log('📋 Available models:', modelsData.models?.map(m => m.name) || []);
    } else {
      console.warn('⚠️ Could not list models:', modelsResponse.status);
    }
  } catch (error) {
    console.warn('⚠️ Error listing models:', error);
  }
  
  // Test API endpoint with a working model
  const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const testPayload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Hello, can you respond with just "API working"?' }]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 50
    }
  };
  
  try {
    console.log('🔄 Testing API call...');
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      
      // Try alternative models if the first one fails
      const alternativeModels = [
        'gemini-flash-latest',
        'gemini-pro-latest',
        'gemini-2.0-flash',
        'gemini-2.5-pro'
      ];
      
      for (const model of alternativeModels) {
        console.log(`🔄 Trying alternative model: ${model}`);
        const altUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        try {
          const altResponse = await fetch(altUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
          });
          
          if (altResponse.ok) {
            const altData = await altResponse.json();
            console.log(`✅ Alternative model ${model} works!`, altData);
            return true;
          }
        } catch (altError) {
          console.log(`❌ Model ${model} failed:`, altError);
        }
      }
      
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('✅ Extracted text:', responseText);
    
    return true;
    
  } catch (error) {
    console.error('❌ Network/Fetch Error:', error);
    return false;
  }
};

// Test function to be called from browser console
(window as any).debugGeminiAPI = debugGeminiAPI;