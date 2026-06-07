'use client'

import { useEffect, useState } from 'react'
import { Search, Plus, MessageCircle, Users, Phone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatItem } from './chat-item'
import Link from 'next/link'
import { CreateGroupDialog } from './create-group-dialog'
import axiosInstance from '@/lib/axios'
import { socket } from '@/lib/socket'

interface SidebarProps {
  selectedChat: string
  onSelectChat: (chatId: string) => void
  conversations?: Conversation[],
  contacts?: Participant[],
  currentUserId?: string |  undefined | null,
  fetchConversations: () => void
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

type TabType = 'conversations' | 'contacts' | 'calls'

export function Sidebar({
  selectedChat,
  onSelectChat,
  conversations,
  contacts,
  currentUserId,
  fetchConversations
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('conversations')




  const getConversationUser = (conversation: Conversation): Participant | null => {
    if (conversation.type === 'group') {
      return {
        _id: conversation._id,
        name: conversation.groupName || 'Group',
        avatar: conversation.groupAvatar || '',
        unread: conversation.unread,
        isOnline: false,
        lastSeen: null,
      }
    }

    if (!currentUserId) return null

    return (
      conversation.participants.find(p => p._id !== currentUserId) || null
    )
  }


  const filteredChats = (conversations || []).filter(conversation => {
    const otherUser = getConversationUser(conversation)

    if (!otherUser?.name) return false

    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  })


  const filteredContacts = (contacts || []).filter(contact => {
    return contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
  })


  const handleContactClick = async (userId: string) => {
    try {
      const res = await axiosInstance.post('/conversations/private', {
        receiverId: userId,
      })

      if (res?.data?.success) {
        socket.emit('user:join', userId)
        onSelectChat(res.data.conversation._id)
        setActiveTab('conversations')
      }
    } catch (error) {
      console.log(error)
    }
  }



  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="border-b border-sidebar-border p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Messenger</h1>

          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsCreateGroupOpen(true)}
              className="text-sidebar-accent-foreground hover:bg-sidebar-accent"
            >
              <Plus className="h-5 w-5" />
            </Button>

            <Link href="/profile">
              <Button
                size="icon"
                variant="ghost"
                className="text-sidebar-accent-foreground hover:bg-sidebar-accent"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-accent-foreground/50" />
          <input
            type="text"
            placeholder={
              activeTab === 'conversations'
                ? 'Search chats...'
                : activeTab === 'contacts'
                  ? 'Search contacts...'
                  : 'Search calls...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full bg-sidebar-accent py-2 pl-10 pr-4 text-sm text-sidebar-foreground placeholder-sidebar-accent-foreground/50 outline-none focus:ring-2 focus:ring-sidebar-ring"
          />
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="flex-1 overflow-y-auto">
        {/* Conversations Tab */}
        {activeTab === 'conversations' && (
          <>
            {filteredChats.length > 0 ? (
              filteredChats.map((conversation: Conversation) => {
                const otherUser = getConversationUser(conversation)
                const myUnread = Array.isArray(conversation.unread)
                  ? (conversation.unread as any[]).find((u: any) =>
                    (u.user?._id || u.user)?.toString() === currentUserId
                  )?.count || 0
                  : typeof conversation.unread === 'number'
                    ? conversation.unread
                    : 0
                return (
                  <ChatItem
                    key={conversation._id}
                    chat={{
                      _id: conversation._id,
                      name:
                        otherUser?.name ||
                        conversation.groupName ||
                        'Unknown User',
                      avatar:
                        otherUser?.avatar ||
                        conversation.groupAvatar ||
                        '',
                      isOnline:
                        otherUser?.isOnline || false,

                      lastSeen:
                        otherUser?.lastSeen ||
                        null,

                      isGroup:
                        conversation.type ===
                        'group',

                      lastMessage:
                        conversation?.lastMessage
                          ?.content || '',
                      updatedAt:
                        conversation.updatedAt ||
                        new Date().toISOString(),
                      unread: myUnread,
                    }}
                    isSelected={
                      selectedChat === conversation._id
                    }
                    onSelect={() =>
                      onSelectChat(conversation._id)
                    }
                  />
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
                <MessageCircle className="h-12 w-12 text-sidebar-accent-foreground/30" />
                <p className="text-sm text-sidebar-accent-foreground">
                  No conversations yet
                </p>
              </div>
            )}
          </>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact: any) => (
                <div
                  key={contact._id}
                  onClick={() => handleContactClick(contact._id)}
                  className="flex cursor-pointer items-center gap-3 border-b border-sidebar-border px-4 py-3 hover:bg-sidebar-accent"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold">
                    {contact.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-sidebar-foreground">
                      {contact.name || 'Unknown User'}
                    </p>
                    <p className="truncate text-xs text-sidebar-accent-foreground/70">
                      {contact.email || 'No email'}
                    </p>
                  </div>
                  {contact.isOnline && (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
                <Users className="h-12 w-12 text-sidebar-accent-foreground/30" />
                <p className="text-sm text-sidebar-accent-foreground">
                  No contacts found
                </p>
              </div>
            )}
          </>
        )}

        {/* Calls Tab */}
        {activeTab === 'calls' && (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <Phone className="h-12 w-12 text-sidebar-accent-foreground/30" />
            <p className="text-sm text-sidebar-accent-foreground">
              No calls history yet
            </p>
          </div>
        )}
      </div>

      {/* Tabs at Bottom */}
      <div className="flex items-center justify-center gap-4 border-t border-sidebar-border px-4 py-4">
        <Button
          size="icon"
          variant={activeTab === 'conversations' ? 'default' : 'ghost'}
          onClick={() => {
            setActiveTab('conversations')
            setSearchQuery('')
          }}
          className={`h-16 w-16 ${activeTab === 'conversations'
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-accent-foreground hover:bg-sidebar-accent'
            }`}
          title="Conversations"
        >
          <MessageCircle className="h-8 w-8" />
        </Button>

        <Button
          size="icon"
          variant={activeTab === 'contacts' ? 'default' : 'ghost'}
          onClick={() => {
            setActiveTab('contacts')
            setSearchQuery('')
          }}
          className={`h-16 w-16 ${activeTab === 'contacts'
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-accent-foreground hover:bg-sidebar-accent'
            }`}
          title="Contacts"
        >
          <Users className="h-8 w-8" />
        </Button>

        <Button
          size="icon"
          variant={activeTab === 'calls' ? 'default' : 'ghost'}
          onClick={() => {
            setActiveTab('calls')
            setSearchQuery('')
          }}
          className={`h-16 w-16 ${activeTab === 'calls'
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-accent-foreground hover:bg-sidebar-accent'
            }`}
          title="Calls"
        >
          <Phone className="h-8 w-8" />
        </Button>
      </div>

      <CreateGroupDialog
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        users={contacts || []}
        fetchConversations={fetchConversations}
      />
    </div>
  )
}
