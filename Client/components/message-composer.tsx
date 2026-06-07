'use client'

import { useState, useRef } from 'react'
import { Send, Paperclip, Smile, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmojiPicker } from './emoji-picker'
import { socket } from '@/lib/socket'

interface MessageComposerProps {
  onSendMessage: (message: string) => void
  conversationId: string
}

export function MessageComposer({ onSendMessage, conversationId }: MessageComposerProps) {
  const [message, setMessage] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const textInputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
      setShowEmoji(false)
      textInputRef.current?.focus()
    }
  }


  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    textInputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAttach = () => {
    // File attachment logic
  }

  const handleVoiceMessage = () => {
    setIsRecording(!isRecording)
    // Voice recording logic
  }

  const handleTyping = () => {
    socket.emit('typing:start', { conversationId })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { conversationId })
    }, 800)
  }

  return (
    <div className="border-t border-border bg-card p-4">
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="mb-3">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}

      {/* Message Input */}
      <div className="flex gap-2">
        {/* Attachment Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={handleAttach}
          className="shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Text Input */}
        <div className="relative flex-1">
          <textarea
            ref={textInputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full resize-none rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            rows={1}
            style={{
              maxHeight: '120px',
              minHeight: '40px',
            }}
          />
        </div>

        {/* Emoji Picker Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowEmoji(!showEmoji)}
          className={`shrink-0 ${showEmoji ? 'text-primary' : ''
            }`}
        >
          <Smile className="h-5 w-5" />
        </Button>

        {/* Voice Message Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={handleVoiceMessage}
          className={`shrink-0 ${isRecording ? 'text-red-500' : ''
            }`}
        >
          <Mic className="h-5 w-5" />
        </Button>

        {/* Send Button */}
        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          Recording voice message...
        </div>
      )}
    </div>
  )
}
