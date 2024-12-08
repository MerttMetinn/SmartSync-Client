"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

const TooltipProvider = TooltipPrimitive.Provider
const TooltipRoot = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={`z-50 overflow-hidden rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-gray-800 dark:text-gray-100 ${className}`}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export const Tooltip = ({
  children,
  content,
  side = 'top',
  className = '',
}: {
  children: React.ReactNode
  content: React.ReactNode | null
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}) => {
  if (!content) return <>{children}</>

  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className={className}>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}
