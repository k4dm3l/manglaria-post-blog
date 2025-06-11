import { ValidationError } from '@/types/api';

export type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: ValidationRules<T>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [field, fieldRules] of Object.entries(rules)) {
    if (!fieldRules) continue;

    const value = data[field];

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        errors.push({
          field,
          message: rule.message,
        });
        break; // Stop after first error for this field
      }
    }
  }

  return errors;
}

// Common validation rules
export const rules = {
  required: (message = 'This field is required'): ValidationRule<any> => ({
    validate: (value) => value !== undefined && value !== null && value !== '',
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length >= min,
    message: message ?? `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length <= max,
    message: message ?? `Must be at most ${max} characters`,
  }),

  email: (message = 'Invalid email address'): ValidationRule<string> => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  url: (message = 'Invalid URL'): ValidationRule<string> => ({
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value) => regex.test(value),
    message,
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value >= min,
    message: message ?? `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value <= max,
    message: message ?? `Must be at most ${max}`,
  }),
}; 