import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-slate-300/60 bg-transparent px-3 text-sm outline-none ring-cyan-500 transition focus:ring-2 dark:border-slate-700",
        className
      )}
      {...props}
    />
  );
}
