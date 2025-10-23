"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export interface LabelProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "htmlFor"> {
  children: React.ReactNode;
  htmlFor: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, htmlFor, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-slate-700", className)}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </label>
  ),
);
Label.displayName = "Label";

export { Label };
