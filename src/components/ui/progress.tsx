
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

// Define the props type including the custom indicatorClassName
interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string; // Add the custom prop type
}


const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps // Use the updated props type
>(({ className, value, indicatorClassName, ...props }, ref) => ( // Extract indicatorClassName from props
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props} // Pass remaining props (excluding indicatorClassName) to Root
  >
    <ProgressPrimitive.Indicator
      // Apply the indicatorClassName to the Indicator element
      className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)} 
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

