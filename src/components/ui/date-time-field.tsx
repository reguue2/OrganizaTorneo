"use client"

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  X,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type DateTimeFieldProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}

const weekdays = ["L", "M", "X", "J", "V", "S", "D"]
const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const hours = Math.floor(index / 4)
  const minutes = (index % 4) * 15

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
})

function parseDateTime(value: string) {
  if (!value) return null

  const [datePart, timePart = "10:00"] = value.split("T")
  const [year, month, day] = datePart.split("-").map(Number)
  const [hours, minutes] = timePart.split(":").map(Number)

  if (!year || !month || !day) return null

  const date = new Date(year, month - 1, day, hours || 0, minutes || 0)
  if (Number.isNaN(date.getTime())) return null

  return date
}

function formatDateTimeValue(date: Date, time: string) {
  const [hours = "10", minutes = "00"] = time.split(":")

  return [
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`,
    `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`,
  ].join("T")
}

function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getEndOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function buildCalendarDays(month: Date) {
  const firstDay = getStartOfMonth(month)
  const firstWeekday = (firstDay.getDay() + 6) % 7
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - firstWeekday)

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

function isSameDay(left: Date | null, right: Date) {
  return (
    left?.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function isBeforeDay(left: Date, right: Date) {
  return getStartOfDay(left) < getStartOfDay(right)
}

function DateTimeField({ id, value, onChange, placeholder }: DateTimeFieldProps) {
  const selectedDate = parseDateTime(value)
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getStartOfMonth(selectedDate ?? new Date())
  )
  const containerRef = useRef<HTMLDivElement | null>(null)
  const selectedTime = value.split("T")[1]?.slice(0, 5) || "10:00"
  const today = useMemo(() => getStartOfDay(new Date()), [])

  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth])
  const previousMonth = useMemo(
    () => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
    [visibleMonth]
  )
  const canGoPreviousMonth = getEndOfMonth(previousMonth) >= today
  const monthLabel = visibleMonth.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  })

  const displayValue = selectedDate
    ? selectedDate.toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : placeholder

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  const changeMonth = (offset: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1)
    )
  }

  const selectDay = (date: Date) => {
    if (isBeforeDay(date, today)) return
    onChange(formatDateTimeValue(date, selectedTime))
  }

  const selectTime = (time: string) => {
    onChange(formatDateTimeValue(selectedDate ?? new Date(), time))
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        id={id}
        variant="outline"
        className={cn(
          "h-10 w-full justify-start gap-2 px-3 text-left font-normal",
          !selectedDate && "text-muted-foreground"
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <CalendarDays className="size-4" />
        <span className="min-w-0 truncate">{displayValue}</span>
      </Button>

      {open && (
        <div className="absolute left-0 top-12 z-30 w-[min(21rem,calc(100vw-2rem))] rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Mes anterior"
              disabled={!canGoPreviousMonth}
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="text-sm font-medium capitalize">{monthLabel}</p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Mes siguiente"
              onClick={() => changeMonth(1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {weekdays.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const inMonth = day.getMonth() === visibleMonth.getMonth()
              const selected = isSameDay(selectedDate, day)
              const isToday = isSameDay(today, day)
              const isPast = isBeforeDay(day, today)

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isPast}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-md border border-transparent text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:hover:bg-transparent",
                    !inMonth && "text-muted-foreground/45",
                    isToday &&
                      !selected &&
                      "border-primary/50 bg-primary/10 font-medium text-primary",
                    isPast && "text-muted-foreground/30 line-through opacity-60",
                    selected && "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                  onClick={() => selectDay(day)}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4" />
              Hora
            </label>
            <Select
              value={selectedTime}
              onChange={(event) => selectTime(event.target.value)}
              className="sm:w-32"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Select>
          </div>

          {value && (
            <Button
              type="button"
              variant="ghost"
              className="mt-3 w-full justify-center text-muted-foreground"
              onClick={() => onChange("")}
            >
              <X className="size-4" />
              Quitar fecha
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export { DateTimeField }
