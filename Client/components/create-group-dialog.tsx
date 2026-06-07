'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import axiosInstance from '@/lib/axios'
import { toast } from 'react-toastify'
import { socket } from '@/lib/socket'

interface CreateGroupDialogProps {
  isOpen: boolean
  onClose: () => void
    users?: any[]
  fetchConversations: () => void
}

export function CreateGroupDialog({ isOpen, onClose, users, fetchConversations }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  if (!isOpen) return null


  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const handleCreateGroup = async () => {
    try {
      const res: any = await axiosInstance.post("/conversations/group", {
        groupName,
        participants: selectedUsers
      })

      const group = res.data

      if (res?.success) {
        toast.success("Group created successfully")

        socket.emit("group:created", group)
        fetchConversations()
        setGroupName('')
        setSelectedUsers([])
        onClose()
      }

    } catch (error) {
      console.log(error)
    }
  }



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Create Group</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Select Members */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Add Members
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-border p-2">
              {users?.map((user: any) => (
                <label
                  key={user._id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-secondary"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleToggleUser(user._id)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-lg">{user.avatar || "👨‍💼"}</span>
                  <span className="text-sm text-foreground">{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Selected Count */}
          {selectedUsers.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length === 0}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create Group
          </Button>
        </div>
      </div>
    </div>
  )
}
