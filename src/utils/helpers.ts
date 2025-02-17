// src/utils/helpers.ts
export function cn(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(' ')
  }