'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/lib/axios'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LogOut, Copy, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { socket } from '@/lib/socket'

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  lastSeen?: Date
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLogoutLoading, setIsLogoutLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const res: any = await axiosInstance.get('/auth/profile')
      
      if (res.success) {
        setUser(res.user)
        localStorage.setItem('user', JSON.stringify(res.user))
      } else {
        toast.error('Failed to load profile')
        router.push('/login')
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      if (error.response?.status === 401) {
        router.push('/login')
      } else {
        toast.error('Error loading profile')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true)
      
      socket.disconnect()
      
      await axiosInstance.post('/auth/logout')
      
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Error logging out')
    } finally {
      setIsLogoutLoading(false)
    }
  }

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email)
      setCopied(true)
      toast.success('Email copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'bg-green-500' : 'bg-gray-400'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-gray-600 mb-4">Unable to load profile</p>
        <Button onClick={() => router.push('/chat')} variant="outline">
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/chat">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Avatar Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-blue-100 shadow-lg">
                  {getInitials(user.name)}
                </div>
              )}
              {/* Online Status Indicator */}
              <div
                className={`absolute bottom-1 right-1 w-5 h-5 ${getStatusColor(
                  user.isOnline
                )} rounded-full border-3 border-white shadow-md`}
                title={
                  user.isOnline
                    ? 'Online'
                    : `Last seen ${new Date(user.lastSeen || new Date()).toLocaleString()}`
                }
              ></div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user.name}
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              {user.isOnline ? (
                <span className="flex items-center gap-1 text-green-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Active now
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-500">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  {user.lastSeen
                    ? `Last seen ${new Date(user.lastSeen).toLocaleString()}`
                    : 'Offline'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          {/* Email */}
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Email Address
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-gray-900 font-medium break-all">{user.email}</p>
              <button
                onClick={handleCopyEmail}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy email"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* User ID */}
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              User ID
            </p>
            <p className="text-gray-600 font-mono text-sm break-all">{user._id}</p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="space-y-3">
          <Button
            onClick={handleLogout}
            disabled={isLogoutLoading}
            className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white h-11"
          >
            <LogOut className="w-5 h-5" />
            {isLogoutLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Profile data is synced across all your devices
          </p>
        </div>
      </div>
    </div>
  )
}
