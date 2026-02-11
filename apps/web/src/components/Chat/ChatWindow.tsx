"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import axios from 'axios';

interface Message {
    id: string;
    content: string;
    senderId: string;
    type: 'TEXT' | 'IMAGE' | 'FILE';
    attachment?: string;
    createdAt: string;
    sender: {
        id: string;
        username: string;
        avatar?: string;
    };
}

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
    otherUser: {
        id: string;
        username: string;
        avatar?: string;
    };
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    conversationId,
    currentUserId,
    otherUser
}) => {
    const { socket } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Load messages
        loadMessages();

        // Join conversation room
        if (socket) {
            socket.emit('join_conversation', conversationId);

            // Listen for new messages
            socket.on('receive_message', (message: Message) => {
                setMessages(prev => [...prev, message]);
            });

            // Listen for typing
            socket.on('typing', (data: { userId: string; isTyping: boolean }) => {
                if (data.userId !== currentUserId) {
                    setOtherUserTyping(data.isTyping);
                }
            });

            return () => {
                socket.emit('leave_conversation', conversationId);
                socket.off('receive_message');
                socket.off('typing');
            };
        }
    }, [socket, conversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async () => {
        try {
            const res = await axios.get(`/api/chat/conversations/${conversationId}/messages`);
            setMessages(res.data);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleTyping = () => {
        if (!isTyping && socket) {
            setIsTyping(true);
            socket.emit('typing', { conversationId, userId: currentUserId, isTyping: true });

            setTimeout(() => {
                setIsTyping(false);
                socket.emit('typing', { conversationId, userId: currentUserId, isTyping: false });
            }, 3000);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const message = {
            conversationId,
            senderId: currentUserId,
            content: newMessage,
            type: 'TEXT' as const
        };

        try {
            const res = await axios.post('/api/chat/messages', message);

            if (socket) {
                socket.emit('send_message', {
                    conversationId,
                    message: res.data
                });
            }

            setMessages(prev => [...prev, res.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            const base64Data = base64.split(',')[1];

            try {
                const uploadRes = await axios.post('/api/chat/upload', {
                    base64Data,
                    filename: file.name,
                    mimeType: file.type
                });

                const messageType = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
                const message = {
                    conversationId,
                    senderId: currentUserId,
                    content: file.name,
                    type: messageType,
                    attachment: uploadRes.data.url
                };

                const res = await axios.post('/api/chat/messages', message);

                if (socket) {
                    socket.emit('send_message', { conversationId, message: res.data });
                }

                setMessages(prev => [...prev, res.data]);
            } catch (error) {
                console.error('Failed to upload file:', error);
                alert('Failed to upload file. Please try again.');
            }
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col h-full bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-white/20 backdrop-blur-sm border-neutral-400/20">
                {otherUser.avatar && (
                    <img src={otherUser.avatar} alt={otherUser.username} className="w-10 h-10 rounded-full" />
                )}
                {!otherUser.avatar && (
                    <div className="w-10 h-10 rounded-full bg-[#00BCD4] flex items-center justify-center text-white font-bold">
                        {otherUser.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-gray-900">{otherUser.username}</h3>
                    {otherUserTyping && <p className="text-sm text-gray-600">typing...</p>}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${msg.senderId === currentUserId
                                    ? 'bg-[#00BCD4] text-white'
                                    : 'bg-gray-200 text-gray-900'
                                }`}
                        >
                            {msg.type === 'IMAGE' && msg.attachment && (
                                <img src={msg.attachment} alt="attachment" className="max-w-full rounded mb-2 cursor-pointer" onClick={() => window.open(msg.attachment, '_blank')} />
                            )}
                            {msg.type === 'FILE' && msg.attachment && (
                                <a href={msg.attachment} download className="flex items-center gap-2 underline hover:opacity-80">
                                    <span className="text-2xl">📄</span>
                                    <div>
                                        <div className="font-semibold">{msg.content}</div>
                                        <div className="text-xs opacity-75">Click to download</div>
                                    </div>
                                </a>
                            )}
                            {msg.type === 'TEXT' && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                            <p className="text-xs mt-1 opacity-75">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                    title="Attach document or image"
                >
                    📎
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CB8B2] focus:border-[#5CB8B2]"
                />
                <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg"
                >
                    Send
                </button>
            </div>
        </div>
    );
};
