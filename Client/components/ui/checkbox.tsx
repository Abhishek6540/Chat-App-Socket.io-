'use client'

import * as React from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="relative inline-flex items-center">
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'peer h-4 w-4 shrink-0 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer appearance-none checked:bg-primary checked:border-primary',
        className,
      )}
      {...props}
    />
    <Check className="h-3 w-3 absolute text-primary-foreground pointer-events-none peer-checked:block hidden" />
  </div>
))
Checkbox.displayName = 'Checkbox'

export { Checkbox }
