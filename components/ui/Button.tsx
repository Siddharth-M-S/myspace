import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25': variant === 'primary',
          'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20': variant === 'ghost',
          'bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30': variant === 'danger',
          'border border-violet-500/50 hover:border-violet-500 text-violet-400 hover:text-violet-300 bg-transparent': variant === 'outline',
        },
        {
          'text-xs px-2.5 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md',
          'text-base px-6 py-3': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
