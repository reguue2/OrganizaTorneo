"use client"

import * as React from "react"
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Select as RadixSelect } from "radix-ui"

import { cn } from "@/lib/utils"

const EMPTY_VALUE = "__empty_select_value__"

type SelectOption = {
  value: string
  label: React.ReactNode
  disabled: boolean
}

type SelectProps = React.AriaAttributes & {
  autoComplete?: string
  children: React.ReactNode
  className?: string
  defaultValue?: string | number
  disabled?: boolean
  form?: string
  id?: string
  name?: string
  onChange?: React.ChangeEventHandler<HTMLSelectElement>
  required?: boolean
  value?: string | number
}

function isOptionElement(
  child: React.ReactNode
): child is React.ReactElement<React.OptionHTMLAttributes<HTMLOptionElement>> {
  return React.isValidElement(child) && child.type === "option"
}

function getOptions(children: React.ReactNode): SelectOption[] {
  return React.Children.toArray(children)
    .filter(isOptionElement)
    .map((child) => ({
      value:
        child.props.value === undefined ? String(child.props.children) : String(child.props.value),
      label: child.props.children,
      disabled: Boolean(child.props.disabled),
    }))
}

function toRadixValue(value: string | number | readonly string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? EMPTY_VALUE
  if (value === undefined) return undefined

  const text = String(value)
  return text === "" ? EMPTY_VALUE : text
}

function fromRadixValue(value: string) {
  return value === EMPTY_VALUE ? "" : value
}

function Select({
  autoComplete,
  children,
  className,
  defaultValue,
  disabled,
  form,
  id,
  name,
  onChange,
  required,
  value,
  ...ariaProps
}: SelectProps) {
  const options = getOptions(children)
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue === undefined ? "" : String(defaultValue)
  )
  const selectedValue = isControlled ? String(value) : uncontrolledValue
  const selectedOption = options.find((option) => option.value === selectedValue)
  const placeholder = options.find((option) => option.value === "")?.label
  const isPlaceholderSelected = selectedValue === ""
  const radixValue = toRadixValue(value)
  const radixDefaultValue = value === undefined ? toRadixValue(defaultValue) : undefined

  React.useEffect(() => {
    if (isControlled) return

    setUncontrolledValue(defaultValue === undefined ? "" : String(defaultValue))
  }, [defaultValue, isControlled])

  const handleValueChange = (nextRadixValue: string) => {
    const nextValue = fromRadixValue(nextRadixValue)

    if (!isControlled) {
      setUncontrolledValue(nextValue)
    }

    onChange?.({
      currentTarget: { name, value: nextValue },
      target: { name, value: nextValue },
    } as React.ChangeEvent<HTMLSelectElement>)
  }

  return (
    <>
      {name && (
        <input
          type="hidden"
          name={name}
          form={form}
          value={selectedValue}
          required={required}
          autoComplete={autoComplete}
        />
      )}
      <RadixSelect.Root
        value={radixValue}
        defaultValue={radixDefaultValue}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <RadixSelect.Trigger
          data-slot="select"
          id={id}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 py-2 text-left text-sm text-foreground shadow-xs transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
            isPlaceholderSelected && "text-muted-foreground",
            className
          )}
          {...ariaProps}
        >
          <RadixSelect.Value placeholder={placeholder}>
            <span className="min-w-0 truncate">
              {selectedOption?.label ?? placeholder}
            </span>
          </RadixSelect.Value>
          <RadixSelect.Icon asChild>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={6}
            className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
          >
            <RadixSelect.ScrollUpButton className="flex h-7 items-center justify-center text-muted-foreground">
              <ChevronUp className="size-4" />
            </RadixSelect.ScrollUpButton>
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={`${option.value}-${String(option.label)}`}
                  value={option.value === "" ? EMPTY_VALUE : option.value}
                  disabled={option.disabled}
                  className={cn(
                    "relative flex h-9 cursor-default select-none items-center rounded-md px-3 py-2 text-sm outline-none transition",
                    "data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
                    "data-[state=checked]:bg-primary/10 data-[state=checked]:text-foreground",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-45"
                  )}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
            <RadixSelect.ScrollDownButton className="flex h-7 items-center justify-center text-muted-foreground">
              <ChevronDown className="size-4" />
            </RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </>
  )
}

export { Select }
