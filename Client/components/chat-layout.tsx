'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from './sidebar'
import { ChatWindow } from './chat-window'
import { socket } from '@/lib/socket'
import axiosInstance from '@/lib/axios'
interface SidebarProps {
  selectedChat: string
  onSelectChat: (chatId: string) => void
  conversations?: Conversation[]
  contacts?: Participant[]
  currentUserId?: string | null
  fetchConversations?: () => Promise<void>
}
interface Participant {
  _id: string
  name: string
  email?: string
  avatar?: string
  isOnline?: boolean
  lastSeen?: string | null
  unread?: number
}

interface LastMessage {
  _id: string
  content: string
  createdAt?: string
}

interface Conversation {
  _id: string
  type: 'private' | 'group'
  groupName?: string
  groupAvatar?: string
  participants: Participant[]
  lastMessage?: LastMessage
  updatedAt?: string
  unread?: number
}

interface ChatLayoutConversation extends Conversation {}


export function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState<string>("")
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [contacts, setContacts] = useState<Participant[]>([])
  const [calls, setCalls] = useState<unknown[]>([])

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) return

    try {
      const parsed = JSON.parse(userStr)
      setCurrentUserId(parsed?.id || null)
    } catch (e) {
      console.error('Failed to parse user', e)
    }
  }, [])
  const fetchConversations = async (): Promise<void> => {
    try {
      const res = await axiosInstance.get('/conversations')
      if (res?.data?.success) {
        setConversations(res?.data?.conversations || [])
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchContacts = async (): Promise<void> => {
    try {
      const res: any = await axiosInstance.get('/auth/users')
      if (res.data?.success) {
        setContacts(res.data?.users || [])
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchConversations()
    fetchContacts()
  }, [])
  useEffect(() => {
    socket.connect()
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, []);
  return (
    <div className="flex h-screen w-full bg-background">
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-background transition-transform duration-300 lg:relative lg:z-0 lg:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <Sidebar
          selectedChat={selectedChat}
          onSelectChat={(chatId) => {
            setSelectedChat(chatId)
            setIsMobileSidebarOpen(false)
          }}
          conversations={conversations}
          contacts={contacts}
          currentUserId={currentUserId}
          fetchConversations={fetchConversations}
        />
      </div>

      {/* Chat Window */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatWindow
          conversationId={selectedChat}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          fetchConversations={fetchConversations}

        />
      </div>
    </div>
  )
}
