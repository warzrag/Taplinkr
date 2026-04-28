/**
 * Prisma-compatible adapter on top of Firestore.
 * Supports the patterns used in this codebase: findUnique, findFirst, findMany,
 * create, update, upsert, delete, count, include (manual hydration).
 *
 * Limitations vs real Prisma:
 *  - No transactions across collections beyond Firestore batch limits.
 *  - `where` supports: equality, in, notIn, contains (string), gt/gte/lt/lte, AND.
 *  - `OR` is emulated with parallel queries + dedupe.
 *  - `orderBy` accepts a single field or an array of objects.
 *  - `include` does N+1 lookups — fine for this app's data volumes.
 */
import { db, Timestamp, FieldValue } from '@/lib/firebase-admin'
import type { CollectionReference, Query, DocumentData, DocumentSnapshot } from 'firebase-admin/firestore'

// ------- Model → Firestore collection map (matches @@map in schema.prisma) -------
const COLL: Record<string, string> = {
  user: 'users',
  link: 'links',
  multiLink: 'multiLinks',
  click: 'clicks',
  folder: 'folders',
  file: 'files',
  analyticsEvent: 'analyticsEvents',
  analyticsSummary: 'analyticsSummary',
  template: 'templates',
  userProfile: 'userProfiles',
  userTheme: 'userThemes',
  passwordProtection: 'passwordProtections',
  passwordAttempt: 'passwordAttempts',
  linkSchedule: 'linkSchedules',
  scheduledJob: 'scheduledJobs',
  customDomain: 'customDomains',
  notification: 'notifications',
  notificationPreference: 'notificationPreferences',
  pushSubscription: 'pushSubscriptions',
  team: 'teams',
  teamInvitation: 'teamInvitations',
  teamTemplate: 'teamTemplates',
  teamAnalytics: 'teamAnalytics',
  verificationToken: 'verificationTokens',
  promoCode: 'promoCodes',
  promoRedemption: 'promoRedemptions',
  teamLinkHistory: 'teamLinkHistory',
  teamAuditLog: 'teamAuditLogs',
}

// Models that use a "natural" doc ID instead of the generated one
const DOC_ID_FIELD: Record<string, string> = {
  userProfile: 'userId',
  userTheme: 'userId',
  notificationPreference: 'userId',
}

