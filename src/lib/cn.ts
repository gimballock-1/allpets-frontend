import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names, with later Tailwind utilities winning over conflicting
 * earlier ones (so a `className` prop can override a component's defaults).
 * Note: tailwind-merge resolves standard utility groups; our bespoke token
 * utilities (e.g. rounded-card vs rounded-pill) aren't registered, so prefer
 * component variants/props over class overrides for those.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
