import type { Dictionary } from "./en";

export const fr: Dictionary = {
  meta: {
    title: "Lamadrid Labs",
    description: "Lamadrid Labs — un studio logiciel indépendant.",
  },
  nav: {
    work: "Projets",
    services: "Services",
    about: "À propos",
    contact: "Contact",
    skipToContent: "Aller au contenu",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  hero: {
    eyebrow: "Laboratoire logiciel indépendant",
    titleFirst: "Les idées entrent.",
    titleHighlight: "logiciel",
    titleAfter: " en sort.",
    titleBefore: "Le ",
    lead: "Lamadrid Labs est le port d'attache clair et concentré des produits, expériences et projets clients conçus par Ricardo Lamadrid.",
    ctaPrimary: "Voir les projets",
    ctaSecondary: "Ce que nous créons",
  },
  narrative: {
    eyebrow: "Comment un projet avance dans le laboratoire",
    title: "Cinq étapes, un seul spécimen",
    lead: "Chaque projet suit le même processus, du début à la fin.",
    stages: {
      intake: {
        kicker: "01 — Accueil",
        title: "L'idée arrive",
        description:
          "Une idée brute, un problème métier ou une question ambitieuse arrive. Je prends le temps de comprendre ce qui est vraiment demandé — pas seulement ce qui est dit.",
        detail: "Découverte, cadrage et un brief clair sur lequel construire.",
      },
      architecture: {
        kicker: "02 — Architecture",
        title: "Sous le microscope",
        description:
          "Avant d'être construit, tout est conçu. Modèles de données, limites du système et les arbitrages qui rendent le logiciel facile à faire évoluer plus tard, pas difficile.",
        detail:
          "Conception du système, planification technique et un plan qui ne s'effondre pas à l'usage réel.",
      },
      build: {
        kicker: "03 — Construction",
        title: "Le laboratoire s'anime",
        description:
          "C'est là que le code prend forme — vrais composants, vraie logique, vrais cas limites. Une progression régulière et réfléchie, pas une course vers quelque chose qui compile à peine.",
        detail: "Implémentation, itération et un produit réellement utilisable à chaque étape.",
      },
      test: {
        kicker: "04 — Test",
        title: "Éprouver le spécimen",
        description:
          "Un logiciel non testé n'est qu'une hypothèse. Cette étape le met à l'épreuve — accessibilité, performance, cas limites — jusqu'à ce qu'il tienne dans des conditions réelles.",
        detail: "QA, vérifications d'accessibilité et tests de performance avant tout lancement.",
      },
      ship: {
        kicker: "05 — Livraison",
        title: "Relâché dans la nature",
        description:
          "Le spécimen quitte le laboratoire. Déployé, documenté et livré — prêt à faire son travail sans que personne ne le surveille.",
        detail: "Déploiement, passation et la tranquillité de savoir que ça continuera de fonctionner.",
      },
    },
  },
  process: {
    eyebrow: "Comment un projet avance dans le laboratoire",
    title: "Un spécimen, cinq étapes",
    lead: "Chaque projet suit la même réaction, du début à la fin.",
    stages: {
      "reagent-selection": {
        title: "Sélection des réactifs",
        stageLine:
          "L'idée arrive, réduite à l'essentiel qui mérite d'être construit.",
        serviceLine: "Découverte et cadrage.",
      },
      measurement: {
        title: "Mesure",
        stageLine: "Chaque besoin est pesé et le système est cartographié.",
        serviceLine: "Conception du système et planification technique.",
      },
      synthesis: {
        title: "Synthèse",
        stageLine:
          "Du vrai code, de vrais composants, en réaction vers un produit fonctionnel.",
        serviceLine: "Implémentation et itération.",
      },
      purification: {
        title: "Purification",
        stageLine: "Sans aspérités — testé, affiné, accessible.",
        serviceLine: "QA, accessibilité et performance.",
      },
      crystallization: {
        title: "Cristallisation",
        stageLine: "La forme finale : déployée, documentée et faite pour durer.",
        serviceLine: "Déploiement et passation.",
      },
    },
  },
  work: {
    eyebrow: "Travaux sélectionnés",
    title: "Depuis le laboratoire",
    lead: "Un échantillon de ce qui est déjà livré — projets réels, utilisateurs réels.",
    featuredLabel: "En vedette",
    restTitle: "Plus du laboratoire",
    viewProject: "Voir le projet",
    status: {
      live: "En ligne",
      active: "En cours",
      comingSoon: "Bientôt",
      archived: "Archivé",
    },
    type: {
      product: "Produit",
      website: "Site web",
      experiment: "Expérience",
      caseStudy: "Étude de cas",
    },
    projects: {
      "ricardo-os": {
        title: "RicardoOS",
        summary:
          "Le site personnel de Ricardo réinventé comme une expérience de portfolio inspirée d'un système d'exploitation.",
        tags: ["Next.js", "React", "Design d'interaction", "Personnel"],
      },
      "marina-cuesta": {
        title: "Marina Cuesta",
        summary:
          "Un site web soigné et sur mesure conçu pour Marina Cuesta — un exemple de design épuré et d'exécution soignée.",
        tags: ["Design web", "Next.js", "Projet client"],
      },
      subrooms: {
        title: "SubRooms",
        summary:
          "Un organisateur d'abonnements YouTube qui transforme un flux bruyant en salles de visionnage ciblées comme Code, Cuisine et Musique.",
        tags: ["React", "TypeScript", "Design System", "Vercel"],
      },
      "writer-companion": {
        title: "Writer Companion",
        summary:
          "Une application de coaching à l'écriture qui transforme une idée d'histoire en élan d'écriture quotidien, avec tâches guidées et retours.",
        tags: ["Next.js", "TypeScript", "IA", "Vercel"],
      },
    },
  },
  finale: {
    eyebrow: "Le résultat",
    title: "La preuve que ça marche",
    lead: "Le processus ci-dessus n'est pas une théorie. RicardoOS est passé par chaque étape — de l'accueil à la livraison — et il est en ligne.",
    featuredLabel: "En production",
    featuredCta: "Ouvrir RicardoOS",
    restTitle: "Les autres spécimens",
    restCta: "Visiter",
    contactTitle: "Un projet qui mérite d'être construit ?",
    contactLead:
      "Apportez l'idée. Je m'en occupe de l'accueil à la livraison — sans formulaires, juste une conversation.",
    contactCta: "Écrire à hello@lamadridlabs.com",
  },
  services: {
    eyebrow: "Comment nous collaborons",
    title: "Services",
    lead: "Des façons ciblées de travailler avec le laboratoire, d'une seule fonctionnalité à un accompagnement continu.",
    items: {
      "product-engineering": {
        title: "Ingénierie produit",
        summary: "Transformer des idées en produits web clairs et utilisables.",
        outcomes: [
          "Livrer un produit fonctionnel, pas seulement un prototype",
          "Un périmètre clair et un chemin rapide vers le lancement",
          "Un code maintenable sur lequel construire",
        ],
      },
      "design-engineering": {
        title: "Ingénierie de design",
        summary:
          "Interfaces soignées, détails d'interaction et UI prête pour la production.",
        outcomes: [
          "Des interfaces soignées et accessibles",
          "Une animation et une interaction bien pensées",
          "Un système de design cohérent, pas des écrans isolés",
        ],
      },
      "ai-workflow-engineering": {
        title: "Ingénierie de flux avec l'IA",
        summary:
          "Automatisations concrètes, flux LLM, prototypes agentiques et intégrations d'API.",
        outcomes: [
          "Des automatisations qui suppriment de vraies tâches répétitives",
          "Des flux LLM et agents connectés à vos outils",
          "Des fonctionnalités d'IA pragmatiques, pas des démos à la mode",
        ],
      },
      "frontend-architecture": {
        title: "Architecture frontend",
        summary:
          "Systèmes React/Next.js évolutifs, systèmes de design, performance, accessibilité et maintenabilité.",
        outcomes: [
          "Une architecture qui évolue avec l'équipe",
          "De solides bases de performance et d'accessibilité",
          "Un code qui reste propre en grandissant",
        ],
      },
      "freelance-technical-partner": {
        title: "Partenaire technique freelance",
        summary:
          "Un accompagnement d'ingénierie senior pour fondateurs, créateurs et petites équipes.",
        outcomes: [
          "Un partenaire senior qui livre avec vous",
          "Du jugement produit en plus du code",
          "Un accompagnement flexible sans les coûts d'une agence",
        ],
      },
    },
  },
  about: {
    eyebrow: "À propos",
    title: "La personne derrière le laboratoire",
    lead: "Lamadrid Labs, c'est une seule personne qui travaille comme un petit studio.",
    paragraphs: [
      "Ricardo Lamadrid est un ingénieur logiciel qui conçoit des produits de bout en bout — des détails d'interface jusqu'aux systèmes qui les sous-tendent. Lamadrid Labs, c'est là où vit ce travail : projets personnels, projets clients et, à l'occasion, une expérience qui ne trouve sa place nulle part ailleurs.",
      "Le fil conducteur, c'est le soin apporté. Chaque projet reçoit la même attention, qu'il s'agisse d'un outil personnel ou du produit d'un client — un code propre, un design réfléchi et un logiciel qui semble pensé plutôt qu'assemblé.",
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Un projet en tête ?",
    lead: "Écrivez-moi directement — pas de formulaire, pas d'allers-retours.",
    cta: "Envoyer un e-mail à hello@lamadridlabs.com",
  },
  footer: {
    rights: "Tous droits réservés.",
  },
  language: {
    label: "Langue",
  },
};