// Relations: model → fieldName on parent → { collection, foreignKey, kind }
type RelationKind = 'one' | 'many'
type Relation = { coll: string; fk: string; kind: RelationKind; localKey?: string }
const RELATIONS: Record<string, Record<string, Relation>> = {
  user: {
    links: { coll: 'links', fk: 'userId', kind: 'many' },
    folders: { coll: 'folders', fk: 'userId', kind: 'many' },
    files: { coll: 'files', fk: 'userId', kind: 'many' },
    customDomains: { coll: 'customDomains', fk: 'userId', kind: 'many' },
    notifications: { coll: 'notifications', fk: 'userId', kind: 'many' },
    notificationPreferences: { coll: 'notificationPreferences', fk: 'userId', kind: 'one' },
    userProfile: { coll: 'userProfiles', fk: 'userId', kind: 'one' },
    userTheme: { coll: 'userThemes', fk: 'userId', kind: 'one' },
    pushSubscriptions: { coll: 'pushSubscriptions', fk: 'userId', kind: 'many' },
    templates: { coll: 'templates', fk: 'authorId', kind: 'many' },
    team: { coll: 'teams', fk: 'id', kind: 'one', localKey: 'teamId' },
    ownedTeam: { coll: 'teams', fk: 'ownerId', kind: 'one' },
    verificationTokens: { coll: 'verificationTokens', fk: 'userId', kind: 'many' },
  },
  link: {
    user: { coll: 'users', fk: 'id', kind: 'one', localKey: 'userId' },
    multiLinks: { coll: 'multiLinks', fk: 'parentLinkId', kind: 'many' },
    folder: { coll: 'folders', fk: 'id', kind: 'one', localKey: 'folderId' },
    team: { coll: 'teams', fk: 'id', kind: 'one', localKey: 'teamId' },
    linkSchedule: { coll: 'linkSchedules', fk: 'linkId', kind: 'one' },
    passwordProtection: { coll: 'passwordProtections', fk: 'linkId', kind: 'one' },
    passwordAttempts: { coll: 'passwordAttempts', fk: 'linkId', kind: 'many' },
    clickEvents: { coll: 'clicks', fk: 'linkId', kind: 'many' },
    analyticsEvents: { coll: 'analyticsEvents', fk: 'linkId', kind: 'many' },
    analyticsSummary: { coll: 'analyticsSummary', fk: 'linkId', kind: 'many' },
  },
  team: {
    owner: { coll: 'users', fk: 'id', kind: 'one', localKey: 'ownerId' },
    members: { coll: 'users', fk: 'teamId', kind: 'many' },
    links: { coll: 'links', fk: 'teamId', kind: 'many' },
    invitations: { coll: 'teamInvitations', fk: 'teamId', kind: 'many' },
    sharedTemplates: { coll: 'teamTemplates', fk: 'teamId', kind: 'many' },
    analytics: { coll: 'teamAnalytics', fk: 'teamId', kind: 'many' },
  },
  folder: {
    user: { coll: 'users', fk: 'id', kind: 'one', localKey: 'userId' },
    links: { coll: 'links', fk: 'folderId', kind: 'many' },
  },
  multiLink: {
    parentLink: { coll: 'links', fk: 'id', kind: 'one', localKey: 'parentLinkId' },
  },
  notification: {
    user: { coll: 'users', fk: 'id', kind: 'one', localKey: 'userId' },
  },
  passwordProtection: {
    link: { coll: 'links', fk: 'id', kind: 'one', localKey: 'linkId' },
    user: { coll: 'users', fk: 'id', kind: 'one', localKey: 'userId' },
  },
  linkSchedule: {
    link: { coll: 'links', fk: 'id', kind: 'one', localKey: 'linkId' },
    user: { coll: 'users', fk: 'id', kind: 'one', localKey: 'userId' },
    scheduledJobs: { coll: 'scheduledJobs', fk: 'scheduleId', kind: 'many' },
  },
  scheduledJob: {
    schedule: { coll: 'linkSchedules', fk: 'id', kind: 'one', localKey: 'scheduleId' },
  },
  click: {
    link: { coll: 'links', fk: 'id', kind: 'one', localKey: 'linkId' },
    user: { coll: 'users', fk: 'id', kind: 'one', localKey: 'userId' },
  },
  analyticsEvent: {
    link: { coll: 'links', fk: 'id', kind: 'one', localKey: 'linkId' },
    user: { coll: 'users', fk: 'id', kind: 'one', localKey: 'userId' },
  },
  teamAuditLog: {
    team: { coll: 'teams', fk: 'id', kind: 'one', localKey: 'teamId' },
    user: { coll: 'users', fk: 'id', kind: 'one', localKey: 'userId' },
    link: { coll: 'links', fk: 'id', kind: 'one', localKey: 'linkId' },
  },
  teamLinkHistory: {
    team: { coll: 'teams', fk: 'id', kind: 'one', localKey: 'teamId' },
    user: { coll: 'users', fk: 'id', kind: 'one', localKey: 'userId' },
    link: { coll: 'links', fk: 'id', kind: 'one', localKey: 'linkId' },
  },
  teamInvitation: {
    team: { coll: 'teams', fk: 'id', kind: 'one', localKey: 'teamId' },
    invitedBy: { coll: 'users', fk: 'id', kind: 'one', localKey: 'invitedById' },
  },
  pushSubscription: {
    user: { coll: 'users', fk: 'id', kind: 'one', localKey: 'userId' },
  },
}

// ------- ID generation (CUID-like, compact) -------
function genId(): string {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 14).padEnd(12, '0')
}

