export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        {/* Préconnexion Supabase pour images */}
        <link rel="preconnect" href="https://dkwgorynhgnmldzbhhrb.supabase.co" />
        <link rel="dns-prefetch" href="https://dkwgorynhgnmldzbhhrb.supabase.co" />

        {/* CSS critique inline pour rendu instantané */}
        <style dangerouslySetInnerHTML={{__html: `
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;background:#111}
          img{display:block;max-width:100%}
        `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
