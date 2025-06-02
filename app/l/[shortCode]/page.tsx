import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ProtectedLandingPage } from "@/components/ProtectedLandingPage";
import { CustomLandingPage } from "@/components/CustomLandingPage";
import { Metadata } from "next";
import type { LinkCustomization } from "@/types";

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { shortCode } = await params;

  const link = await prisma.link.findUnique({
    where: { shortCode },
    select: {
      title: true,
      customization: true,
    },
  });

  if (!link) {
    return {
      title: "Page non trouvée - LinkTracker",
    };
  }

  // Si le lien a une customisation, utiliser des métadonnées personnalisées
  if (link.customization) {
    const customization = link.customization as LinkCustomization;
    return {
      title: link.title || "Lien personnalisé",
      description: customization?.description || "Découvrez ce contenu partagé",
      robots: "noindex, nofollow",
      openGraph: {
        title: link.title || "Lien personnalisé",
        description:
          customization?.description || "Votre hub de liens personnel",
        type: "website",
      },
    };
  }

  // Métadonnées neutres pour éviter la détection des liens protégés
  return {
    title: "LinkTracker - Share your content",
    description: "Discover amazing content and connect with creators",
    robots: "noindex, nofollow",
    openGraph: {
      title: "LinkTracker",
      description: "Your personal link hub",
      type: "website",
    },
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { shortCode } = await params;

  const link = await prisma.link.findUnique({
    where: { shortCode },
    select: {
      id: true,
      title: true,
      url: true,
      shortCode: true,
      isDirect: true,
      customization: true,
      createdAt: true,
      updatedAt: true,
      clicks: true,
      userId: true,
    },
  });

  if (!link) {
    notFound();
  }

  // Si c'est un lien direct, rediriger immédiatement
  if (link.isDirect) {
    // Enregistrer le clic avant la redirection
    await prisma.click.create({
      data: {
        linkId: link.id,
        timestamp: new Date(),
      },
    });
    redirect(link.url);
  }

  // Si le lien a une customisation, utiliser la page personnalisée
  if (link.customization) {
    return <CustomLandingPage link={link} />;
  }

  // Sinon, utiliser la page protégée classique
  const encodedData = Buffer.from(
    JSON.stringify({
      id: link.id,
      url: link.url,
      timestamp: Date.now(),
    })
  ).toString("base64");

  return <ProtectedLandingPage link={link} encodedData={encodedData} />;
}
