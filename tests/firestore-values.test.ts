import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { describe, expect, it } from 'vitest'

import { fromFirestoreValue, toFirestoreValue } from '../lib/firestore-values'

describe('Firestore value conversion', () => {
  it('keeps server-side increment transforms intact', () => {
    const increment = FieldValue.increment(1)

    expect(toFirestoreValue(increment)).toBe(increment)
  })

  it('normalizes legacy serialized increment operands', () => {
    expect(fromFirestoreValue({ operand: 3 })).toBe(3)
    expect(fromFirestoreValue({ clicks: { operand: 2 } })).toEqual({ clicks: 2 })
  })

  it('converts dates without flattening Firestore timestamps', () => {
    const date = new Date('2026-07-23T12:00:00.000Z')
    const stored = toFirestoreValue({ createdAt: date })

    expect(stored.createdAt).toBeInstanceOf(Timestamp)
    expect(fromFirestoreValue(stored)).toEqual({ createdAt: date })
  })
})
