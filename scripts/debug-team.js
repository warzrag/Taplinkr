// Script de débogage pour voir l'état des équipes
// Usage: node scripts/debug-team.js [email]

const email = process.argv[2]

if (!email) {
  console.log('Usage: node scripts/debug-team.js votre@email.com')
  process.exit(1)
}

console.log(`\nRecherche des informations pour: ${email}\n`)

// Simuler les requêtes qui seraient faites
const debugInfo = `
=== INFORMATIONS DE DEBUG ===

Pour diagnostiquer le problème d'invitation d'équipe, vérifiez :

1. Dans la console du navigateur (F12) :
   - Ouvrez l'onglet "Network" (Réseau)
   - Essayez d'inviter quelqu'un
   - Regardez la requête vers "/api/teams/invite"
   - Cliquez dessus et vérifiez :
     * L'onglet "Response" pour voir l'erreur exacte
     * L'onglet "Request Payload" pour voir ce qui est envoyé

2. Erreurs possibles :
   - "Aucune équipe trouvée" = Vous n'êtes pas propriétaire d'une équipe
   - "Limite d'équipe atteinte" = Votre plan ne permet pas plus de membres
   - "Email déjà invité" = Cette personne a déjà une invitation en attente

3. Vérifications à faire :
   - Êtes-vous bien le propriétaire de "Equipe flo" ?
   - Avez-vous un plan Premium/Pro actif ?
   - L'email que vous invitez est-il déjà membre ?

4. Solution rapide :
   Si l'équipe existe mais que vous ne pouvez pas inviter, c'est probablement que :
   - Vous n'êtes pas marqué comme propriétaire dans la base
   - L'équipe n'est pas correctement liée à votre compte

5. Pour résoudre temporairement :
   - Essayez de créer une nouvelle équipe
   - Ou demandez à voir les logs serveur pour l'erreur exacte
`

console.log(debugInfo)

// Message pour l'utilisateur
console.log(`
=== ACTION RECOMMANDÉE ===

1. Ouvrez votre navigateur sur la page Équipe
2. Appuyez sur F12 pour ouvrir les outils développeur
3. Allez dans l'onglet "Console"
4. Essayez d'inviter quelqu'un
5. Copiez l'erreur qui apparaît en rouge
6. Partagez cette erreur pour un diagnostic précis

L'erreur vous dira exactement ce qui ne va pas !
`)