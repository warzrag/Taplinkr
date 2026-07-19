import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export class PasswordProtectionService {
  async setPassword(linkId: string, userId: string, password: string, hint?: string) {
    const hashedPassword = await bcrypt.hash(password, 12)
    
    return await prisma.passwordProtection.upsert({
      where: { linkId },
      update: {
        password: hashedPassword,
        hint,
        attempts: 0,
        lockedUntil: null
      },
      create: {
        linkId,
        userId,
        password: hashedPassword,
        hint
      }
    })
  }

  async verifyPassword(linkId: string, password: string, ip: string): Promise<{
    success: boolean
    error?: string
    lockedUntil?: Date
  }> {
    const protection = await prisma.passwordProtection.findUnique({
      where: { linkId }
    })

    if (!protection) {
      return { success: true } // No protection set
    }

    const windowStart = new Date(Date.now() - protection.lockoutDuration * 1000)
    const failedAttempts = await prisma.passwordAttempt.count({
      where: { linkId, ip, success: false, createdAt: { gte: windowStart } }
    })

    if (failedAttempts >= protection.maxAttempts) {
      return {
        success: false,
        error: 'Too many failed attempts. Try again later.',
        lockedUntil: new Date(Date.now() + protection.lockoutDuration * 1000)
      }
    }

    // Check password
    const isValid = await bcrypt.compare(password, protection.password)
    
    // Record attempt
    await prisma.passwordAttempt.create({
      data: {
        linkId,
        ip,
        success: isValid
      }
    })

    if (isValid) {
      return { success: true }
    } else {
      const newAttempts = failedAttempts + 1
      const shouldLock = newAttempts >= protection.maxAttempts
      const lockedUntil = shouldLock
        ? new Date(Date.now() + protection.lockoutDuration * 1000)
        : undefined

      return {
        success: false,
        error: shouldLock 
          ? `Too many failed attempts. Locked for ${Math.round(protection.lockoutDuration / 60)} minutes.`
          : `Invalid password. ${protection.maxAttempts - newAttempts} attempts remaining.`,
        lockedUntil
      }
    }
  }

  async removePassword(linkId: string, userId: string) {
    const protection = await prisma.passwordProtection.findUnique({
      where: { linkId }
    })

    if (protection && protection.userId === userId) {
      await prisma.passwordProtection.delete({
        where: { linkId }
      })
      return true
    }
    return false
  }

  async getProtectionInfo(linkId: string) {
    const protection = await prisma.passwordProtection.findUnique({
      where: { linkId },
      select: {
        hint: true,
        maxAttempts: true,
        lockoutDuration: true,
        attempts: true,
        lockedUntil: true
      }
    })

    return protection
  }
}

export const passwordProtectionService = new PasswordProtectionService()
