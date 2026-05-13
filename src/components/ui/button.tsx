import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const styles =
    variant === "outline"
      ? "border border-slate-300 bg-transparent hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      : variant === "ghost"
        ? "hover:bg-slate-100 dark:hover:bg-slate-800"
        : "bg-cyan-500 text-white hover:bg-cyan-600";
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        styles,
        className
      )}
      {...props}
    />
  );
}
