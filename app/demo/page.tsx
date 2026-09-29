import { redirect } from 'next/navigation'

// L'ancienne page de demo envoyait le visiteur ailleurs pour comprendre, avec
// des textes illisibles en mode sombre. La page d'accueil montre maintenant le
// produit elle-meme : les anciens liens vers /demo y menent directement.
export default function Demo() {
  redirect('/#how')
}
