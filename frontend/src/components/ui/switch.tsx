import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gray-300 data-[state=unchecked]:bg-gray-300 relative",
      className
    )}
    {...props}
    ref={ref}
  >
    <Sun className="absolute left-0.5 h-2.5 w-2.5 text-black transition-all duration-300 ease-in-out data-[state=checked]:opacity-0 data-[state=checked]:scale-75" />
    <Moon className="absolute right-0.5 h-2.5 w-2.5 text-black transition-all duration-300 ease-in-out data-[state=unchecked]:opacity-0 data-[state=unchecked]:scale-75" />
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 flex items-center justify-center"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

