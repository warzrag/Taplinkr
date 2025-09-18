import * as React from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
}

const baseStyles = 'relative inline-flex items-center justify-center gap-2 rounded-2xl font-medium tracking-tight transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60'

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-brand hover:-translate-y-0.5 hover:from-brand-500 hover:to-brand-400 hover:shadow-brand-lg active:translate-y-0',
  secondary: 'border border-border/80 bg-white dark:bg-gray-800 text-foreground shadow-soft hover:-translate-y-0.5 hover:border-[hsl(var(--border-strong))] hover:shadow-md active:translate-y-0',
  ghost: 'bg-transparent text-foreground/70 hover:bg-foreground/5 hover:text-foreground active:translate-y-0',
  subtle: 'bg-[hsl(var(--surface-muted))] text-foreground/80 hover:text-foreground hover:bg-[hsl(var(--surface-muted))]/80 active:translate-y-0',
  link: 'rounded-none bg-transparent px-0 py-0 h-auto text-sm font-semibold text-brand-600 shadow-none hover:text-brand-500 hover:underline focus-visible:outline-offset-4',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-7 text-base',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      className,
      children,
      type = 'button',
      disabled,
      ...props
    },
    ref
  ) => {
    const resolvedDisabled = disabled || loading
    const resolvedSizeClass = variant === 'link' ? '' : sizeStyles[size]

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseStyles,
          resolvedSizeClass,
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )}
        disabled={resolvedDisabled}
        aria-busy={loading}
        {...props}
      >
        <span
          className={cn(
            'inline-flex items-center gap-2 transition-opacity duration-150',
            loading && 'opacity-0'
          )}
        >
          {children}
        </span>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
