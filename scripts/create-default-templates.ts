import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createDefaultTemplates() {
  try {
    console.log("🎨 Création des templates par défaut...");

    // Template Business
    await prisma.template.create({
      data: {
        name: 'Business Pro',
        description: 'Template professionnel pour entreprises et freelances',
        category: 'business',
        layout: 'card',
        colors: JSON.stringify({
          primary: '#1e40af',
          secondary: '#3b82f6',
          background: '#ffffff',
          text: '#1f2937',
          accent: '#10b981'
        }),
        fonts: JSON.stringify({
          heading: 'Inter',
          body: 'Inter',
          size: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.5rem'
          }
        }),
        spacing: JSON.stringify({
          container: '2rem',
          section: '3rem',
          element: '1rem'
        }),
        animations: JSON.stringify({
          entrance: 'fadeInUp',
          hover: 'scale',
          transition: 'ease-in-out'
        }),
        isPremium: false,
        isPublic: true
      }
    });

    // Template Personal
    await prisma.template.create({
      data: {
        name: 'Personal Minimal',
        description: 'Design épuré pour profils personnels',
        category: 'personal',
        layout: 'minimal',
        colors: JSON.stringify({
          primary: '#6b7280',
          secondary: '#9ca3af',
          background: '#f9fafb',
          text: '#374151',
          accent: '#f59e0b'
        }),
        fonts: JSON.stringify({
          heading: 'Poppins',
          body: 'Poppins',
          size: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem'
          }
        }),
        spacing: JSON.stringify({
          container: '1.5rem',
          section: '2rem',
          element: '0.75rem'
        }),
        isPremium: false,
        isPublic: true
      }
    });

    // Template Social/Influencer
    await prisma.template.create({
      data: {
        name: 'Social Vibes',
        description: 'Parfait pour influenceurs et créateurs de contenu',
        category: 'social',
        layout: 'grid',
        colors: JSON.stringify({
          primary: '#ec4899',
          secondary: '#f97316',
          background: '#1f2937',
          text: '#ffffff',
          accent: '#8b5cf6'
        }),
        fonts: JSON.stringify({
          heading: 'Montserrat',
          body: 'Open Sans',
          size: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.25rem',
            xl: '2rem'
          }
        }),
        spacing: JSON.stringify({
          container: '1.5rem',
          section: '2rem',
          element: '1rem'
        }),
        animations: JSON.stringify({
          entrance: 'slideIn',
          hover: 'bounce',
          transition: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }),
        isPremium: false,
        isPublic: true
      }
    });

    // Template Creative
    await prisma.template.create({
      data: {
        name: 'Creative Studio',
        description: 'Design artistique pour artistes et créatifs',
        category: 'creative',
        layout: 'list',
        colors: JSON.stringify({
          primary: '#7c3aed',
          secondary: '#a855f7',
          background: '#0f0f23',
          text: '#e5e7eb',
          accent: '#06b6d4'
        }),
        fonts: JSON.stringify({
          heading: 'Playfair Display',
          body: 'Source Sans Pro',
          size: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.375rem',
            xl: '2.5rem'
          }
        }),
        spacing: JSON.stringify({
          container: '2rem',
          section: '3rem',
          element: '1.25rem'
        }),
        animations: JSON.stringify({
          entrance: 'fadeInScale',
          hover: 'glow',
          transition: 'ease-out'
        }),
        isPremium: false,
        isPublic: true
      }
    });

    // Template Premium Business
    await prisma.template.create({
      data: {
        name: 'Executive Elite',
        description: 'Template premium pour dirigeants et entreprises haut de gamme',
        category: 'business',
        layout: 'card',
        colors: JSON.stringify({
          primary: '#000000',
          secondary: '#374151',
          background: '#ffffff',
          text: '#111827',
          accent: '#d97706'
        }),
        fonts: JSON.stringify({
          heading: 'Merriweather',
          body: 'Lato',
          size: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.25rem',
            xl: '2rem'
          }
        }),
        spacing: JSON.stringify({
          container: '3rem',
          section: '4rem',
          element: '1.5rem'
        }),
        animations: JSON.stringify({
          entrance: 'slideFromLeft',
          hover: 'subtle',
          transition: 'ease-in-out'
        }),
        isPremium: true,
        isPublic: true
      }
    });

    console.log("✅ Templates par défaut créés avec succès!");
    
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        isPremium: true
      }
    });
    
    console.log("\n📋 Templates disponibles:");
    templates.forEach(template => {
      console.log(`- ${template.name} (${template.category})${template.isPremium ? ' 👑' : ''}`);
    });

  } catch (error) {
    console.error("❌ Erreur lors de la création des templates:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultTemplates();