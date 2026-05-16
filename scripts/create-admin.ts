import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminEmail = "admin@linktracker.app";
    const adminPassword = process.env.ADMIN_PASSWORD || ""; // Mot de passe par défaut - À CHANGER EN PRODUCTION

    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { email: true },
    });

    if (existingAdmin) {
      console.log("❗ L'administrateur existe déjà");
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Créer l'utilisateur admin avec seulement les champs essentiels
    await prisma.user.create({
      data: {
        name: "Administrateur",
        email: adminEmail,
        username: "admin",
        password: hashedPassword,
      },
    });

    console.log("✅ Administrateur créé avec succès!");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Mot de passe:", adminPassword);
    console.log(
      "⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!"
    );
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
