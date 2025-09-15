# Test des limites de création de liens

## Objectif
Vérifier que les utilisateurs avec un plan gratuit ne peuvent créer qu'un seul lien.

## Corrections apportées

### 1. Route de duplication (`/app/api/links/[id]/duplicate/route.ts`)
- Ajout de la vérification des limites avant de dupliquer un lien
- Import de `checkTeamLimit` et `getUpgradeMessage`
- Vérification du nombre de liens existants avant la duplication

### 2. Route de test (`/app/api/test-create/route.ts`)
- Désactivation de la route en production
- Ajout d'une vérification `NODE_ENV !== 'production'`

### 3. Interface utilisateur - Dashboard (`/app/dashboard/page.tsx`)
- Import du hook `usePermissions`
- Création de la fonction `handleCreateClick` qui vérifie les limites
- Modification du bouton "Créer un lien" pour utiliser cette fonction

### 4. Interface utilisateur - Page des liens (`/app/dashboard/links/page.tsx`)
- Import du hook `usePermissions`
- Création de la fonction `handleCreateClick` qui vérifie les limites
- Modification du bouton "Créer un lien" pour utiliser cette fonction

## Comportement attendu

### Pour un utilisateur gratuit :
1. Peut créer son premier lien normalement
2. Quand il essaie de créer un 2ème lien :
   - Un message d'erreur s'affiche : "Vous avez atteint la limite de 1 lien du plan gratuit. Passez au plan Pro pour créer des liens illimités"
   - Redirection automatique vers la page de pricing après 2 secondes
3. Ne peut pas dupliquer un lien existant si la limite est atteinte
4. Ne peut pas utiliser la route de test en production

### Pour un utilisateur Pro/Premium :
- Peut créer un nombre illimité de liens
- Peut dupliquer des liens sans restriction

## Points de vérification

1. ✅ La logique de vérification `currentCount < maxLimit` est correcte
2. ✅ Route de duplication sécurisée
3. ✅ Route de test désactivée en production
4. ✅ Vérification des limites dans l'interface avant d'ouvrir le modal
5. ✅ Messages d'erreur clairs avec redirection vers pricing

## Note importante
La logique actuelle avec `currentCount < maxLimit` est correcte :
- Si `currentCount = 0` et `maxLimit = 1`, alors `0 < 1` = true → peut créer
- Si `currentCount = 1` et `maxLimit = 1`, alors `1 < 1` = false → ne peut pas créer

C'est le comportement souhaité pour un plan gratuit avec limite de 1 lien.