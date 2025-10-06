const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkPassword() {
  console.log('🔐 Vérification mot de passe ivorraflorent1@gmail.com\n')

  try {
    const user = await prisma.user.findUnique({
      where: { email: 'ivorraflorent1@gmail.com' },
      select: {
        id: true,
        email: true,
        password: true,
        username: true,
        emailVerified: true
      }
    })

    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      return
    }

    console.log('✅ Utilisateur trouvé:')
    console.log('Email:', user.email)
    console.log('Username:', user.username)
    console.log('Email vérifié:', user.emailVerified)
    console.log('Hash du mot de passe:', user.password.substring(0, 30) + '...')
    console.log('')

    // Tester les mots de passe courants
    const commonPasswords = [
      'password',
      'Password123',
      'Fortnite95!!',
      'test123',
      'Test123!',
      '123456',
      'admin123'
    ]

    console.log('🧪 Test des mots de passe courants:\n')

    for (const pwd of commonPasswords) {
      const isMatch = await bcrypt.compare(pwd, user.password)
      if (isMatch) {
        console.log('✅ MOT DE PASSE TROUVÉ:', pwd)
        return
      } else {
        console.log('❌', pwd)
      }
    }

    console.log('\n⚠️ Aucun mot de passe courant trouvé.')
    console.log('\n💡 Solution: Réinitialiser le mot de passe à "Test123!"')

    // Proposer de réinitialiser
    const newPassword = 'Test123!'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerified: true
      }
    })

    console.log('✅ Mot de passe réinitialisé avec succès!\n')
    console.log('📧 Email: ivorraflorent1@gmail.com')
    console.log('🔑 Mot de passe: Test123!')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkPassword()
