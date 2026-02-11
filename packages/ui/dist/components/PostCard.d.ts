import React from 'react';
interface PostCardProps {
    patientUsername: string;
    symptoms: string[];
    doctorResponseCount: number;
    replyCount: number;
    upvotes: number;
    onClick?: () => void;
}
export declare const PostCard: React.FC<PostCardProps>;
export {};
