import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createDemoLinks() {
  try {
    // Trouver l'utilisateur admin
    const admin = await prisma.user.findUnique({
      where: { email: "admin@linktracker.app" }
    });

    if (!admin) {
      console.log("❌ Utilisateur admin non trouvé");
      return;
    }

    // Mettre à jour le profil admin avec des infos de demo
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        bio: "gratuit pour les prochaines 24h 🔥⏰",
        instagramUrl: "https://instagram.com/laura",
        primaryColor: "#8b5cf6"
      }
    });

    // Créer un lien principal avec des sous-liens
    const mainLink = await prisma.link.create({
      data: {
        userId: admin.id,
        slug: "laura",
        title: "Laura",
        description: "Mes liens sociaux",
        isActive: true,
        order: 0
      }
    });

    // Créer des sous-liens
    await prisma.multiLink.createMany({
      data: [
        {
          parentLinkId: mainLink.id,
          title: "MON ONLY FANS GRATUIT 🥵😍",
          url: "https://example.com/onlyfans",
          icon: "🔥",
          order: 0
        },
        {
          parentLinkId: mainLink.id,
          title: "MON TELEGRAM PRIVE 😘💗",
          url: "https://example.com/telegram",
          icon: "💌",
          order: 1
        }
      ]
    });

    console.log("✅ Liens de démonstration créés!");
    console.log("🔗 Accédez à: http://localhost:3001/laura");

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoLinks();