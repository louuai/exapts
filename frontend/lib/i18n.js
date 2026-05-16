'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const dictionaries = {
  fr: {
    'nav.dashboard': 'Tableau de bord',
    'nav.guides': 'Guides',
    'nav.community': 'Communauté',
    'nav.properties': 'Immobilier',
    'nav.services': 'Annuaire',
    'nav.favorites': 'Favoris',
    'nav.profile': 'Profil',
    'nav.logout': 'Déconnexion',
    'nav.login': 'Se connecter',
    'nav.signup': 'Créer un compte',
    'nav.search.placeholder': 'Rechercher un bien, un guide, une discussion…',

    'home.hero.eyebrow': 'Plateforme #1 pour les expatriés à Maurice',
    'home.hero.title': 'Installez-vous à Maurice, sereinement.',
    'home.hero.subtitle':
      "Guides administratifs, communauté locale, biens immobiliers d'exception. Tout ce dont vous avez besoin, sur une seule plateforme.",
    'home.hero.cta.primary': 'Explorer les biens',
    'home.hero.cta.secondary': 'Voir les guides',
    'home.stats.guides': 'Guides experts',
    'home.stats.members': 'Membres actifs',
    'home.stats.properties': 'Biens immobiliers',
    'home.stats.cities': 'Villes couvertes',
    'home.featured.guides': 'Guides essentiels',
    'home.featured.guides.sub': 'Démarches, conseils et bonnes pratiques',
    'home.featured.community': 'La communauté en direct',
    'home.featured.community.sub': 'Discussions, retours d\'expérience, bons plans',
    'home.featured.properties': 'Biens à la une',
    'home.featured.properties.sub': 'Des opportunités sélectionnées avec soin',
    'home.viewAll': 'Tout voir',

    'guides.title': 'Guides pour s\'installer',
    'guides.subtitle': 'Visa, logement, banque, santé… Toutes les démarches expliquées étape par étape.',
    'guides.read': 'Lire le guide',
    'guides.readingTime': 'min de lecture',
    'guides.steps': 'étapes',
    'guides.tips': 'conseils',
    'guides.updatedAt': 'Mis à jour le',
    'guides.steps.title': 'Étapes',
    'guides.tips.title': 'Conseils & astuces',
    'guides.back': 'Retour aux guides',

    'community.title': 'Communauté OMEGA',
    'community.subtitle': 'Posez vos questions, partagez vos bons plans, rencontrez d\'autres expatriés.',
    'community.placeholder': 'Partagez quelque chose avec la communauté…',
    'community.imageUrl': "URL de l'image (optionnel)",
    'community.publish': 'Publier',
    'community.publishing': 'Publication…',

    'properties.title': 'Immobilier à Maurice',
    'properties.subtitle': 'Penthouses, villas, appartements — sélection premium éligible aux permis de résidence.',
    'properties.search': 'Rechercher',
    'properties.filters.region': 'Région',
    'properties.filters.location': 'Ville',
    'properties.filters.type': 'Type de bien',
    'properties.filters.transaction': 'Transaction',
    'properties.filters.sort': 'Trier',
    'properties.filters.all': 'Toutes',
    'properties.filters.allTypes': 'Tous les types',
    'properties.filters.sale': 'Achat',
    'properties.filters.rent': 'Location',
    'properties.filters.sort.recent': 'Plus récents',
    'properties.filters.sort.priceAsc': 'Prix croissant',
    'properties.filters.sort.priceDesc': 'Prix décroissant',
    'properties.filters.sort.surface': 'Surface décroissante',
    'properties.empty': 'Aucun bien ne correspond à votre recherche.',
    'properties.featured': 'Coup de cœur',
    'properties.new': 'Nouveau',
    'properties.surface': 'Surface',
    'properties.rooms': 'pièces',
    'properties.bedrooms': 'chambres',
    'properties.bathrooms': 'salles de bain',
    'properties.parking': 'parkings',
    'properties.yearBuilt': 'Année',
    'properties.eligibility': 'Éligibilité',
    'properties.description': 'Description',
    'properties.features': 'Prestations',
    'properties.agent': 'Votre interlocuteur',
    'properties.contact': 'Contacter',
    'properties.gallery': 'Galerie',
    'properties.similar': 'Biens similaires',
    'properties.back': 'Retour aux biens',
    'properties.priceOnRequest': 'sur demande',
    'properties.perMonth': '/ mois',

    'favorites.title': 'Mes favoris',
    'favorites.subtitle': 'Vos biens sauvegardés pour comparer plus tard.',
    'favorites.empty': 'Vous n\'avez pas encore de favoris. Ajoutez vos coups de cœur depuis la page Immobilier.',

    'auth.login.title': 'Bienvenue de retour',
    'auth.login.subtitle': 'Connectez-vous pour retrouver votre tableau de bord.',
    'auth.login.email': 'Email',
    'auth.login.password': 'Mot de passe',
    'auth.login.submit': 'Se connecter',
    'auth.login.submitting': 'Connexion…',
    'auth.login.noAccount': "Pas encore de compte ?",
    'auth.login.signupLink': 'Créer un compte',
    'auth.login.demo': 'Compte de démonstration : demo@omega.mu / demo1234',
    'auth.signup.title': 'Créer votre compte',
    'auth.signup.subtitle': 'Rejoignez la communauté des expatriés à Maurice.',
    'auth.signup.name': 'Nom complet',
    'auth.signup.submit': 'Créer mon compte',
    'auth.signup.submitting': 'Création…',
    'auth.signup.haveAccount': 'Déjà inscrit ?',
    'auth.signup.loginLink': 'Se connecter',

    'common.loading': 'Chargement…',
    'common.error': 'Une erreur est survenue.',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.from': 'À partir de',
    'common.like': "J'aime",
    'common.comment': 'Commenter',
    'common.share': 'Partager',

    /* ===== Landing page ===== */
    'lp.nav.features': 'Fonctionnalités',
    'lp.nav.realEstate': 'Immobilier',
    'lp.nav.community': 'Communauté',
    'lp.nav.testimonials': 'Témoignages',
    'lp.nav.tryDemo': 'Essayer la démo',
    'lp.nav.signIn': 'Se connecter',

    'lp.hero.eyebrow': 'Plateforme #1 pour les expatriés à Maurice',
    'lp.hero.title.line1': 'Trouvez votre maison à Maurice',
    'lp.hero.title.line2': 'avant même votre arrivée.',
    'lp.hero.subtitle':
      "Sélection immobilière premium, accompagnement Residence Permit, communauté d'expatriés vérifiés et annuaire de services de confiance.",
    'lp.hero.cta.primary': 'Voir les biens disponibles',
    'lp.hero.cta.secondary': 'Recevoir les offres exclusives',
    'lp.hero.trust.expats': '+12 000 expatriés',
    'lp.hero.trust.properties': '+400 biens disponibles',
    'lp.hero.trust.guides': '32 guides experts',
    'lp.hero.trustedBy': 'Conçu avec les communautés de',

    'lp.problem.eyebrow': 'Le problème',
    'lp.problem.title': "S'expatrier à Maurice, c'est encore trop compliqué.",
    'lp.problem.subtitle':
      'Trouver le bon quartier, comprendre les démarches, créer du lien : tout cela prend des mois — parfois des années.',
    'lp.problem.1.title': 'Trouver un logement de confiance',
    'lp.problem.1.body':
      "Annonces opaques, prix gonflés, propriétaires injoignables : 6 expatriés sur 10 se font avoir lors de leur première location.",
    'lp.problem.2.title': "Pas de réseau local",
    'lp.problem.2.body':
      'Pas de famille sur place, peu de collègues, peu de repères. Les premières semaines peuvent être isolantes.',
    'lp.problem.3.title': 'Information éparpillée',
    'lp.problem.3.body':
      "Forums vieillissants, blogs contradictoires, conseils sortis de leur contexte : l'info fiable est introuvable.",

    'lp.solution.eyebrow': 'La solution',
    'lp.solution.title': 'Une plateforme. Tout ce qu\'il vous faut.',
    'lp.solution.subtitle':
      'Quatre modules pensés pour s\'imbriquer parfaitement — du premier email au quotidien d\'expatrié.',
    'lp.solution.guides.title': 'Guides experts',
    'lp.solution.guides.body':
      'Visa Premium, Occupation Permit, banque, école, fiscalité… des fiches mises à jour mensuellement par des spécialistes locaux.',
    'lp.solution.guides.bullets': 'Étapes numérotées|Conseils pratiques|FR & EN',
    'lp.solution.community.title': 'Communauté vérifiée',
    'lp.solution.community.body':
      'Posez vos questions, partagez vos bons plans, rencontrez d\'autres expatriés près de chez vous. Pas d\'anonymes, que des profils confirmés.',
    'lp.solution.community.bullets': 'Feed local|Bons plans|Événements',
    'lp.solution.services.title': 'Annuaire de services',
    'lp.solution.services.body':
      "Notaires, agents, déménageurs, écoles internationales, médecins anglophones : notre annuaire de prestataires de confiance.",
    'lp.solution.services.bullets': 'Pros vérifiés|Avis transparents|Devis rapides',
    'lp.solution.realestate.title': 'Immobilier premium',
    'lp.solution.realestate.body':
      "Biens d'exception sélectionnés à la main, éligibles aux permis de résidence (PDS, IRS, Smart City).",
    'lp.solution.realestate.bullets': 'Achat & location|PDS / IRS|Vue mer & lagon',

    'lp.realestate.eyebrow': "Notre vitrine",
    'lp.realestate.title': 'L\'immobilier qui ouvre les portes de Maurice',
    'lp.realestate.subtitle':
      'Penthouses à Grand Baie, villas pieds dans l\'eau à Tamarin, appartements en Smart City. Chaque bien est éligible à la résidence permanente.',
    'lp.realestate.cta': 'Explorer tous les biens',
    'lp.realestate.tag.invest': 'Investir',
    'lp.realestate.tag.live': 'Vivre',
    'lp.realestate.tag.rent': 'Louer',

    'lp.how.eyebrow': 'Comment ça marche',
    'lp.how.title': 'Trois étapes. Pas une de plus.',
    'lp.how.subtitle': 'De la première recherche à votre installation, on vous accompagne.',
    'lp.how.1.title': 'Créez votre compte',
    'lp.how.1.body': "30 secondes, sans carte bancaire. Vous accédez immédiatement aux guides, à la communauté et à la sélection immobilière.",
    'lp.how.2.title': 'Explorez & comparez',
    'lp.how.2.body': "Parcourez les biens, lisez les guides adaptés à votre profil, sauvegardez vos favoris, posez vos questions à la communauté.",
    'lp.how.3.title': 'Installez-vous sereinement',
    'lp.how.3.body': "Connectez-vous avec nos agents, prestataires et autres expatriés. Concierge OMEGA disponible si vous voulez tout déléguer.",

    'lp.testimonials.eyebrow': 'Ils nous font confiance',
    'lp.testimonials.title': '12 000 expatriés. Une seule plateforme.',

    'lp.cta.title': "Prêt à changer de vie ?",
    'lp.cta.subtitle': "Rejoignez la communauté OMEGA gratuitement. La démo se lance en un clic.",
    'lp.cta.primary': 'Essayer la démo maintenant',
    'lp.cta.secondary': 'Parler à un conseiller',

    'lp.footer.product': 'Produit',
    'lp.footer.company': 'Entreprise',
    'lp.footer.resources': 'Ressources',
    'lp.footer.legal': 'Légal',
    'lp.footer.about': 'À propos',
    'lp.footer.careers': 'Carrières',
    'lp.footer.contact': 'Contact',
    'lp.footer.privacy': 'Confidentialité',
    'lp.footer.terms': 'CGU',
    'lp.footer.blog': 'Blog',
    'lp.footer.help': 'Centre d\'aide',
    'lp.footer.copyright': '© 2026 OMEGA. Tous droits réservés.',
    'lp.footer.tagline': "Conçu à l'île Maurice, pour les expatriés du monde entier.",
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.guides': 'Guides',
    'nav.community': 'Community',
    'nav.properties': 'Real Estate',
    'nav.favorites': 'Favorites',
    'nav.profile': 'Profile',
    'nav.logout': 'Log out',
    'nav.login': 'Sign in',
    'nav.signup': 'Sign up',
    'nav.search.placeholder': 'Search properties, guides, discussions…',

    'home.hero.eyebrow': '#1 platform for expats in Mauritius',
    'home.hero.title': 'Move to Mauritius, with confidence.',
    'home.hero.subtitle':
      "Administrative guides, local community, premium real estate. Everything you need, on one platform.",
    'home.hero.cta.primary': 'Browse properties',
    'home.hero.cta.secondary': 'See guides',
    'home.stats.guides': 'Expert guides',
    'home.stats.members': 'Active members',
    'home.stats.properties': 'Listings',
    'home.stats.cities': 'Cities covered',
    'home.featured.guides': 'Essential guides',
    'home.featured.guides.sub': 'Procedures, tips and best practices',
    'home.featured.community': 'Community live',
    'home.featured.community.sub': 'Discussions, real-life feedback, good tips',
    'home.featured.properties': 'Featured properties',
    'home.featured.properties.sub': 'Hand-picked premium opportunities',
    'home.viewAll': 'View all',

    'guides.title': 'Guides to settle in',
    'guides.subtitle': 'Visa, housing, banking, healthcare… every step explained.',
    'guides.read': 'Read guide',
    'guides.readingTime': 'min read',
    'guides.steps': 'steps',
    'guides.tips': 'tips',
    'guides.updatedAt': 'Updated on',
    'guides.steps.title': 'Steps',
    'guides.tips.title': 'Tips',
    'guides.back': 'Back to guides',

    'community.title': 'OMEGA Community',
    'community.subtitle': 'Ask questions, share tips, meet other expats.',
    'community.placeholder': 'Share something with the community…',
    'community.imageUrl': 'Image URL (optional)',
    'community.publish': 'Publish',
    'community.publishing': 'Publishing…',

    'properties.title': 'Real estate in Mauritius',
    'properties.subtitle': 'Penthouses, villas, apartments — premium selection eligible for residence permits.',
    'properties.search': 'Search',
    'properties.filters.region': 'Region',
    'properties.filters.location': 'City',
    'properties.filters.type': 'Property type',
    'properties.filters.transaction': 'Transaction',
    'properties.filters.sort': 'Sort',
    'properties.filters.all': 'All',
    'properties.filters.allTypes': 'All types',
    'properties.filters.sale': 'For sale',
    'properties.filters.rent': 'For rent',
    'properties.filters.sort.recent': 'Most recent',
    'properties.filters.sort.priceAsc': 'Price low to high',
    'properties.filters.sort.priceDesc': 'Price high to low',
    'properties.filters.sort.surface': 'Largest surface',
    'properties.empty': 'No property matches your search.',
    'properties.featured': 'Featured',
    'properties.new': 'New',
    'properties.surface': 'Surface',
    'properties.rooms': 'rooms',
    'properties.bedrooms': 'bedrooms',
    'properties.bathrooms': 'bathrooms',
    'properties.parking': 'parkings',
    'properties.yearBuilt': 'Year',
    'properties.eligibility': 'Eligibility',
    'properties.description': 'Description',
    'properties.features': 'Features',
    'properties.agent': 'Your contact',
    'properties.contact': 'Contact',
    'properties.gallery': 'Gallery',
    'properties.similar': 'Similar properties',
    'properties.back': 'Back to properties',
    'properties.priceOnRequest': 'on request',
    'properties.perMonth': '/ month',

    'favorites.title': 'My favorites',
    'favorites.subtitle': 'Your saved properties to compare later.',
    'favorites.empty': 'No favorites yet. Add some from the Real Estate page.',

    'auth.login.title': 'Welcome back',
    'auth.login.subtitle': 'Sign in to access your dashboard.',
    'auth.login.email': 'Email',
    'auth.login.password': 'Password',
    'auth.login.submit': 'Sign in',
    'auth.login.submitting': 'Signing in…',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.signupLink': 'Create one',
    'auth.login.demo': 'Demo account: demo@omega.mu / demo1234',
    'auth.signup.title': 'Create your account',
    'auth.signup.subtitle': 'Join the expat community in Mauritius.',
    'auth.signup.name': 'Full name',
    'auth.signup.submit': 'Create account',
    'auth.signup.submitting': 'Creating…',
    'auth.signup.haveAccount': 'Already registered?',
    'auth.signup.loginLink': 'Sign in',

    'common.loading': 'Loading…',
    'common.error': 'Something went wrong.',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.from': 'From',
    'common.like': 'Like',
    'common.comment': 'Comment',
    'common.share': 'Share',

    /* ===== Landing page ===== */
    'lp.nav.features': 'Features',
    'lp.nav.realEstate': 'Real Estate',
    'lp.nav.community': 'Community',
    'lp.nav.testimonials': 'Testimonials',
    'lp.nav.tryDemo': 'Try the demo',
    'lp.nav.signIn': 'Sign in',

    'lp.hero.eyebrow': '#1 platform for expats in Mauritius',
    'lp.hero.title.line1': 'Find your home in Mauritius',
    'lp.hero.title.line2': 'before you arrive.',
    'lp.hero.subtitle':
      'Premium real estate selection, Residence Permit guidance, a verified expat community and a directory of trusted services.',
    'lp.hero.cta.primary': 'Browse properties',
    'lp.hero.cta.secondary': 'Get exclusive deals',
    'lp.hero.trust.expats': '+12,000 expats',
    'lp.hero.trust.properties': '+400 properties available',
    'lp.hero.trust.guides': '32 expert guides',
    'lp.hero.trustedBy': 'Built with communities from',

    'lp.problem.eyebrow': 'The problem',
    'lp.problem.title': 'Moving to Mauritius is still way too hard.',
    'lp.problem.subtitle':
      'Finding the right neighbourhood, navigating paperwork, making local friends — it takes months. Sometimes years.',
    'lp.problem.1.title': 'Finding a trustworthy home',
    'lp.problem.1.body':
      '6 out of 10 expats get burned on their first lease — opaque listings, inflated prices, untraceable owners.',
    'lp.problem.2.title': 'No local network',
    'lp.problem.2.body':
      'No family on the ground, few colleagues, no compass. The first weeks can feel really isolating.',
    'lp.problem.3.title': 'Scattered information',
    'lp.problem.3.body':
      'Outdated forums, contradicting blogs, out-of-context tips: trustworthy info is nowhere to be found.',

    'lp.solution.eyebrow': 'The solution',
    'lp.solution.title': 'One platform. Everything you need.',
    'lp.solution.subtitle':
      'Four modules designed to fit together — from your first email to your everyday life as an expat.',
    'lp.solution.guides.title': 'Expert guides',
    'lp.solution.guides.body':
      'Premium Visa, Occupation Permit, banking, schools, taxes — monthly-updated playbooks by local specialists.',
    'lp.solution.guides.bullets': 'Numbered steps|Practical tips|FR & EN',
    'lp.solution.community.title': 'Verified community',
    'lp.solution.community.body':
      "Ask questions, share tips, meet expats nearby. No anonymous accounts, only confirmed profiles.",
    'lp.solution.community.bullets': 'Local feed|Insider tips|Events',
    'lp.solution.services.title': 'Service directory',
    'lp.solution.services.body':
      'Notaries, agents, movers, international schools, English-speaking doctors — our trusted-provider directory.',
    'lp.solution.services.bullets': 'Verified pros|Honest reviews|Fast quotes',
    'lp.solution.realestate.title': 'Premium real estate',
    'lp.solution.realestate.body':
      'Hand-picked listings eligible for residence permits (PDS, IRS, Smart City).',
    'lp.solution.realestate.bullets': 'Buy & rent|PDS / IRS|Sea & lagoon views',

    'lp.realestate.eyebrow': 'Our showcase',
    'lp.realestate.title': 'Real estate that unlocks Mauritius for you',
    'lp.realestate.subtitle':
      'Penthouses in Grand Baie, beachfront villas in Tamarin, Smart City apartments. Every listing qualifies for permanent residence.',
    'lp.realestate.cta': 'Browse all listings',
    'lp.realestate.tag.invest': 'Invest',
    'lp.realestate.tag.live': 'Live',
    'lp.realestate.tag.rent': 'Rent',

    'lp.how.eyebrow': 'How it works',
    'lp.how.title': 'Three steps. Not one more.',
    'lp.how.subtitle': 'From your first search to your move-in, we walk you through.',
    'lp.how.1.title': 'Create your account',
    'lp.how.1.body': '30 seconds, no credit card. You get instant access to the guides, the community and the curated real estate selection.',
    'lp.how.2.title': 'Explore & compare',
    'lp.how.2.body': 'Browse listings, read the right guides, save your favorites, ask the community.',
    'lp.how.3.title': 'Settle in with confidence',
    'lp.how.3.body': 'Get in touch with our agents, providers and fellow expats. OMEGA Concierge is here if you prefer to delegate everything.',

    'lp.testimonials.eyebrow': 'They trust us',
    'lp.testimonials.title': '12,000 expats. One platform.',

    'lp.cta.title': 'Ready to change your life?',
    'lp.cta.subtitle': 'Join the OMEGA community for free. The demo opens in one click.',
    'lp.cta.primary': 'Try the demo now',
    'lp.cta.secondary': 'Talk to an advisor',

    'lp.footer.product': 'Product',
    'lp.footer.company': 'Company',
    'lp.footer.resources': 'Resources',
    'lp.footer.legal': 'Legal',
    'lp.footer.about': 'About',
    'lp.footer.careers': 'Careers',
    'lp.footer.contact': 'Contact',
    'lp.footer.privacy': 'Privacy',
    'lp.footer.terms': 'Terms',
    'lp.footer.blog': 'Blog',
    'lp.footer.help': 'Help Center',
    'lp.footer.copyright': '© 2026 OMEGA. All rights reserved.',
    'lp.footer.tagline': 'Built in Mauritius, for expats from around the world.',
  },
};

const I18nContext = createContext({ locale: 'fr', setLocale: () => {}, t: (k) => k });

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState('fr');

  useEffect(() => {
    const saved = window.localStorage.getItem('omega.locale');
    if (saved && dictionaries[saved]) setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l) => {
    setLocaleState(l);
    window.localStorage.setItem('omega.locale', l);
  }, []);

  const t = useCallback(
    (key) => dictionaries[locale]?.[key] ?? dictionaries.fr[key] ?? key,
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
