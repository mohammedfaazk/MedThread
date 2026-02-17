import { Server, Socket } from 'socket.io';

export const chatHandler = (io: Server, socket: Socket) => {
    // Join a conversation room
    socket.on("join_conversation", (conversationId: string) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId: string) => {
        socket.leave(conversationId);
        console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
    });

    // Send a message
    socket.on("send_message", async (data: any) => {
        // data should contain conversationId, content, senderId, receiverId, etc.
        const { conversationId, message } = data;
        
        // Relay message to the room
        io.to(conversationId).emit("receive_message", message);
        
        // Create direct message notification for the receiver
        if (message.senderId && message.receiverId) {
            try {
                const { notificationService } = await import('../services/notification.service');
                const { socketDeliveryService } = await import('../services/socket-delivery.service');
                
                const notifications = await notificationService.createNotification({
                    type: 'DIRECT_MESSAGE',
                    recipientIds: [message.receiverId],
                    actorId: message.senderId,
                    contentId: conversationId,
                    contentType: 'POST', // Using POST as placeholder since CONVERSATION is not in ContentType enum
                    metadata: {
                        preview: message.content?.substring(0, 100) || 'Sent a message',
                        link: `/chat?conversation=${conversationId}`,
                    },
                });
                
                // Send notification via socket
                for (const notification of notifications) {
                    await socketDeliveryService.sendNotification([notification.recipientId], notification);
                }
            } catch (error) {
                console.error('Error creating direct message notification:', error);
            }
        }
    });

    // Typing indicator
    socket.on("typing", (data: { conversationId: string, userId: string, isTyping: boolean }) => {
        socket.to(data.conversationId).emit("typing", data);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
};

