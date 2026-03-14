#!/usr/bin/env node

/**
 * Test script to verify Groq API integration for diet planner
 */

require('dotenv').config();
const Groq = require('groq-sdk').default;

async function testGroqAPI() {
  console.log('🤖 Testing Groq API Integration...\n');

  // Check if API key is set
  if (!process.env.GROQ_API_KEY) {
    console.log('❌ GROQ_API_KEY not found in environment variables');
    console.log('📝 Please add your Groq API key to the .env file:');
    console.log('   GROQ_API_KEY="gsk_your_actual_key_here"');
    console.log('\n🔗 Get your key from: https://console.groq.com/keys');
    return;
  }

  if (process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    console.log('❌ Please replace the placeholder with your actual Groq API key');
    console.log('📝 Update .env file:');
    console.log('   GROQ_API_KEY="gsk_your_actual_key_here"');
    console.log('\n🔗 Get your key from: https://console.groq.com/keys');
    return;
  }

  try {
    console.log('🔑 API Key found, testing connection...');
    
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // Test with a simple diet generation request
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a nutritionist AI. Generate a simple meal suggestion."
        },
        {
          role: "user",
          content: "Suggest a healthy breakfast for a vegetarian with 300 calories. Respond with just the meal name and calories."
        }
      ],
      model: "llama-3.1-70b-versatile",
      temperature: 0.7,
      max_tokens: 100
    });

    const response = completion.choices[0]?.message?.content;
    
    if (response) {
      console.log('✅ SUCCESS: Groq API is working!');
      console.log('🍳 Sample AI Response:', response.trim());
      console.log('\n🎉 Your AI Diet Planner is ready to use!');
      console.log('\nNext steps:');
      console.log('1. Start the API server: npm run dev (in apps/api)');
      console.log('2. Start the web server: npm run dev (in apps/web)');
      console.log('3. Navigate to patient dashboard → Diet Planner');
    } else {
      console.log('❌ No response from Groq API');
    }

  } catch (error) {
    console.log('❌ FAILED: Groq API test failed');
    
    if (error.status === 401) {
      console.log('🔑 Error: Invalid API key');
      console.log('   Please check your GROQ_API_KEY in .env file');
    } else if (error.status === 429) {
      console.log('⏰ Error: Rate limit exceeded');
      console.log('   Please wait a moment and try again');
    } else {
      console.log('📝 Error details:', error.message);
    }
    
    console.log('\n🔗 Get a valid key from: https://console.groq.com/keys');
  }
}

// Run the test
testGroqAPI();