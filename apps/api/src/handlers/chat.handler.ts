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
    socket.on("send_message", (data: any) => {
        // data should contain conversationId, content, senderId, etc.
        // In a real implementation, we would save to DB here or via API
        // For now, just relay it to the room
        const { conversationId, message } = data;
        io.to(conversationId).emit("receive_message", message);
    });

    // Typing indicator
    socket.on("typing", (data: { conversationId: string, userId: string, isTyping: boolean }) => {
        socket.to(data.conversationId).emit("typing", data);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
};
