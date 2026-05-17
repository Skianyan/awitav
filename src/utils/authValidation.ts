const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]{2,50}$/

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return emailRegex.test(normalizeEmail(email))
}

export function isValidGoogleEmail(email: string): boolean {
  return gmailRegex.test(normalizeEmail(email))
}

export function isValidName(name: string): boolean {
  const trimmed = name.trim()
  return trimmed.length >= 2 && nameRegex.test(trimmed)
}
