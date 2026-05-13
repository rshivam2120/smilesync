import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("rounded-full bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300", className)}>{children}</span>;
}
