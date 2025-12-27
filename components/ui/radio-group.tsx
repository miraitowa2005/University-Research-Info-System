import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { twMerge } from "tailwind-merge";

const RadioGroup = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>) => (
  <RadioGroupPrimitive.Root className={twMerge("grid gap-2", className)} {...props} />
);

const RadioGroupItem = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>) => (
  <RadioGroupPrimitive.Item
    className={twMerge(
      "aspect-square h-4 w-4 rounded-full border border-slate-300 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <span className="h-2 w-2 rounded-full bg-indigo-600" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
);

export { RadioGroup, RadioGroupItem };

