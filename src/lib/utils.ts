import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateOTP(length: number = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export function formatFloorString(val: string | number | undefined | null): string {
  if (!val) return "Unassigned";
  const s = String(val).trim();
  
  if (/^(floor|block|wing|tower)\s/i.test(s)) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  if (/^\d+$/.test(s)) {
    return `Floor ${s}`;
  }
  if (/^[a-zA-Z]$/.test(s)) {
    return `Block ${s.toUpperCase()}`;
  }
  if (/^[a-zA-Z]+$/.test(s)) {
    return `Block ${s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}`;
  }
  return s;
}
