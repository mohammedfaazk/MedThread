"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Conversation {
    id: string;
    participants: Array<{
        id: string;
        username: string;
        avatar?: string;
        role: string;
    }>;
    messages: Array<{
        content: string;
        createdAt: string;
    }>;
    appointment?: {
        status: string;
        startTime: string;
    };
}

interface ChatListProps {
    currentUserId: string;
    onSelectConversation: (conversation: Conversation) => void;
    autoSelectOtherUserId?: string | null;
}

export const ChatList: React.FC<ChatListProps> = ({
    currentUserId,
    onSelectConversation,
    autoSelectOtherUserId
}) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, [currentUserId]);

    useEffect(() => {
        if (!loading && conversations.length > 0 && autoSelectOtherUserId) {
            const target = conversations.find(c =>
                c.participants.some(p => p.id === autoSelectOtherUserId)
            );
            if (target) {
                onSelectConversation(target);
            }
        } else if (!loading && conversations.length > 0 && !autoSelectOtherUserId) {
            // Default to first conversation if nothing selected? 
            // Maybe not, keep it optional
        }
    }, [loading, conversations, autoSelectOtherUserId]);

    const loadConversations = async () => {
        try {
            const res = await axios.get(`/api/chat/conversations?userId=${currentUserId}`);
            setConversations(res.data);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getOtherParticipant = (conv: Conversation) => {
        return conv.participants.find(p => p.id !== currentUserId);
    };

    if (loading) {
        return <div className="p-4">Loading conversations...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow h-full overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Messages</h2>
                <button
                    onClick={loadConversations}
                    disabled={loading}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition"
                    title="Refresh Messages"
                >
                    <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            <div className="divide-y">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No conversations yet</div>
                ) : (
                    conversations.map((conv) => {
                        const other = getOtherParticipant(conv);
                        const lastMessage = conv.messages[0];

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelectConversation(conv)}
                                className="p-4 hover:bg-gray-50 cursor-pointer transition"
                            >
                                <div className="flex items-center gap-3">
                                    {other?.avatar && (
                                        <img
                                            src={other.avatar}
                                            alt={other.username}
                                            className="w-12 h-12 rounded-full"
                                        />
                                    )}
                                    {!other?.avatar && (
                                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                            {other?.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-semibold truncate">{other?.username}</h3>
                                            {lastMessage && (
                                                <span className="text-xs text-gray-500">
                                                    {new Date(lastMessage.createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>

                                        {lastMessage && (
                                            <p className="text-sm text-gray-600 truncate">{lastMessage.content}</p>
                                        )}

                                        {conv.appointment && (
                                            <span className="text-xs text-blue-600">
                                                {conv.appointment.status} • {new Date(conv.appointment.startTime).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
