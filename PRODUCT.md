# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Tous les createurs de contenu qui partagent un seul lien dans leur bio
(Instagram, TikTok, YouTube, X...). Ils veulent une page propre, vite faite, et
savoir ce que leurs visiteurs font. Public confirme par Florent le 29 septembre
2026 : « tous les createurs », sans parler de contenu adulte.

Public secondaire : les agences et managers qui gerent plusieurs createurs et
leurs assistantes (equipes, liens attribues, classement par clics).

Les visiteurs des pages sont presque tous sur telephone, souvent dans le
navigateur integre d'Instagram ou de TikTok.

## Product Purpose

Taplinkr cree deux choses : des pages de liens (une page publique
taplinkr.com/nom avec plusieurs liens) et des liens directs (une adresse courte
qui envoie le visiteur tout droit a destination). Le createur suit ensuite ses
clics depuis un tableau de bord. La reussite : plus de visiteurs arrivent la ou
le createur veut les envoyer, et il le voit.

## Positioning

Choix delegue par Florent (« tu conseilles quoi ? »), recommande par Claude le
29 septembre 2026 :

1. **De vraies statistiques** : seuls les vrais visiteurs comptent. Les robots,
   les apercus de liens (WhatsApp, Instagram...), les doubles clics et les
   rafales sont ecartes avant d'etre comptes (`lib/click-quality.ts`).
2. **Les liens directs** : un toucher et le visiteur est a destination.
3. En second plan : la gestion d'equipe pour les agences.

La protection des liens et la barriere 18+ existent mais ne figurent pas sur la
page d'accueil : pour un public general, elles inquietent plus qu'elles ne
rassurent.

## Operating Context

Le createur colle son adresse taplinkr.com/nom dans sa bio. Il construit sa page
dans le tableau de bord (sombre, violet), sur ordinateur ou telephone. Les
visiteurs arrivent depuis une appli sociale, sur mobile.

## Capabilities and Constraints

- Offres : Free (1 page), Standard 9,99 EUR/mois, Premium 24,99 EUR/mois
  (source : `lib/stripe.ts`, `lib/permissions.ts`).
- Les domaines personnalises (Premium) ne marchent plus depuis le depart de
  Vercel : ne pas les mettre en avant tant qu'ils ne sont pas repares.
- Site et interface en anglais.
- Le tableau de bord est toujours sombre ; le site public suit le theme du
  visiteur (clair ou sombre).
- Verification de l'adresse (taplinkr.com/nom) disponible en direct :
  `/api/check-username`.

## Brand Commitments

Nom : TapLinkr (logo : deux maillons, violet vers bleu, `components/Logo.tsx`).
Violet comme couleur de marque. Textes en anglais.

## Evidence on Hand

Aucun temoignage, aucun logo de client, aucune presse. Florent refuse
d'afficher des chiffres reels sur la page d'accueil (29 septembre 2026) : ne pas
en inventer, ne pas en afficher. Tout exemple de page doit etre fictif et
presente comme tel.

## Product Principles

1. Montrer plutot qu'expliquer : le produit se demontre sur la page meme, sans
   envoyer le visiteur ailleurs pour comprendre.
2. Aucun chiffre invente, aucune promesse que le produit ne tient pas.
3. Un toucher pour le visiteur : chaque ecran vise un seul geste clair.
4. Assez simple pour n'importe quel createur, des la premiere minute.

## Accessibility & Inclusion

Mobile d'abord. Textes toujours lisibles dans les deux themes : le site a deja
affiche du gris clair sur blanc a cause de regles globales du mode sombre
(`app/globals.css`), a surveiller sur chaque surface claire.
