const links = [
  {
    title: "🔥 Accéder au contenu exclusif",
    url: "https://onlyfans.com/lau_bpt/c3",
    color: "#ff4c98",
  },
  {
    title: "📸 Mon Instagram",
    url: "https://instagram.com/",
    color: "#e1306c",
  },
  {
    title: "🎥 Mon TikTok",
    url: "https://tiktok.com/",
    color: "#000000",
  },
  {
    title: "💬 Mon Telegram",
    url: "https://t.me/",
    color: "#229ED9",
  },
];

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f0f',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Bienvenue sur mon LinkTree</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '400px' }}>
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '15px',
              backgroundColor: link.color,
              borderRadius: '10px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: '16px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            }}
          >
            {link.title}
          </a>
        ))}
      </div>
    </div>
  );
}
