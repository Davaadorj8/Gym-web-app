import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRegId(): string {
  const code = Math.floor(1000 + Math.random() * 9000);
  return `ARC-${code}`;
}

export function generateMemberId(): string {
  return `mem-${Date.now()}`;
}

export function getDaysPending(registeredAtIso: string): {
  daysPending: number;
  isBlocked: boolean;
} {
  const regTimestamp = new Date(registeredAtIso).getTime();
  const now = Date.now();
  const daysPending = Math.max(0, Math.floor((now - regTimestamp) / (1000 * 60 * 60 * 24)));
  const isBlocked = daysPending > 3;
  return { daysPending, isBlocked };
}
