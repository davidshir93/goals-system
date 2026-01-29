import * as React from "react"
import { cn } from "@/lib/utils"
import { getTextColorForBg } from "@/utils/colors"

export interface SliderProps {
  value?: number[]
  defaultValue?: number[]
  max?: number
  step?: number
  doneColor?: string
  isSummary?: boolean
  disabled?: boolean
  compact?: boolean
  className?: string
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, doneColor = "#000", isSummary, disabled, compact, max = 100, ...props }, ref) => {
    const currentValue = props.value?.[0] ?? props.defaultValue?.[0] ?? 0
    const percentage = max > 0 ? (currentValue / max) * 100 : 0
    const isComplete = currentValue >= max

    const handleDecrement = () => {
      if (disabled || currentValue <= 0) return
      props.onValueChange?.([currentValue - 1])
    }

    const handleIncrement = () => {
      if (disabled || currentValue >= max) return
      props.onValueChange?.([currentValue + 1])
    }

    const textColor = getTextColorForBg(doneColor)

    const buttonSize = compact ? "h-8 w-8" : "h-10 w-10"
    const barHeight = compact ? "h-8" : "h-10"
    const textSize = compact ? "text-sm" : "text-xl"
    const iconSize = compact ? 16 : 20

    return (
      <div
        ref={ref}
        dir="ltr"
        className={cn(
          "flex w-full items-center gap-2",
          compact && "gap-1.5",
          className
        )}
      >
        {/* Minus Button */}
        {!disabled && (
          <button
            type="button"
            onClick={handleDecrement}
            disabled={currentValue <= 0}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer",
              buttonSize
            )}
            aria-label="Decrease progress"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/>
            </svg>
          </button>
        )}

        {/* Progress Bar */}
        <div className={cn("relative flex-1 overflow-hidden rounded-full bg-muted flex items-center justify-center", barHeight)}>
          <div
            className="absolute left-0 h-full transition-all duration-150"
            style={{
              width: `${percentage}%`,
              backgroundColor: doneColor
            }}
          />
          <p
            className={cn("font-bold text-center z-10 relative", textSize)}
            style={{ color: percentage > 40 ? textColor : undefined }}
          >
            {currentValue}
            {!isSummary ? ` / ${max}` : '%'}
            {isComplete && ' 🏆'}
          </p>
        </div>

        {/* Plus Button */}
        {!disabled && (
          <button
            type="button"
            onClick={handleIncrement}
            disabled={currentValue >= max}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer",
              buttonSize
            )}
            aria-label="Increase progress"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
          </button>
        )}
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
