'use client'

import { Check, CheckCheck } from 'lucide-react'

interface Message {
  id: string
  sender: string
  avatar: string
  content: string
  timestamp: string
  isOwn: boolean
  status: 'sending' | 'sent' | 'delivered' | 'read'
}

interface MessageListProps {
  messages: Message[]
  ref?: any
}

export function MessageList({ messages, ref }: MessageListProps) {
  // Group messages by date
  const groupedMessages = messages.reduce(
    (acc, message) => {
      const date = 'Today' // In a real app, you'd format actual dates
      if (!acc[date]) acc[date] = []
      acc[date].push(message)
      return acc
    },
    {} as Record<string, Message[]>
  )

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth" ref={ref}>
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Separator */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">
              {date}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Messages */}
          {dateMessages.map((message, index) => {
            const previousMessage = dateMessages[index - 1]
            const isSameAuthor =
              previousMessage && previousMessage.sender === message.sender
            const shouldShowAvatar =
              !isSameAuthor || index === dateMessages.length - 1

            return (
              <div
                key={message.id}
                className={`flex gap-2 ${message.isOwn ? 'justify-end' : 'justify-start'
                  } ${!isSameAuthor ? 'mt-4' : 'mt-1'}`}
              >
                {/* Avatar */}
                {!message.isOwn && (
                  <div className="shrink-0">
                    {shouldShowAvatar ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm">
                        {message.avatar}
                      </div>
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
                  {!isSameAuthor && !message.isOwn && (
                    <span className="mb-1 px-3 text-xs font-semibold text-foreground/70">
                      {message.sender}
                    </span>
                  )}
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${message.isOwn
                        ? 'rounded-br-none bg-primary text-primary-foreground'
                        : 'rounded-bl-none bg-secondary text-secondary-foreground'
                      }`}
                  >
                    {message.content}
                  </div>
                  <div
                    className={`mt-1 flex items-center gap-1 text-xs text-muted-foreground`}
                  >
                    <span>{message.timestamp}</span>
                    {message.isOwn && (
                      <>
                        {message.status === 'sending' && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        )}
                        {message.status === 'sent' && (
                          <Check className="h-4 w-4" />
                        )}
                        {(message.status === 'delivered' ||
                          message.status === 'read') && (
                            <CheckCheck className="h-4 w-4" />
                          )}
                        {message.status === 'read' && (
                          <span className="text-primary">✓</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
