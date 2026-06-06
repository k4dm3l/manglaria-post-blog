import { clsx, type ClassValue } from "clsx"
import slugify from "slugify";
import { Types } from "mongoose";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
  const date = new Date().toISOString().split("T")[0];
  const slug = slugify(title, { lower: true, strict: true });
  return `${date}-${slug}`;
}

export function isValidObjectId(value: string): boolean {
  return Types.ObjectId.isValid(value) && new Types.ObjectId(value).toString() === value;
}

export function buildSlugOrObjectIdFilter(identifier: string) {
  if (isValidObjectId(identifier)) {
    return {
      $or: [{ slug: identifier }, { _id: identifier }],
    };
  }

  return { slug: identifier };
}