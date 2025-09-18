import * as React from 'react'
import { cn } from '@/lib/utils'

type ContainerTag = 'div' | 'section' | 'main' | 'header' | 'footer' | 'aside'

type ContainerWidth = 'default' | 'wide' | 'xl'

type ContainerPadding = 'none' | 'sm' | 'md' | 'lg'

const widthClassMap: Record<ContainerWidth, string> = {
  default: 'mx-auto w-full max-w-6xl',
  wide: 'mx-auto w-full max-w-7xl',
  xl: 'mx-auto w-full max-w-8xl',
}

const paddingClassMap: Record<ContainerPadding, string> = {
  none: 'px-0',
  sm: 'px-4 sm:px-6',
  md: 'px-5 sm:px-8 lg:px-10',
  lg: 'px-6 sm:px-10 lg:px-12',
}

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: ContainerTag
  bleed?: boolean
  width?: ContainerWidth
  padding?: ContainerPadding
}

export const Container = React.forwardRef<HTMLElement, ContainerProps>(
  (
    {
      as = 'div',
      bleed = false,
      width = 'default',
      padding = 'lg',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Component = as as React.ElementType
    const widthClasses = bleed ? 'w-full' : widthClassMap[width]

    return (
      <Component
        ref={ref}
        className={cn(widthClasses, paddingClassMap[padding], className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Container.displayName = 'Container'
