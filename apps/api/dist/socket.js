"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketInstance = exports.setSocketInstance = void 0;
/**
 * Global Socket.io server instance
 * This is initialized in index.ts and can be imported by services
 */
let io = null;
const setSocketInstance = (instance) => {
    io = instance;
};
exports.setSocketInstance = setSocketInstance;
const getSocketInstance = () => {
    if (!io) {
        throw new Error('Socket.io instance not initialized. Call setSocketInstance first.');
    }
    return io;
};
exports.getSocketInstance = getSocketInstance;