// ------- Convert Firestore Timestamps to JS Dates and back -------
function fromFirestore<T = any>(data: DocumentData | undefined): T | null {
  if (!data) return null
  const out: any = {}
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === 'object' && (v as any).toDate) out[k] = (v as any).toDate()
    else out[k] = v
  }
  return out as T
}
function snapToObj<T = any>(snap: DocumentSnapshot): T | null {
  if (!snap.exists) return null
  const data = fromFirestore<any>(snap.data())
  if (data && !data.id) data.id = snap.id
  return data as T
}
function toFirestore(data: any): any {
  if (data === null || data === undefined) return null
  if (data instanceof Date) return Timestamp.fromDate(data)
  if (Array.isArray(data)) return data.map(toFirestore)
  if (typeof data === 'object') {
    const out: any = {}
    for (const [k, v] of Object.entries(data)) out[k] = toFirestore(v)
    return out
  }
  return data
}

// ------- Where clause translator -------
function applyWhere(q: Query, where: any): Query {
  if (!where || typeof where !== 'object') return q
  for (const [field, value] of Object.entries(where)) {
    if (field === 'AND' && Array.isArray(value)) {
      for (const sub of value) q = applyWhere(q, sub)
      continue
    }
    if (field === 'OR' || field === 'NOT') continue // handled by caller if needed
    if (value === null || value === undefined) {
      q = q.where(field, '==', null)
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      const v: any = value
      if ('equals' in v) q = q.where(field, '==', v.equals)
      if ('not' in v) q = q.where(field, '!=', v.not)
      if ('in' in v && Array.isArray(v.in)) {
        if (v.in.length === 0) q = q.where(field, '==', '__never__')
        else q = q.where(field, 'in', v.in.slice(0, 30))
      }
      if ('notIn' in v && Array.isArray(v.notIn)) q = q.where(field, 'not-in', v.notIn.slice(0, 10))
      if ('gt' in v) q = q.where(field, '>', toFirestore(v.gt))
      if ('gte' in v) q = q.where(field, '>=', toFirestore(v.gte))
      if ('lt' in v) q = q.where(field, '<', toFirestore(v.lt))
      if ('lte' in v) q = q.where(field, '<=', toFirestore(v.lte))
      if ('contains' in v) {
        // Firestore has no contains; closest is range query for prefix only
        // We do client-side filtering via a marker — mark for post-filter
        ;(q as any).__contains = (q as any).__contains || []
        ;(q as any).__contains.push({ field, value: v.contains, mode: v.mode })
      }
    } else {
      q = q.where(field, '==', toFirestore(value))
    }
  }
  return q
}

function findLargeInFilter(where: any): { field: string; values: any[] } | null {
  if (!where || typeof where !== 'object') return null
  for (const [field, value] of Object.entries(where)) {
    if (field === 'AND' && Array.isArray(value)) {
      for (const sub of value) {
        const found = findLargeInFilter(sub)
        if (found) return found
      }
      continue
    }
    if (field === 'OR' || field === 'NOT') continue
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      const v: any = value
      if (Array.isArray(v.in) && v.in.length > 30) return { field, values: v.in }
    }
  }
  return null
}

function replaceLargeInFilter(where: any, field: string, values: any[]): any {
  if (!where || typeof where !== 'object') return where
  const out: any = Array.isArray(where) ? [] : {}
  for (const [key, value] of Object.entries(where)) {
    if (key === 'AND' && Array.isArray(value)) {
      out[key] = value.map(sub => replaceLargeInFilter(sub, field, values))
    } else if (key === field && value && typeof value === 'object' && !(value instanceof Date) && Array.isArray((value as any).in)) {
      out[key] = { ...(value as any), in: values }
    } else {
      out[key] = value
    }
  }
  return out
}

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size))
  return chunks
}

