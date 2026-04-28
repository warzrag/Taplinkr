export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>

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
