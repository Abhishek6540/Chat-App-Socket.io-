'use client'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

const emojis = [
  '😀', '😁', '😂', '😃', '😄', '😅', '😆', '😉', '😊', '😍',
  '😘', '😗', '😚', '😙', '🙂', '🤑', '😎', '🤓', '🤔', '😐',
  '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😲',
  '😳', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
  '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌', '🤞',
  '🫡', '🤟', '🤘', '🤙', '👍', '👎', '✊', '👊', '🤛', '🤜',
  '👏', '🙌', '👐', '🤲', '🤝', '🤜', '❤️', '🧡', '💛', '💚',
  '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗',
]

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-lg">
      <div className="grid grid-cols-10 gap-2">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-secondary"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
