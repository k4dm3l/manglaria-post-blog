import { clsx, type ClassValue } from "clsx"
import slugify from "slugify";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
  const date = new Date().toISOString().split("T")[0];
  const slug = slugify(title, { lower: true, strict: true });
  return `${date}-${slug}`;
}