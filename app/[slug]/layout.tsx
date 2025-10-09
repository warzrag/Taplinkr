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
        {/* 🔥 SCRIPT SYNCHRONE - S'EXÉCUTE IMMÉDIATEMENT AVANT REACT */}
        <script dangerouslySetInnerHTML={{__html: `
          (function(){
            var ua=navigator.userAgent||'';
            if(ua.indexOf('Instagram')===-1&&ua.indexOf('FBAN')===-1&&ua.indexOf('FBAV')===-1&&ua.indexOf('TikTok')===-1)return;
            var isIOS=/iPad|iPhone|iPod/.test(ua);
            var isAndroid=/Android/.test(ua);
            var url=window.location.href;
            setTimeout(function(){
              if(isIOS){
                window.location.href='x-safari-https://'+url.replace(/^https?:\\/\\//,'');
              }else if(isAndroid){
                var host=url.replace(/^https?:\\/\\//,'').replace(/\\/$/,'');
                window.location.href='intent://'+host+'#Intent;scheme=https;action=android.intent.action.VIEW;end';
              }
            },200);
          })();
        `}} />
        {children}
      </body>
    </html>
  )
}
