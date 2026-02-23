"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectedUsers = exports.isUserConnected = exports.broadcastAllNotificationsRead = exports.broadcastNotificationRead = exports.sendUnreadCountUpdate = exports.sendNotificationToUser = exports.notificationHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const notification_service_1 = require("../services/notification.service");
/**
 * Authenticate socket connection using JWT token
 */
const authenticateSocket = (socket) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
            console.error(`Socket ${socket.id}: No authentication token provided`);
            return false;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        console.log(`Socket ${socket.id} authenticated for user: ${socket.userId}`);
        return true;
    }
    catch (error) {
        console.error(`Socket ${socket.id}: Authentication failed`, error);
        return false;
    }
};
/**
 * Track connected users for delivery status
 */
const connectedUsers = new Map(); // userId -> Set of socket IDs
/**
 * Notification handler for Socket.io
 */
const notificationHandler = (io, socket) => {
    // Authenticate socket on connection
    if (!authenticateSocket(socket)) {
        socket.emit('error', { message: 'Authentication required' });
        socket.disconnect();
        return;
    }
    const userId = socket.userId;
    /**
     * Join user's notification room
     * Client emits: { userId: string }
     */
    socket.on('notification:join', async (data) => {
        try {
            // Verify user can only join their own room
            if (data.userId !== userId) {
                socket.emit('error', { message: 'Unauthorized: Cannot join another user\'s notification room' });
                return;
            }
            const roomName = `notifications:${userId}`;
            socket.join(roomName);
            // Track connection
            if (!connectedUsers.has(userId)) {
                connectedUsers.set(userId, new Set());
            }
            connectedUsers.get(userId).add(socket.id);
            console.log(`Socket ${socket.id} joined notification room: ${roomName}`);
            // Send current unread count on join
            const unreadCount = await notification_service_1.notificationService.getUnreadCount(userId);
            socket.emit('notification:unread-count', unreadCount);
        }
        catch (error) {
            console.error(`Error joining notification room:`, error);
            socket.emit('error', { message: 'Failed to join notification room' });
        }
    });
    /**
     * Leave notification room
     */
    socket.on('notification:leave', () => {
        try {
            const roomName = `notifications:${userId}`;
            socket.leave(roomName);
            // Remove from connection tracking
            if (connectedUsers.has(userId)) {
                connectedUsers.get(userId).delete(socket.id);
                if (connectedUsers.get(userId).size === 0) {
                    connectedUsers.delete(userId);
                }
            }
            console.log(`Socket ${socket.id} left notification room: ${roomName}`);
        }
        catch (error) {
            console.error(`Error leaving notification room:`, error);
        }
    });
    /**
     * Mark notification as read (for cross-tab sync)
     * Client emits: { notificationId: string }
     */
    socket.on('notification:read', async (data) => {
        try {
            const { notificationId } = data;
            // Mark as read in database
            await notification_service_1.notificationService.markAsRead([notificationId], userId);
            // Broadcast to all user's connected clients (cross-tab sync)
            const roomName = `notifications:${userId}`;
            io.to(roomName).emit('notification:read', notificationId);
            // Send updated unread count
            const unreadCount = await notification_service_1.notificationService.getUnreadCount(userId);
            io.to(roomName).emit('notification:unread-count', unreadCount);
            console.log(`Notification ${notificationId} marked as read for user ${userId}`);
        }
        catch (error) {
            console.error(`Error marking notification as read:`, error);
            socket.emit('error', { message: 'Failed to mark notification as read' });
        }
    });
    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
        // Remove from connection tracking
        if (connectedUsers.has(userId)) {
            connectedUsers.get(userId).delete(socket.id);
            if (connectedUsers.get(userId).size === 0) {
                connectedUsers.delete(userId);
            }
        }
        console.log(`User disconnected: ${socket.id} (userId: ${userId})`);
    });
};
exports.notificationHandler = notificationHandler;
/**
 * Server-side helper to send new notification to user
 */
const sendNotificationToUser = (io, userId, notification) => {
    const roomName = `notifications:${userId}`;
    io.to(roomName).emit('notification:new', notification);
    console.log(`Sent notification to user ${userId} in room ${roomName}`);
};
exports.sendNotificationToUser = sendNotificationToUser;
/**
 * Server-side helper to send unread count update
 */
const sendUnreadCountUpdate = (io, userId, count) => {
    const roomName = `notifications:${userId}`;
    io.to(roomName).emit('notification:unread-count', count);
    console.log(`Sent unread count (${count}) to user ${userId}`);
};
exports.sendUnreadCountUpdate = sendUnreadCountUpdate;
/**
 * Server-side helper to broadcast notification read event
 */
const broadcastNotificationRead = (io, userId, notificationId) => {
    const roomName = `notifications:${userId}`;
    io.to(roomName).emit('notification:read', notificationId);
    console.log(`Broadcast notification read (${notificationId}) to user ${userId}`);
};
exports.broadcastNotificationRead = broadcastNotificationRead;
/**
 * Server-side helper to broadcast all notifications read event
 */
const broadcastAllNotificationsRead = (io, userId) => {
    const roomName = `notifications:${userId}`;
    io.to(roomName).emit('notification:all-read');
    console.log(`Broadcast all notifications read to user ${userId}`);
};
exports.broadcastAllNotificationsRead = broadcastAllNotificationsRead;
/**
 * Check if user is currently connected
 */
const isUserConnected = (userId) => {
    return connectedUsers.has(userId) && connectedUsers.get(userId).size > 0;
};
exports.isUserConnected = isUserConnected;
/**
 * Get all connected user IDs
 */
const getConnectedUsers = () => {
    return Array.from(connectedUsers.keys());
};
exports.getConnectedUsers = getConnectedUsers;
