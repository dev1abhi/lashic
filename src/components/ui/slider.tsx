// import * as React from "react"
// import * as SliderPrimitive from "@radix-ui/react-slider"

// import { cn } from "@/lib/utils"

// const Slider = React.forwardRef<
//   React.ElementRef<typeof SliderPrimitive.Root>,
//   React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
// >(({ className, ...props }, ref) => (
//   <SliderPrimitive.Root
//     ref={ref}
//     className={cn(
//       "relative flex w-full touch-none select-none items-center",
//       className
//     )}
//     {...props}
//   >
//     <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
//       <SliderPrimitive.Range className="absolute h-full bg-primary" />
//     </SliderPrimitive.Track>
//     <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
//   </SliderPrimitive.Root>
// ))
// Slider.displayName = SliderPrimitive.Root.displayName

// export { Slider }


import * as RadixSlider from "@radix-ui/react-slider";

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  max?: number;
  step?: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Slider({
  value,
  onValueChange,
  max = 100,
  step = 1,
  orientation = "horizontal",
  className = "",
}: SliderProps) {
  return (
    <RadixSlider.Root
      className={`relative flex touch-none select-none ${orientation === "vertical" ? "flex-col h-70 w-6" : "w-full h-2"} ${className}`}
      value={value}
      onValueChange={onValueChange}
      max={max}
      step={step}
      orientation={orientation}
    >
      <RadixSlider.Track className="bg-gray-600/30 relative grow rounded-full">
        <RadixSlider.Range
          className={`absolute bg-white rounded-full ${orientation === "vertical" ? "bottom-0 w-full" : "h-full"}`}
        />
      </RadixSlider.Track>
      <RadixSlider.Thumb className="block w-full h-4 rounded-full bg-white shadow focus:outline-none" />
    </RadixSlider.Root>
  );
}
