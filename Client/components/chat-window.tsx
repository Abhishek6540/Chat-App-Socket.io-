'use client'

import { useState, useRef, useEffect } from 'react'
import { Menu, Phone, Video, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MessageList } from './message-list'
import { MessageComposer } from './message-composer'
import axiosInstance from '@/lib/axios'
import { socket } from '@/lib/socket'
import { toast } from 'react-toastify'

interface User {
  _id: string
  name: string
  email?: string
  avatar?: string
  isOnline?: boolean
  isGroup?: string
  memberCount?: number
  groupName?: string
  user?: {
    _id: string
    name: string
    email?: string
    avatar?: string
    isOnline?: boolean
  }
}

interface Message {
  id: string
  sender: string
  senderId: string
  content: string
  timestamp: string
  avatar: string
  isOwn: boolean
  status: 'sent' | 'delivered' | 'read'
}

interface ChatWindowProps {
  conversationId: string
  onOpenSidebar: () => void
  fetchConversations: () => void
}

export function ChatWindow({
  conversationId,
  onOpenSidebar,
  fetchConversations
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const authUser =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : null

  const loggedInUserId = authUser?.id

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await axiosInstance.get(`/messages/${conversationId}`)

      const data = res.data
      setCurrentUser(data)

      const formattedMessages: Message[] = data.messages.map(
        (msg: any) => ({
          id: msg._id,
          sender: msg.sender.name,
          senderId: msg.sender._id,
          content: msg.content,
          timestamp: new Date(
            msg.createdAt
          ).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          avatar: "👤",
          isOwn: msg.sender._id === loggedInUserId,
          status: msg.status || 'sent',
        })
      )

      setMessages(formattedMessages)

      socket.emit("message:read", {
        conversationId,
        userId: loggedInUserId,
      })
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error.message
      )
    }
  }

  useEffect(() => {
    if (!conversationId) return

    socket.emit('conversation:join', conversationId)

    fetchMessages()

    return () => {
      socket.emit('conversation:leave', conversationId)
    }
  }, [conversationId])


  useEffect(() => {
    const handleNewMessage = (message: any) => {
      const senderId =
        typeof message.sender === 'object'
          ? message.sender._id
          : message.sender

      if (senderId === loggedInUserId) return

      const senderName =
        typeof message.sender === 'object'
          ? message.sender.name
          : 'Unknown'

      const formattedMessage: Message = {
        id: message._id || crypto.randomUUID(),
        sender: senderName,
        senderId,
        content: message.content,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        avatar: '👤',
        isOwn: senderId === loggedInUserId,
        status: 'sent',
      }

      setMessages(prev => {
        // replace optimistic message if exists
        const exists = prev.find(m => m.id === message._id)
        if (exists) return prev

        return [...prev, formattedMessage]
      })
    }

    socket.on('message:new', handleNewMessage)

    return () => {
      socket.off('message:new', handleNewMessage)
    }
  }, [loggedInUserId])

  useEffect(() => {
    const handleTypingStart = ({ conversationId: id }: any) => {
      if (id === conversationId) {
        setIsTyping(true)
      }
    }

    const handleTypingStop = ({ conversationId: id }: any) => {
      if (id === conversationId) {
        setIsTyping(false)
      }
    }

    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)

    return () => {
      socket.off('typing:start', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
    }
  }, [conversationId])

  const handleSendMessage = (content: string) => {
    if (!loggedInUserId) return

    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'You',
      senderId: loggedInUserId,
      content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      avatar: '👤',
      isOwn: true,
      status: 'sent',
    }

    setMessages(prev => [...prev, optimisticMessage])
    fetchConversations()
    fetchMessages()
    socket.emit('message:send', {
      conversationId: conversationId,
      sender: loggedInUserId,
      content,
      type: 'text',
    })
  }


  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="lg:hidden"
              onClick={onOpenSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg">
                {currentUser?.avatar || '👤'}
              </div>

              <div>
                <h2 className="font-semibold">
                  {currentUser?.isGroup === 'group' ? currentUser?.groupName : currentUser?.user?.name}
                </h2>

                <p className="text-xs text-muted-foreground">
                  {currentUser?.isGroup === 'group'
                    ? `${currentUser.memberCount} members`
                    : currentUser?.user?.isOnline
                      ? 'Active now'
                      : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="icon" variant="ghost">
              <Phone className="h-5 w-5" />
            </Button>

            <Button size="icon" variant="ghost">
              <Video className="h-5 w-5" />
            </Button>

            <Button size="icon" variant="ghost">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} ref={messagesEndRef} />

      {isTyping && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentUser?.isGroup === 'group'
                ? 'Someone is typing...'
                : `${currentUser?.user?.name} is typing...`}
            </span>

            <div className="flex gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      {/* Composer */}
      <MessageComposer onSendMessage={handleSendMessage} conversationId={conversationId} />

    </div>
  )
}