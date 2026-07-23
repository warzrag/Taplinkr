import { FieldValue, Timestamp } from 'firebase-admin/firestore'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function isLegacyIncrementOperand(value: unknown): value is { operand: number } {
  return isPlainObject(value)
    && Object.keys(value).length === 1
    && typeof value.operand === 'number'
    && Number.isFinite(value.operand)
}

export function fromFirestoreValue(value: unknown): any {
  if (value === null || value === undefined) return value
  if (value && typeof value === 'object' && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate()
  }
  if (isLegacyIncrementOperand(value)) return value.operand
  if (Array.isArray(value)) return value.map(fromFirestoreValue)
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, fromFirestoreValue(nestedValue)])
    )
  }
  return value
}

export function toFirestoreValue(value: unknown): any {
  if (value === null || value === undefined) return null
  if (value instanceof FieldValue || value instanceof Timestamp) return value
  if (value instanceof Date) return Timestamp.fromDate(value)
  if (Array.isArray(value)) return value.map(toFirestoreValue)
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, toFirestoreValue(nestedValue)])
    )
  }
  return value
}
