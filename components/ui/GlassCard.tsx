import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg',
        hover && 'transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:shadow-purple-500/10',
        className
      )}
    >
      {children}
    </div>
  )
}
