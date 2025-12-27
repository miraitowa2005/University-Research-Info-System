import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { twMerge } from "tailwind-merge";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

function PopoverContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Content
      className={twMerge(
        "z-50 rounded-md border border-slate-200 bg-white p-3 shadow-md outline-none",
        className
      )}
      {...props}
    />
  );
}

export { Popover, PopoverTrigger, PopoverContent };