// ------- Build query -------
async function runQuery(coll: string, args: any = {}): Promise<any[]> {
  let q: Query = db.collection(coll)

  // Handle OR by running parallel queries and merging
  if (args.where?.OR && Array.isArray(args.where.OR)) {
    const baseWhere = { ...args.where }
    delete baseWhere.OR
    const results = await Promise.all(args.where.OR.map((or: any) =>
      runQuery(coll, { ...args, where: { ...baseWhere, ...or } })
    ))
    const seen = new Set<string>()
    const merged: any[] = []
    for (const arr of results) for (const r of arr) {
      if (!seen.has(r.id)) { seen.add(r.id); merged.push(r) }
    }
    return applySortLimit(merged, args)
  }

  const largeIn = findLargeInFilter(args.where)
  if (largeIn) {
    const results = await Promise.all(chunk(largeIn.values, 30).map(values =>
      runQuery(coll, { ...args, where: replaceLargeInFilter(args.where, largeIn.field, values) })
    ))
    const seen = new Set<string>()
    const merged: any[] = []
    for (const arr of results) for (const r of arr) {
      if (!seen.has(r.id)) { seen.add(r.id); merged.push(r) }
    }
    return applySortLimit(merged, args)
  }

  if (args.where) q = applyWhere(q, args.where)

  if (args.orderBy) {
    const orders = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy]
    for (const o of orders) {
      if (typeof o === 'object' && o !== null) {
        const [field, dir] = Object.entries(o)[0] as [string, 'asc' | 'desc']
        try { q = q.orderBy(field, dir) } catch {}
      }
    }
  }
  if (args.skip) q = q.offset(args.skip)
  if (args.take) q = q.limit(args.take)

  const snap = await q.get()
  let results = snap.docs.map(d => snapToObj(d)).filter(Boolean) as any[]

  // Post-filter for `contains` if any
  const contains = (q as any).__contains
  if (contains?.length) {
    results = results.filter(r => contains.every((c: any) => {
      const v = r[c.field]
      if (typeof v !== 'string') return false
      return c.mode === 'insensitive'
        ? v.toLowerCase().includes(String(c.value).toLowerCase())
        : v.includes(String(c.value))
    }))
  }
  return results
}

function applySortLimit(arr: any[], args: any): any[] {
  if (args.orderBy) {
    const orders = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy]
    arr.sort((a, b) => {
      for (const o of orders) {
        const [f, d] = Object.entries(o)[0] as [string, 'asc' | 'desc']
        const av = a[f], bv = b[f]
        if (av === bv) continue
        const cmp = av < bv ? -1 : 1
        return d === 'desc' ? -cmp : cmp
      }
      return 0
    })
  }
  if (args.skip) arr = arr.slice(args.skip)
  if (args.take) arr = arr.slice(0, args.take)
  return arr
}

// ------- Hydrate `include` (manual joins) -------
async function hydrateIncludes(model: string, items: any[], include: any): Promise<void> {
  if (!include || !items.length) return
  const rels = RELATIONS[model] || {}
  for (const [field, sub] of Object.entries(include)) {
    if (!sub) continue
    const rel = rels[field]
    if (!rel) continue
    const subInclude = typeof sub === 'object' ? (sub as any).include : null
    const subWhere = typeof sub === 'object' ? (sub as any).where : null
    const subOrder = typeof sub === 'object' ? (sub as any).orderBy : null

    if (rel.kind === 'one') {
      const localKey = rel.localKey || rel.fk
      // For relations like user → team via teamId, fetch by id
      if (rel.fk === 'id' && rel.localKey) {
        const ids = Array.from(new Set(items.map(it => it[localKey]).filter(Boolean)))
        const docs = await Promise.all(ids.map(id => db.collection(rel.coll).doc(String(id)).get()))
        const map = new Map(docs.filter(d => d.exists).map(d => [d.id, snapToObj(d)]))
        for (const it of items) it[field] = map.get(it[localKey]) || null
      } else {
        // one-to-one inverse: fetch by foreignKey
        for (const it of items) {
          const r = await runQuery(rel.coll, { where: { [rel.fk]: it.id }, take: 1 })
          it[field] = r[0] || null
        }
      }
    } else {
      // many
      for (const it of items) {
        const args: any = { where: { [rel.fk]: it.id } }
        if (subWhere) args.where = { ...args.where, ...subWhere }
        if (subOrder) args.orderBy = subOrder
        const r = await runQuery(rel.coll, args)
        if (subInclude) {
          // recurse - need to find sub-model name by collection
          const subModel = Object.keys(COLL).find(k => COLL[k] === rel.coll) || ''
          await hydrateIncludes(subModel, r, subInclude)
        }
        it[field] = r
      }
    }
  }
}

