# Guide Stripe pour TapLinkr - Étape par étape

## 1️⃣ Connexion à Stripe

1. Va sur https://dashboard.stripe.com
2. Connecte-toi (ou crée un compte gratuit)
3. **IMPORTANT** : Vérifie que tu es en "Mode test" (en haut à gauche)

## 2️⃣ Créer les produits

### Aller dans la section Produits

1. Dans le menu de gauche, clique sur "**Produits**" (ou "Products" en anglais)
2. Clique sur le bouton "**+ Ajouter un produit**" (ou "+ Add product")

### Créer le Plan Standard

1. **Informations du produit** :
   - Nom : `TapLinkr Standard`
   - Description : `Plan Standard - Pages illimitées, analytics, support prioritaire`
   
2. **Informations tarifaires** :
   - Modèle de tarification : `Tarification standard`
   - Prix : `9.99`
   - Devise : `EUR`
   - Facturation : `Récurrente` → `Mensuelle`

3. Clique sur "**Ajouter le produit**"

4. **IMPORTANT** : Une fois créé, copie l'ID du prix qui ressemble à :
   ```
   price_1ABcDeFgHiJkLmNo
   ```

### Créer le Plan Premium

1. Clique à nouveau sur "**+ Ajouter un produit**"

2. **Informations du produit** :
   - Nom : `TapLinkr Premium`
   - Description : `Plan Premium - Tout illimité, Shield protection, support VIP`
   
3. **Informations tarifaires** :
   - Modèle de tarification : `Tarification standard`
   - Prix : `24.99`
   - Devise : `EUR`
   - Facturation : `Récurrente` → `Mensuelle`

4. Clique sur "**Ajouter le produit**"

5. **IMPORTANT** : Copie aussi l'ID du prix

## 3️⃣ Récupérer les IDs des prix

### Où trouver les IDs ?

1. Dans la liste des produits, clique sur un produit
2. Dans la section "Tarification", tu verras l'ID du prix
3. Il commence par `price_` suivi de caractères aléatoires

### Ce que tu dois copier :

- Pour Standard : `price_xxxxxxxxxxxxx`
- Pour Premium : `price_xxxxxxxxxxxxx`

## 4️⃣ Ajouter dans ton projet

Ouvre le fichier `.env.local` et ajoute :

```env
# IDs des prix Stripe (remplace par tes vrais IDs)
STRIPE_STANDARD_PRICE_ID=price_[COLLE_TON_ID_STANDARD_ICI]
STRIPE_PREMIUM_PRICE_ID=price_[COLLE_TON_ID_PREMIUM_ICI]
```

## 5️⃣ Vérifier les clés API

Dans Stripe, va dans "**Développeurs**" → "**Clés API**" et vérifie que tu as :
- La clé publique : `pk_test_...`
- La clé secrète : `sk_test_...`

Elles doivent déjà être dans ton `.env.local` :
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## 6️⃣ Redémarrer le serveur

```bash
# Arrête le serveur (Ctrl+C)
# Puis relance-le
npm run dev
```

## ✅ C'est fait !

Tu peux maintenant aller sur http://localhost:3000/pricing pour tester !

## 🆘 Besoin d'aide ?

Si tu bloques, dis-moi à quelle étape tu es et je t'aiderai !