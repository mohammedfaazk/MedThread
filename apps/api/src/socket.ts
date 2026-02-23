import { Server } from 'socket.io';

/**
 * Global Socket.io server instance
 * This is initialized in index.ts and can be imported by services
 */
let io: Server | null = null;

export const setSocketInstance = (instance: Server) => {
  io = instance;
};

export const getSocketInstance = (): Server => {
  if (!io) {
    throw new Error('Socket.io instance not initialized. Call setSocketInstance first.');
  }
  return io;
};
