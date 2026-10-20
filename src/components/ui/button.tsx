import type { ComponentChildren, FunctionComponent, TargetedMouseEvent } from 'preact'
import { cx } from './cx.ts'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger'

// full class names so Tailwind can pick them up
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover',
  secondary: 'border border-line-strong bg-raised text-fg hover:border-subtle',
  ghost: 'text-muted hover:bg-raised hover:text-fg',
  // quiet action that still needs to stand out, e.g. undo
  accent: 'text-accent hover:bg-accent/10 hover:text-accent-hover',
  danger: 'text-muted hover:bg-danger/15 hover:text-danger',
}

const baseClasses =
  'inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer select-none disabled:pointer-events-none disabled:opacity-40'

// touch screens get the 44px minimum target
const buttonSizes = {
  sm: 'h-7 px-2.5 text-xs pointer-coarse:h-11 pointer-coarse:px-3.5 pointer-coarse:text-sm',
  md: 'h-9 px-3.5 text-sm pointer-coarse:h-11',
}

type ClickHandler = (event: TargetedMouseEvent<HTMLButtonElement>) => void

export type ButtonProps = {
  className?: string
  variant?: ButtonVariant
  size?: keyof typeof buttonSizes
  leftSection?: ComponentChildren
  disabled?: boolean
  title?: string
  onClick?: ClickHandler
  // when set, the button renders as a link
  href?: string
  target?: string
}

export const Button: FunctionComponent<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  leftSection,
  className,
  children,
  disabled,
  title,
  onClick,
  href,
  target,
}) => {
  const classes = cx(baseClasses, buttonSizes[size], variantClasses[variant], className)
  const content = (
    <>
      {leftSection}
      {children}
    </>
  )
  if (href !== undefined) {
    return (
      <a
        href={href}
        target={target}
        title={title}
        rel={target === '_blank' ? 'noreferrer' : undefined}
        className={classes}
      >
        {content}
      </a>
    )
  }
  return (
    <button type="button" disabled={disabled} title={title} onClick={onClick} className={classes}>
      {content}
    </button>
  )
}

const iconButtonSizes = {
  sm: 'size-7 text-base pointer-coarse:size-11',
  md: 'size-8 text-lg pointer-coarse:size-11',
}

export type IconButtonProps = {
  className?: string
  disabled?: boolean
  onClick?: ClickHandler
  // required: icon-only buttons need an accessible name
  title: string
  variant?: ButtonVariant
  size?: keyof typeof iconButtonSizes
}

export const IconButton: FunctionComponent<IconButtonProps> = ({
  variant = 'ghost',
  size = 'sm',
  title,
  className,
  children,
  disabled,
  onClick,
}) => {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cx(baseClasses, 'px-0', iconButtonSizes[size], variantClasses[variant], className)}
    >
      {children}
    </button>
  )
}
