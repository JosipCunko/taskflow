"use client";

import { Notification } from "@/app/_types/types";
import {
  getNotificationStyles,
  formatNotificationTime,
  getPriorityBadgeStyles,
} from "@/app/_utils/utils";
import { getNotificationIcon } from "@/app/_utils/icons";
import { X, ExternalLink, Archive, Clock } from "lucide-react";
import { useState } from "react";
import { Tooltip } from "react-tooltip";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export default function NotificationCard({
  notification,
  onMarkAsRead,
  onArchive,
  onDelete,
  compact = false,
}: NotificationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = getNotificationIcon(notification.type);
  const styles = getNotificationStyles(notification.priority);
  const handleCardClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <div
      className={`
        relative p-4 rounded-lg border transition-all duration-200 cursor-pointer
        ${styles.borderColor} ${styles.bgColor}
        ${!notification.isRead ? "shadow-sm" : "opacity-75"}
        ${isHovered ? "shadow-md scale-[1.01]" : ""}
        ${compact ? "p-3" : "p-4"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.iconColor} mt-0.5`}>
          <Icon size={compact ? 18 : 20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-medium ${styles.textColor} ${
                  compact ? "text-sm" : "text-base"
                }`}
              >
                {notification.title}
              </h3>
              <p
                className={`mt-1 text-sm text-gray-600 ${
                  compact ? "line-clamp-1" : "line-clamp-2"
                }`}
              >
                {notification.message}
              </p>
            </div>

            {/* Priority badge */}
            <span
              className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
              ${getPriorityBadgeStyles(notification.priority)}
            `}
            >
              {notification.priority}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                {formatNotificationTime(notification.createdAt)}
              </span>

              {notification.actionText && notification.actionUrl && (
                <a
                  href={notification.actionUrl}
                  className={`
                    flex items-center gap-1 text-xs font-medium transition-colors
                    ${styles.textColor} hover:underline
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!notification.isRead && onMarkAsRead) {
                      onMarkAsRead(notification.id);
                    }
                  }}
                >
                  {notification.actionText}
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Action buttons */}
            {(onArchive || onDelete) && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onArchive && (
                  <>
                    <button
                      onClick={handleArchive}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      data-tooltip-id={`archive-notification-${notification.id}`}
                      data-tooltip-content="Archive notification"
                    >
                      <Archive size={14} />
                    </button>
                    <Tooltip id={`archive-notification-${notification.id}`} place="top" />
                  </>
                )}
                {onDelete && (
                  <>
                    <button
                      onClick={handleDelete}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      data-tooltip-id={`delete-notification-${notification.id}`}
                      data-tooltip-content="Delete notification"
                    >
                      <X size={14} />
                    </button>
                    <Tooltip id={`delete-notification-${notification.id}`} place="top" />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
