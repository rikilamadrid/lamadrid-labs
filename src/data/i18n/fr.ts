import type { Dictionary } from "./en";

export const fr: Dictionary = {
  meta: {
    title: "Lamadrid Labs",
    description: "Lamadrid Labs — un studio logiciel indépendant.",
  },
  nav: {
    home: "Accueil",
    work: "Projets",
    about: "À propos",
    contact: "Contact",
    skipToContent: "Aller au contenu",
    primary: "Principale",
  },
  shell: {
    inDevelopment: "En développement",
  },
  hero: {
    eyebrow: "Studio de logiciel indépendant",
    titleLines: ["Le bruit devient", "structure."],
    lead: "Lamadrid Labs transforme des exigences éparses et des idées à peine formées en systèmes clairs et en logiciels livrés.",
    ctaPrimary: "Voir les projets",
  },
  work: {
    eyebrow: "Systèmes sélectionnés",
    title: "Le travail, résolu.",
    supporting:
      "Quatre problèmes différents. Quatre systèmes façonnés en quelque chose d'utilisable.",
    lead: "Un échantillon de ce qui est déjà livré — projets réels, utilisateurs réels.",
    featuredLabel: "En vedette",
    restTitle: "Plus de travail",
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
    world: {
      overview: "Projet",
      enter: "Entrer dans le projet",
      problem: "Problème",
      solution: "Solution",
      outcome: "Résultat",
      tech: "Conçu avec",
      architecture: "Architecture",
      results: "Résultats",
      visitLive: "Voir en ligne",
      viewSource: "Voir le code",
      back: "Retour aux projets",
      scroll: "Défiler pour explorer",
    },
    projects: {
      "ricardo-os": {
        title: "RicardoOS",
        summary:
          "Le site personnel de Ricardo réinventé comme une expérience de portfolio inspirée d'un système d'exploitation.",
        tags: ["Next.js", "React", "Design d'interaction", "Personnel"],
        world: {
          statement:
            "Un portfolio personnel réinventé comme un système d'exploitation que l'on peut vraiment utiliser.",
          problem:
            "Un CV et une liste de liens disent ce que quelqu'un a fait. Ils ne laissent pas sentir comment il pense. Le portfolio devait être l'argument lui-même — la preuve du savoir-faire, pas sa description.",
          solution:
            "RicardoOS transforme le portfolio en un environnement de bureau : des fenêtres, un dock et des applications qui ouvrent chacune une facette du travail. On ne fait pas défiler une page — on explore un système, comme on explorerait n'importe quel produit que conçoit Ricardo.",
          outcome:
            "Le médium devient le message. Le temps d'ouvrir une fenêtre et de la déplacer, on a déjà ressenti le savoir-faire d'interaction que le portfolio cherche à transmettre — sans étude de cas.",
          architecture: [
            "Next.js App Router avec un gestionnaire de fenêtres côté client pour des fenêtres déplaçables, focusables et empilables.",
            "Un registre d'applications typé : ajouter une fenêtre est une donnée, pas une reconstruction.",
            "État local et éphémère — sans backend, exportable en statique, rapide à charger.",
          ],
          results: [
            "Publié et en ligne sur ricardolamadrid.com.",
            "Se lit comme un produit, pas comme une page — l'interaction elle-même est la preuve du savoir-faire.",
          ],
        },
      },
      "marina-cuesta": {
        title: "Marina Cuesta",
        summary:
          "Un site web soigné et sur mesure conçu pour Marina Cuesta — un exemple de design épuré et d'exécution soignée.",
        tags: ["Design web", "Next.js", "Projet client"],
        world: {
          statement:
            "Un site web sur mesure et apaisé qui laisse le travail parler d'abord.",
          problem:
            "Marina avait besoin d'un foyer en ligne aussi réfléchi que son propre travail — ni un modèle ni un constructeur de pages, quelque chose qui se lise comme intentionnel.",
          solution:
            "Un site sur mesure avec une mise en page sobre, une typographie soignée et juste ce qu'il faut de mouvement pour se sentir vivant sans gêner.",
          outcome:
            "Un site personnel épuré et rapide qui semble fabriqué plutôt qu'assemblé.",
          architecture: [
            "Next.js avec génération statique pour un site rapide et peu coûteux à héberger.",
            "Styles pilotés par des tokens de design, pour un rendu cohérent et facile à ajuster.",
          ],
          results: ["Publié et en ligne sur marinacuesta.com."],
        },
      },
      subrooms: {
        title: "SubRooms",
        summary:
          "Un organisateur d'abonnements YouTube qui transforme un flux bruyant en salles de visionnage ciblées comme Code, Cuisine et Musique.",
        tags: ["React", "TypeScript", "Design System", "Vercel"],
        world: {
          statement:
            "Transformez un flux YouTube bruyant en salles ciblées.",
          problem:
            "Un seul flux d'abonnements mélange tout — code, cuisine, musique — si bien que rien ne reçoit toute votre attention.",
          solution:
            "SubRooms range les chaînes dans des salles dédiées, pour que chaque session de visionnage ait un seul objectif, clair.",
          outcome:
            "Un flux d'abonnements qui correspond enfin à la façon dont on regarde vraiment — un contexte à la fois.",
          architecture: [
            "Application monopage en React et TypeScript avec un petit design system cohérent.",
            "Déployé sur Vercel.",
          ],
          results: ["Publié et en ligne."],
        },
      },
      "writer-companion": {
        title: "Writer Companion",
        summary:
          "Une application de coaching à l'écriture qui transforme une idée d'histoire en élan d'écriture quotidien, avec tâches guidées et retours.",
        tags: ["Next.js", "TypeScript", "IA", "Vercel"],
        world: {
          statement:
            "Transformez une idée d'histoire en élan d'écriture quotidien.",
          problem:
            "La plupart des outils d'écriture stockent des mots. Presque aucun n'aide vraiment à continuer, jour après jour.",
          solution:
            "Writer Companion découpe une histoire en tâches guidées et en retours bienveillants, pour que l'étape suivante soit toujours évidente et que l'habitude se construise d'elle-même.",
          outcome:
            "Écrire devient une suite de petits gestes réalisables plutôt qu'une page blanche.",
          architecture: [
            "Next.js et TypeScript avec un accompagnement assisté par IA.",
            "Déployé sur Vercel.",
          ],
          results: ["Publié et en ligne."],
        },
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
  sound: {
    enable: "Activer le son",
    disable: "Couper le son",
  },
  language: {
    label: "Langue",
  },
};
