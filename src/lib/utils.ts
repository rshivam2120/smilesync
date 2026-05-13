import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fakeDelay(ms = 600) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
