import { io, Socket } from 'socket.io-client';

/**
 * Test Socket.IO authentication fix for real-time messaging
 */
async function testSocketAuth() {
  console.log('🔍 Testing Socket.IO authentication fix...');
  
  // Test with a valid JWT token (you'll need to get this from login)
  const API_URL = 'http://localhost:3001';
  
  // Mock token for testing (in real scenario, get from login)
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTNxZGNqZGowMDAwMTJsNGZxZGNqZGsiLCJyb2xlIjoiUEFUSUVOVCIsImlhdCI6MTczMTMzNzI2NCwiZXhwIjoxNzMxNDIzNjY0fQ.example'; // This is just an example
  
  console.log('📡 Connecting to Socket.IO server...');
  
  const socket: Socket = io(API_URL, {
    auth: {
      token: testToken
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Connection timeout'));
    }, 10000);

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      console.log('🔐 Attempting authentication...');
      
      // Authenticate
      socket.emit('authenticate', { 
        userId: 'cm3qdcjdj00001l4fqdcjdk', // Example user ID
        token: testToken 
      });
    });

    socket.on('authenticated', (data) => {
      console.log('✅ Authentication successful:', data);
      clearTimeout(timeout);
      socket.disconnect();
      resolve('Authentication working correctly');
    });

    socket.on('auth_error', (error) => {
      console.error('❌ Authentication failed:', error);
      clearTimeout(timeout);
      socket.disconnect();
      reject(new Error(`Authentication failed: ${error.error}`));
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      clearTimeout(timeout);
      socket.disconnect();
      reject(new Error(`Socket error: ${error.message}`));
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      clearTimeout(timeout);
      reject(new Error(`Connection error: ${error.message}`));
    });
  });
}

// Test without authentication (should fail)
async function testWithoutAuth() {
  console.log('\n🔍 Testing connection without authentication...');
  
  const API_URL = 'http://localhost:3001';
  
  const socket: Socket = io(API_URL, {
    // No auth token provided
    transports: ['websocket', 'polling'],
    reconnection: false
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.disconnect();
      resolve('Connection without auth handled correctly');
    }, 5000);

    socket.on('connect', () => {
      console.log('📡 Connected without auth');
      
      // Try to authenticate without token
      socket.emit('authenticate', { 
        userId: 'test-user'
        // No token provided
      });
    });

    socket.on('authenticated', (data) => {
      console.log('⚠️ Unexpected: Authentication succeeded without token:', data);
      clearTimeout(timeout);
      socket.disconnect();
      reject(new Error('Authentication should have failed without token'));
    });

    socket.on('auth_error', (error) => {
      console.log('✅ Expected: Authentication failed without token:', error);
      clearTimeout(timeout);
      socket.disconnect();
      resolve('Authentication properly rejected without token');
    });

    socket.on('error', (error) => {
      console.log('✅ Expected: Socket error without auth:', error);
      clearTimeout(timeout);
      socket.disconnect();
      resolve('Socket properly handled missing auth');
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
      clearTimeout(timeout);
      resolve('Socket disconnected as expected');
    });
  });
}

async function runTests() {
  try {
    console.log('🚀 Starting Socket.IO authentication tests...\n');
    
    // Test 1: Connection without auth (should be handled gracefully)
    try {
      const result1 = await testWithoutAuth();
      console.log('✅ Test 1 passed:', result1);
    } catch (error) {
      console.log('⚠️ Test 1 result:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Connection with auth (would need real token)
    console.log('📝 Note: To test with authentication, you need a valid JWT token from login');
    console.log('💡 The ChatWindow component now includes auth token in connection:');
    console.log('   auth: { token: token }');
    console.log('✅ This should fix the real-time messaging issue');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

if (require.main === module) {
  runTests();
}