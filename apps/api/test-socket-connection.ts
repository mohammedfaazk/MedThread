import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001';

console.log('🔍 Testing Socket.IO connection with authentication...');

// Create a test JWT token (in real app, this comes from login)
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwicm9sZSI6IlBBVElFTlQiLCJpYXQiOjE2MzAwMDAwMDB9.test';

const socket = io(API_URL, {
  auth: {
    token: testToken
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
  
  // Test authentication
  socket.emit('authenticate', { 
    userId: 'test-user-123',
    token: testToken
  });
});

socket.on('authenticated', (data) => {
  console.log('✅ Socket authenticated:', data);
  
  // Test joining a conversation
  socket.emit('join_conversation', { 
    conversationId: 'test-conversation-123'
  });
});

socket.on('conversation_joined', (data) => {
  console.log('✅ Joined conversation:', data);
});

socket.on('access_denied', (data) => {
  console.log('❌ Access denied:', data);
});

socket.on('receive_message', (message) => {
  console.log('📨 Received message:', message);
});

socket.on('disconnect', () => {
  console.log('❌ Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Keep the script running
setTimeout(() => {
  console.log('🔍 Test completed');
  socket.disconnect();
  process.exit(0);
}, 5000);