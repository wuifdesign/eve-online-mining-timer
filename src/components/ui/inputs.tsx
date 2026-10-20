import type { ComponentChildren, FunctionComponent, TargetedInputEvent } from 'preact'
import { useId, useState } from 'preact/hooks'
import { cx } from './cx.ts'
import { Icon } from './icon.tsx'

type InputSize = 'xs' | 'sm'

const inputBaseClasses =
  'w-full rounded-md border border-field bg-canvas text-fg placeholder:text-subtle outline-none transition-colors duration-150 hover:border-subtle focus:border-accent focus-visible:outline-none'

const inputSizes: Record<InputSize, string> = {
  // touch screens get the 44px minimum target
  xs: 'h-8 px-2.5 text-sm pointer-coarse:h-11',
  sm: 'h-9 px-3 text-sm pointer-coarse:h-11',
}

// props shared by all fields; kept explicit instead of spreading every HTML attribute,
// Preact's strict accessibility typings don't allow forwarding arbitrary attribute sets
type BaseFieldProps = {
  label?: ComponentChildren
  required?: boolean
  className?: string
  'aria-label'?: string
}

type FieldProps = {
  label?: ComponentChildren
  children: (id: string) => ComponentChildren
}

const Field: FunctionComponent<FieldProps> = ({ label, children }) => {
  const id = useId()
  if (!label) {
    return <>{children(id)}</>
  }
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      {children(id)}
    </div>
  )
}

export type TextInputProps = BaseFieldProps & {
  size?: InputSize
  defaultValue?: string
  onInput?: (value: string) => void
}

export const TextInput: FunctionComponent<TextInputProps> = ({
  label,
  size = 'sm',
  required,
  className,
  onInput,
  ...props
}) => {
  return (
    <Field label={label}>
      {(id) => (
        <input
          id={id}
          type="text"
          required={required}
          {...props}
          onInput={onInput && ((event) => onInput(event.currentTarget.value))}
          className={cx(inputBaseClasses, inputSizes[size], className)}
        />
      )}
    </Field>
  )
}

export type NumberInputProps = BaseFieldProps & {
  value: number
  onChange: (value: number) => void
  size?: InputSize
  min?: number
  max?: number
  step?: number
  suffix?: string
  thousandSeparator?: boolean
  allowDecimal?: boolean
  allowNegative?: boolean
}

export const NumberInput: FunctionComponent<NumberInputProps> = ({
  value,
  onChange,
  label,
  size = 'sm',
  min,
  max,
  step = 1,
  suffix = '',
  thousandSeparator = false,
  allowDecimal = true,
  allowNegative = true,
  required,
  className,
  ...props
}) => {
  // raw text while the user is editing, null otherwise (then the formatted value is shown)
  const [draft, setDraft] = useState<string | null>(null)

  const clamp = (next: number) => {
    let result = next
    if (min !== undefined) result = Math.max(min, result)
    if (max !== undefined) result = Math.min(max, result)
    return result
  }

  const finiteValue = Number.isFinite(value) ? value : 0
  // the value can carry fractions even for integer inputs (e.g. ore counted down by the timer)
  const safeValue = allowDecimal ? finiteValue : Math.round(finiteValue)
  const formatted = `${safeValue.toLocaleString('en-US', { useGrouping: thousandSeparator, maximumFractionDigits: 20 })}${suffix}`

  const pattern = new RegExp(`^${allowNegative ? '-?' : ''}\\d*${allowDecimal ? '(\\.\\d*)?' : ''}$`)

  return (
    <Field label={label}>
      {(id) => (
        <input
          id={id}
          type="text"
          inputMode={allowDecimal ? 'decimal' : 'numeric'}
          autoComplete="off"
          required={required}
          {...props}
          value={draft ?? formatted}
          onFocus={() => setDraft(String(safeValue))}
          onInput={(event) => {
            const text = event.currentTarget.value.replace(/,/g, '')
            if (!pattern.test(text)) {
              // Preact does not snap controlled inputs back on its own, revert the rejected keystroke
              event.currentTarget.value = draft ?? ''
              return
            }
            setDraft(text)
            const parsed = parseFloat(text)
            if (Number.isFinite(parsed)) {
              onChange(parsed)
            }
          }}
          onBlur={() => {
            const parsed = parseFloat(draft ?? '')
            const next = clamp(Number.isFinite(parsed) ? parsed : 0)
            if (next !== safeValue) {
              onChange(next)
            }
            setDraft(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
              event.preventDefault()
              const direction = event.key === 'ArrowUp' ? 1 : -1
              // round away floating point noise from steps like 0.1
              const next = clamp(Math.round((safeValue + direction * step) * 1e6) / 1e6)
              setDraft(String(next))
              onChange(next)
            }
          }}
          className={cx(inputBaseClasses, inputSizes[size], 'tabular', className)}
        />
      )}
    </Field>
  )
}

export type SelectOption = string | { value: string; label: string }

export type SelectProps = BaseFieldProps & {
  data: SelectOption[]
  value: string | null | undefined
  onChange: (value: string) => void
  size?: InputSize
  placeholder?: string
}

export const Select: FunctionComponent<SelectProps> = ({
  data,
  value,
  onChange,
  label,
  size = 'sm',
  placeholder = '',
  required,
  className,
  ...props
}) => {
  const options = data.map((option) => (typeof option === 'string' ? { value: option, label: option } : option))
  return (
    <Field label={label}>
      {(id) => (
        <div className="relative">
          <select
            id={id}
            required={required}
            {...props}
            value={value ?? ''}
            onChange={(event) => onChange(event.currentTarget.value)}
            className={cx(
              inputBaseClasses,
              inputSizes[size],
              'cursor-pointer appearance-none truncate pr-7',
              className,
            )}
          >
            {!value && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            name="chevron-down"
            className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-subtle"
          />
        </div>
      )}
    </Field>
  )
}

export type TextareaProps = BaseFieldProps & {
  value?: string
  placeholder?: string
  rows?: number
  autoComplete?: string
  onInput?: (event: TargetedInputEvent<HTMLTextAreaElement>) => void
}

export const Textarea: FunctionComponent<TextareaProps> = ({ label, required, className, ...props }) => {
  return (
    <Field label={label}>
      {(id) => (
        <textarea
          id={id}
          required={required}
          {...props}
          className={cx(inputBaseClasses, 'block resize-y px-3 py-2 text-sm', className)}
        />
      )}
    </Field>
  )
}
