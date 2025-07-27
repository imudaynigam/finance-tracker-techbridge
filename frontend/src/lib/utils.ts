import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to safely parse transaction amounts
export function parseAmount(amount: number | string): number {
  if (typeof amount === 'number') {
    return amount;
  }
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
