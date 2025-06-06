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

    // Check if locked
    if (protection.lockedUntil && protection.lockedUntil > new Date()) {
      return {
        success: false,
        error: 'Too many failed attempts. Try again later.',
        lockedUntil: protection.lockedUntil
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
      // Reset attempts on success
      await prisma.passwordProtection.update({
        where: { linkId },
        data: {
          attempts: 0,
          lockedUntil: null
        }
      })
      return { success: true }
    } else {
      // Increment attempts
      const newAttempts = protection.attempts + 1
      const shouldLock = newAttempts >= protection.maxAttempts
      
      const update: any = { attempts: newAttempts }
      if (shouldLock) {
        update.lockedUntil = new Date(Date.now() + protection.lockoutDuration * 1000)
      }

      await prisma.passwordProtection.update({
        where: { linkId },
        data: update
      })

      return {
        success: false,
        error: shouldLock 
          ? `Too many failed attempts. Locked for ${Math.round(protection.lockoutDuration / 60)} minutes.`
          : `Invalid password. ${protection.maxAttempts - newAttempts} attempts remaining.`,
        lockedUntil: shouldLock ? update.lockedUntil : undefined
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