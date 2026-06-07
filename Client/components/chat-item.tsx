'use client'

import { formatChatTime } from "@/lib/date-format"

interface ChatItemProps {
  chat: {
    _id: string
    name: string
    avatar: string
    lastSeen: string | null
    updatedAt: string
    unread: number
    isOnline: boolean
    isGroup: boolean
    lastMessage?:string
  }
  isSelected: boolean
  onSelect: (chatId: string) => void
}

export function ChatItem({ chat, isSelected, onSelect }: ChatItemProps) {
  console.log(chat,"chat")
  return (
    <button
      onClick={() => onSelect(chat._id)}
      className={`w-full border-b border-sidebar-border px-3 py-3 text-left transition-colors hover:bg-sidebar-accent ${
        isSelected ? 'bg-sidebar-accent' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl">
            {chat?.avatar  || "👨‍💻"}
          </div>
          {chat?.isOnline && !chat.isGroup && (
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-sidebar bg-green-500" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate font-semibold text-sidebar-foreground">
              {chat?.name}
            </h3>
            <span className="shrink-0 text-xs text-sidebar-accent-foreground/70">
              {formatChatTime(chat?.updatedAt)}
            </span>
          </div>
          <p className="truncate text-sm text-sidebar-accent-foreground/70">
            {formatChatTime(chat?.lastSeen)}
          </p>
        </div>

        {/* Unread Badge */}
        {chat?.unread > 0 && (
          <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {chat.unread > 9 ? '9+' : chat.unread}
          </div>
        )}
      </div>
    </button>
  )
}
