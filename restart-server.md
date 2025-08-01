# Instructions pour redémarrer le serveur

Le serveur Next.js doit être redémarré pour prendre en compte les nouveaux champs de la base de données.

## Étapes :

1. Arrêtez le serveur de développement (Ctrl+C dans le terminal)
2. Relancez le serveur avec : `npm run dev`

## Raison :

Les nouveaux champs ont été ajoutés à la base de données :
- instagramUrl
- tiktokUrl  
- twitterUrl
- youtubeUrl

Mais le client Prisma en mémoire n'a pas été mis à jour.