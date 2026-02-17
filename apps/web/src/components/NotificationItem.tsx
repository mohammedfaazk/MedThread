'use client';

import { Trash2 } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUrl';

interface Notification {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    avatar: string | null;
    role: string;
  };
  metadata: {
    title?: string;
    body?: string;
    preview?: string;
    link?: string;
    communityName?: string;
    postTitle?: string;
  };
  actors?: Array<{
    id: string;
    username: string;
    avatar: string | null;
    role: string;
  }>;
  aggregatedCount?: number;
}

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (notification: Notification) => void;
}

export function NotificationItem({
  notification,
  onRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    // For notifications older than 7 days, show absolute date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Get notification message
  const getNotificationMessage = () => {
    const { type, actor, metadata, actors, aggregatedCount } = notification;
    const username = actor.username;

    // Handle aggregated notifications
    if (aggregatedCount && aggregatedCount > 1) {
      const othersCount = aggregatedCount - 1;
      const othersText = othersCount > 50 
        ? '50+ others' 
        : othersCount === 1 
        ? '1 other' 
        : `${othersCount} others`;

      switch (type) {
        case 'REPLY':
          return `${username} and ${othersText} replied to your post`;
        case 'AWARD':
          return `${username} and ${othersText} gave you awards`;
        case 'FOLLOWER':
          return `${username} and ${othersText} started following you`;
        case 'UPVOTE_MILESTONE':
          return `${username} and ${othersText} upvoted your post`;
        default:
          return `${username} and ${othersText} interacted with your content`;
      }
    }

    // Single notification messages
    switch (type) {
      case 'REPLY':
        return `${username} replied to your post`;
      case 'MENTION':
        return `${username} mentioned you`;
      case 'AWARD':
        return `${username} gave you an award`;
      case 'FOLLOWER':
        return `${username} started following you`;
      case 'APPOINTMENT_REQUEST':
        return `${username} requested an appointment`;
      case 'APPOINTMENT_UPDATE':
        return `Appointment status updated`;
      case 'VERIFICATION_STATUS':
        return metadata.title || 'Verification status updated';
      case 'COMMUNITY_INVITE':
        return `${username} invited you to moderate ${metadata.communityName}`;
      case 'DIRECT_MESSAGE':
        return `${username} sent you a message`;
      case 'SYSTEM_ANNOUNCEMENT':
        return metadata.title || 'System announcement';
      case 'UPVOTE_MILESTONE':
        return `Your post reached ${metadata.body}`;
      default:
        return metadata.body || 'New notification';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    onClick(notification);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      className={`border-b border-neutral-400/10 last:border-b-0 transition-all ${
        !notification.isRead ? 'bg-blue-50/50' : ''
      }`}
    >
      <div className="p-4 flex gap-4 hover:bg-neutral-300/10">
        {/* Avatar */}
        <div
          onClick={handleClick}
          className="cursor-pointer"
        >
          {notification.actors && notification.actors.length > 1 ? (
            // Stacked avatars for aggregated notifications
            <div className="relative w-12 h-12 flex-shrink-0">
              <div className="absolute top-0 left-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold border-2 border-white">
                {notification.actors[0].avatar ? (
                  <img
                    src={getImageUrl(notification.actors[0].avatar) || ''}
                    alt={notification.actors[0].username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  notification.actors[0].username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-700 font-bold border-2 border-white text-xs">
                {notification.actors[1]?.avatar ? (
                  <img
                    src={getImageUrl(notification.actors[1].avatar) || ''}
                    alt={notification.actors[1].username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  notification.actors[1]?.username.charAt(0).toUpperCase() || '+'
                )}
              </div>
            </div>
          ) : (
            // Single avatar
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold border border-blue-200 flex-shrink-0">
              {notification.actor.avatar ? (
                <img
                  src={getImageUrl(notification.actor.avatar) || ''}
                  alt={notification.actor.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                notification.actor.username.charAt(0).toUpperCase()
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div
          onClick={handleClick}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <p className="text-sm text-gray-800 font-medium">
            {getNotificationMessage()}
          </p>
          {notification.metadata.preview && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notification.metadata.preview}
            </p>
          )}
          {notification.metadata.communityName && notification.type !== 'COMMUNITY_INVITE' && (
            <p className="text-xs text-gray-500 mt-1">
              in {notification.metadata.communityName}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-start gap-2">
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
          )}
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all"
            aria-label="Delete notification"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
