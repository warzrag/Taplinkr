# Configuration du déploiement automatique Vercel

## IDs du projet
- **VERCEL_ORG_ID**: team_gx5Yd6vDfHNKqKZNWSXV6xkv
- **VERCEL_PROJECT_ID**: prj_MUmj2IEThm1PwuDjGkap2EIpKp5q

## Pour activer le déploiement automatique :

1. Allez sur GitHub > Votre repo > Settings > Secrets and variables > Actions

2. Ajoutez ces 3 secrets :
   - `VERCEL_TOKEN` : Obtenez-le sur https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` : team_gx5Yd6vDfHNKqKZNWSXV6xkv
   - `VERCEL_PROJECT_ID` : prj_MUmj2IEThm1PwuDjGkap2EIpKp5q

3. Une fois configuré, chaque push sur main déclenchera automatiquement un déploiement.

## Alternative : Intégration Vercel/GitHub

Vous pouvez aussi connecter directement Vercel à GitHub :
1. Allez sur https://vercel.com/warzrags-projects/taplinkr
2. Settings > Git
3. Connectez votre repo GitHub

Cela créera automatiquement les webhooks nécessaires.