// ------- Model proxy -------
function modelProxy(model: string) {
  const collection = COLL[model]
  if (!collection) throw new Error(`Unknown model: ${model}`)
  const idField = DOC_ID_FIELD[model]

  function docIdFromData(data: any): string {
    if (idField && data[idField]) return String(data[idField])
    return data.id || genId()
  }

  return {
    async findUnique(args: { where: any; include?: any; select?: any }) {
      const where = args.where
      // by id
      if (where.id) {
        const snap = await db.collection(collection).doc(String(where.id)).get()
        const obj = snapToObj(snap)
        if (obj && args.include) await hydrateIncludes(model, [obj], args.include)
        return obj
      }
      // by natural unique field (email, slug, etc.) — query then take first
      const r = await runQuery(collection, { where, take: 1 })
      if (r[0] && args.include) await hydrateIncludes(model, [r[0]], args.include)
      return r[0] || null
    },
    async findFirst(args: any = {}) {
      const r = await runQuery(collection, { ...args, take: 1 })
      if (r[0] && args.include) await hydrateIncludes(model, [r[0]], args.include)
      return r[0] || null
    },
    async findMany(args: any = {}) {
      const r = await runQuery(collection, args)
      if (args.include) await hydrateIncludes(model, r, args.include)
      return r
    },
    async create(args: { data: any; include?: any }) {
      const now = new Date()
      const data: any = { createdAt: now, updatedAt: now, ...args.data }
      const id = docIdFromData(data)
      data.id = id
      await db.collection(collection).doc(id).set(toFirestore(data))
      const obj = { ...data }
      if (args.include) await hydrateIncludes(model, [obj], args.include)
      return obj
    },
    async update(args: { where: any; data: any; include?: any }) {
      let id = args.where.id
      if (!id) {
        const r = await runQuery(collection, { where: args.where, take: 1 })
        if (!r[0]) throw new Error(`Record to update not found in ${model}`)
        id = r[0].id
      }
      const data: any = { ...args.data, updatedAt: new Date() }
      // Handle Prisma-style { increment: N } / { decrement: N }
      for (const [k, v] of Object.entries(data)) {
        if (v && typeof v === 'object' && !(v instanceof Date)) {
          const vv: any = v
          if ('increment' in vv) data[k] = FieldValue.increment(vv.increment)
          else if ('decrement' in vv) data[k] = FieldValue.increment(-vv.decrement)
          else if ('set' in vv) data[k] = vv.set
        }
      }
      await db.collection(collection).doc(String(id)).set(toFirestore(data), { merge: true })
      const fresh = snapToObj(await db.collection(collection).doc(String(id)).get())
      if (fresh && args.include) await hydrateIncludes(model, [fresh], args.include)
      return fresh
    },
    async upsert(args: { where: any; create: any; update: any; include?: any }) {
      const found = await this.findUnique({ where: args.where })
      if (found) return this.update({ where: { id: found.id }, data: args.update, include: args.include })
      return this.create({ data: { ...args.create, ...args.where }, include: args.include })
    },
    async delete(args: { where: any }) {
      let id = args.where.id
      if (!id) {
        const r = await runQuery(collection, { where: args.where, take: 1 })
        if (!r[0]) throw new Error(`Record to delete not found in ${model}`)
        id = r[0].id
      }
      const before = snapToObj(await db.collection(collection).doc(String(id)).get())
      await db.collection(collection).doc(String(id)).delete()
      return before
    },
    async deleteMany(args: { where?: any } = {}) {
      const r = await runQuery(collection, { where: args.where || {} })
      const batch = db.batch()
      r.forEach(d => batch.delete(db.collection(collection).doc(String(d.id))))
      if (r.length) await batch.commit()
      return { count: r.length }
    },
    async updateMany(args: { where?: any; data: any }) {
      const r = await runQuery(collection, { where: args.where || {} })
      const batch = db.batch()
      r.forEach(d => batch.set(db.collection(collection).doc(String(d.id)), toFirestore({ ...args.data, updatedAt: new Date() }), { merge: true }))
      if (r.length) await batch.commit()
      return { count: r.length }
    },
    async count(args: any = {}) {
      const r = await runQuery(collection, args)
      return r.length
    },
    async createMany(args: { data: any[] }) {
      const now = new Date()
      const batch = db.batch()
      args.data.forEach(d => {
        const data = { createdAt: now, updatedAt: now, ...d }
        const id = docIdFromData(data)
        data.id = id
        batch.set(db.collection(collection).doc(id), toFirestore(data))
      })
      if (args.data.length) await batch.commit()
      return { count: args.data.length }
    },
    async aggregate(args: any = {}) {
      const r = await runQuery(collection, { where: args.where || {} })
      const out: any = {}
      if (args._count) {
        if (args._count === true) out._count = r.length
        else if (typeof args._count === 'object') {
          out._count = {}
          for (const f of Object.keys(args._count)) {
            out._count[f] = r.filter(x => x[f] !== null && x[f] !== undefined).length
          }
        }
      }
      if (args._sum) {
        out._sum = {}
        for (const f of Object.keys(args._sum)) {
          out._sum[f] = r.reduce((s, x) => s + (Number(x[f]) || 0), 0)
        }
      }
      if (args._avg) {
        out._avg = {}
        for (const f of Object.keys(args._avg)) {
          const nums = r.map(x => Number(x[f])).filter(n => !isNaN(n))
          out._avg[f] = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null
        }
      }
      if (args._min) {
        out._min = {}
        for (const f of Object.keys(args._min)) out._min[f] = r.length ? r.reduce((m, x) => x[f] < m ? x[f] : m, r[0][f]) : null
      }
      if (args._max) {
        out._max = {}
        for (const f of Object.keys(args._max)) out._max[f] = r.length ? r.reduce((m, x) => x[f] > m ? x[f] : m, r[0][f]) : null
      }
      return out
    },
    async groupBy(args: any) {
      const r = await runQuery(collection, { where: args.where || {} })
      const by: string[] = Array.isArray(args.by) ? args.by : [args.by]
      const groups = new Map<string, any[]>()
      for (const item of r) {
        const key = by.map(f => JSON.stringify(item[f] ?? null)).join('|')
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(item)
      }
      const result: any[] = []
      for (const [, items] of groups) {
        const out: any = {}
        for (const f of by) out[f] = items[0][f]
        if (args._count) {
          if (args._count === true) out._count = items.length
          else if (typeof args._count === 'object') {
            out._count = {}
            for (const f of Object.keys(args._count)) {
              out._count[f] = items.filter(x => x[f] !== null && x[f] !== undefined).length
            }
          }
        }
        if (args._sum) {
          out._sum = {}
          for (const f of Object.keys(args._sum)) out._sum[f] = items.reduce((s, x) => s + (Number(x[f]) || 0), 0)
        }
        result.push(out)
      }
      if (args.orderBy) {
        const orders = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy]
        result.sort((a, b) => {
          for (const o of orders) {
            const [f, rawDir] = Object.entries(o)[0] as [string, any]
            let av = a[f] as any
            let bv = b[f] as any
            let dir: 'asc' | 'desc' = rawDir === 'desc' ? 'desc' : 'asc'
            if (rawDir && typeof rawDir === 'object') {
              const [nestedField, nestedDir] = Object.entries(rawDir)[0] as [string, 'asc' | 'desc']
              av = av?.[nestedField]
              bv = bv?.[nestedField]
              dir = nestedDir === 'desc' ? 'desc' : 'asc'
            } else if (typeof av === 'object') {
              av = Object.values(av)[0]
              bv = Object.values(bv)[0]
            }
            if (av === bv) continue
            const cmp = av < bv ? -1 : 1
            return dir === 'desc' ? -cmp : cmp
          }
          return 0
        })
      }
      if (args.take) return result.slice(0, args.take)
      return result
    },
  }
}

// ------- Build the prisma-shaped client -------
const adapter: any = {}
for (const m of Object.keys(COLL)) adapter[m] = modelProxy(m)

// $transaction: best-effort sequential execution (no real atomicity across collections)
adapter.$transaction = async (arg: any) => {
  if (typeof arg === 'function') return arg(adapter)
  if (Array.isArray(arg)) return Promise.all(arg)
  return arg
}
adapter.$connect = async () => {}
adapter.$disconnect = async () => {}
adapter.$queryRaw = async () => { throw new Error('$queryRaw not supported on Firestore') }
adapter.$executeRaw = async () => { throw new Error('$executeRaw not supported on Firestore') }

export const prisma = adapter
export default adapter
