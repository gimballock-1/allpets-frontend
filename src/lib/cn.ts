import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge configured with our bespoke token scales. Without this it
 * treats custom font-size utilities (text-h3) as text-COLOR and drops the real
 * color (e.g. text-on-brand) — silently breaking themed text. Registering the
 * scales lets it tell color vs size/radius/family apart.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "body", "small"],
      radius: ["card", "pill"],
      font: ["display", "body", "accent"],
    },
  },
});

/**
 * Merge class names; later Tailwind utilities win over conflicting earlier ones
 * (so a `className` prop can override a component's defaults).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
