console.log('🔍 Debug Billing - Chargement...');

// Vérifier la session
fetch('/api/debug-session')
  .then(res => res.json())
  .then(data => {
    console.log('📊 Données de session:', data);
    console.log('📌 Plan actuel:', data.user?.plan);
    console.log('💳 Stripe Customer ID:', data.user?.stripeCustomerId);
    console.log('🔄 Stripe Subscription ID:', data.user?.stripeSubscriptionId);
  })
  .catch(err => console.error('❌ Erreur:', err));

// Vérifier les données d'abonnement
fetch('/api/stripe/subscription')
  .then(res => res.json())
  .then(data => {
    console.log('📋 Données d\'abonnement Stripe:', data);
  })
  .catch(err => console.error('❌ Erreur subscription:', err));

// Vérifier le hook usePermissions
console.log('💡 Pour débugger usePermissions, tapez dans la console React:');
console.log('const { userPlan } = usePermissions(); console.log(userPlan);');