import * as React from "react";
import { twMerge } from "tailwind-merge";

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={twMerge("text-sm font-medium text-slate-700", className)} {...props} />;
}

export { Label };

