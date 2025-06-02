import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateShortCode, isValidUrl } from "@/lib/utils";
import { checkUsageLimits, incrementLinkCount } from "@/lib/usage";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Les admins peuvent voir tous les liens, les users seulement les leurs
    const whereClause =
      session.user.role === "ADMIN" ? {} : { userId: session.user.id };

    const links = await prisma.link.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { clicksDetails: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error("Get links error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des liens" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier les limites d'usage
    const limits = await checkUsageLimits(session.user.id);

    if (!limits.canCreateLink) {
      return NextResponse.json(
        {
          error: "Limite de liens atteinte",
          code: "LINK_LIMIT_REACHED",
          usage: limits.usage,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, url, isDirect = false } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Titre et URL requis" },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    let shortCode = generateShortCode();
    let existingLink = await prisma.link.findUnique({ where: { shortCode } });

    while (existingLink) {
      shortCode = generateShortCode();
      existingLink = await prisma.link.findUnique({ where: { shortCode } });
    }

    const link = await prisma.link.create({
      data: {
        title,
        url,
        shortCode,
        isDirect,
        userId: session.user.id,
      },
    });

    // Incrémenter le compteur de liens
    await incrementLinkCount(session.user.id);

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Create link error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du lien" },
      { status: 500 }
    );
  }
}
