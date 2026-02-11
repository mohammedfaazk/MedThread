import React from 'react';
interface ThreadReplyProps {
    authorName: string;
    authorRole: string;
    content: string;
    isDoctorVerified: boolean;
    helpfulCount: number;
    depth?: number;
}
export declare const ThreadReply: React.FC<ThreadReplyProps>;
export {};
