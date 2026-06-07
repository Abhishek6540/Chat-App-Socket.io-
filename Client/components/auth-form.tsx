'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

interface AuthFormProps {
  children: ReactNode
  title: string
  description?: string
}

export function AuthForm({ children, title, description }: AuthFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <svg
                className="h-7 w-7 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <Card className="border-0 shadow-lg bg-card">
          <div className="p-8 space-y-6">{children}</div>
        </Card>
      </div>
    </div>
  )
}
