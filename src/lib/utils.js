import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names safely. Lets you write conditional Tailwind classes
 * without worrying about duplicates or conflicts.
 *   cn("p-4", isActive && "bg-primary", "p-6")  ->  "bg-primary p-6"
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}