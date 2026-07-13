import type { Dictionary } from "./en";

export const es: Dictionary = {
  meta: {
    title: "Lamadrid Labs",
    description: "Lamadrid Labs — un estudio de software independiente.",
  },
  nav: {
    work: "Trabajo",
    services: "Servicios",
    about: "Acerca de",
    contact: "Contacto",
    skipToContent: "Ir al contenido",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },
  hero: {
    eyebrow: "Laboratorio de software independiente",
    titleFirst: "Las ideas entran.",
    titleHighlight: "software",
    titleAfter: " sale.",
    titleBefore: "El ",
    lead: "Lamadrid Labs es el hogar claro y enfocado de los productos, experimentos y proyectos de cliente creados por Ricardo Lamadrid.",
    ctaPrimary: "Ver el trabajo",
    ctaSecondary: "Lo que creamos",
  },
  narrative: {
    eyebrow: "Cómo avanza un proyecto en el laboratorio",
    title: "Cinco etapas, un solo espécimen",
    lead: "Cada proyecto pasa por el mismo proceso, de principio a fin.",
    stages: {
      intake: {
        kicker: "01 — Recepción",
        title: "Llega la idea",
        description:
          "Llega una idea sin pulir, un problema de negocio o una pregunta ambiciosa. Le dedico el tiempo necesario para entender qué se pide realmente — no solo lo que se dice.",
        detail: "Descubrimiento, definición de alcance y un brief claro sobre el que construir.",
      },
      architecture: {
        kicker: "02 — Arquitectura",
        title: "Bajo el microscopio",
        description:
          "Antes de construir nada, se diseña. Modelos de datos, límites del sistema y las decisiones que hacen que el software sea fácil de cambiar después, no difícil.",
        detail:
          "Diseño de sistema, planificación técnica y un plano que no se derrumba con el uso real.",
      },
      build: {
        kicker: "03 — Construcción",
        title: "El laboratorio se pone ruidoso",
        description:
          "Aquí es donde ocurre el código — componentes reales, lógica real, casos límite reales. Avance constante y deliberado, no una carrera hacia algo que apenas compila.",
        detail: "Implementación, iteración y un producto realmente usable en cada paso.",
      },
      test: {
        kicker: "04 — Prueba",
        title: "Poner a prueba el espécimen",
        description:
          "Un software que no se ha probado es solo una hipótesis. Esta etapa lo pone a prueba — accesibilidad, rendimiento, casos límite — hasta que resiste condiciones reales.",
        detail: "QA, revisiones de accesibilidad y pruebas de rendimiento antes de lanzar nada.",
      },
      ship: {
        kicker: "05 — Lanzamiento",
        title: "Sale al mundo",
        description:
          "El espécimen deja el laboratorio. Desplegado, documentado y entregado — listo para hacer su trabajo sin que nadie lo esté vigilando.",
        detail: "Despliegue, entrega y la tranquilidad de que seguirá funcionando.",
      },
    },
  },
  process: {
    eyebrow: "Cómo avanza un proyecto en el laboratorio",
    title: "Un espécimen, cinco etapas",
    lead: "Cada proyecto sigue la misma reacción, de principio a fin.",
    stages: {
      "reagent-selection": {
        title: "Selección de reactivos",
        stageLine: "La idea llega, reducida a lo que vale la pena construir.",
        serviceLine: "Descubrimiento y alcance.",
      },
      measurement: {
        title: "Medición",
        stageLine: "Cada requisito se pesa y el sistema se traza.",
        serviceLine: "Diseño de sistema y planificación técnica.",
      },
      synthesis: {
        title: "Síntesis",
        stageLine:
          "Código real, componentes reales, reaccionando hacia un producto funcional.",
        serviceLine: "Implementación e iteración.",
      },
      purification: {
        title: "Purificación",
        stageLine: "Sin asperezas — probado, refinado, accesible.",
        serviceLine: "QA, accesibilidad y rendimiento.",
      },
      crystallization: {
        title: "Cristalización",
        stageLine: "La forma final: desplegada, documentada y hecha para durar.",
        serviceLine: "Despliegue y entrega.",
      },
    },
  },
  work: {
    eyebrow: "Trabajo seleccionado",
    title: "Desde el laboratorio",
    lead: "Una muestra de lo que ya está en marcha — proyectos reales, usuarios reales.",
    featuredLabel: "Destacado",
    restTitle: "Más del laboratorio",
    viewProject: "Ver proyecto",
    status: {
      live: "En vivo",
      active: "En progreso",
      comingSoon: "Próximamente",
      archived: "Archivado",
    },
    type: {
      product: "Producto",
      website: "Sitio web",
      experiment: "Experimento",
      caseStudy: "Caso de estudio",
    },
    projects: {
      "ricardo-os": {
        title: "RicardoOS",
        summary:
          "El sitio personal de Ricardo reinventado como una experiencia de portafolio inspirada en un sistema operativo.",
        tags: ["Next.js", "React", "Diseño de interacción", "Personal"],
      },
      "marina-cuesta": {
        title: "Marina Cuesta",
        summary:
          "Un sitio web pulido y a medida creado para Marina Cuesta — un ejemplo de diseño limpio e implementación cuidada.",
        tags: ["Diseño web", "Next.js", "Trabajo de cliente"],
      },
      subrooms: {
        title: "SubRooms",
        summary:
          "Un organizador de suscripciones de YouTube que convierte un feed ruidoso en salas de visualización enfocadas como Programación, Cocina y Música.",
        tags: ["React", "TypeScript", "Sistema de diseño", "Vercel"],
      },
      "writer-companion": {
        title: "Writer Companion",
        summary:
          "Una app de coaching de escritura que convierte una idea de historia en impulso de escritura diario, con tareas guiadas y retroalimentación.",
        tags: ["Next.js", "TypeScript", "IA", "Vercel"],
      },
    },
  },
  finale: {
    eyebrow: "El resultado",
    title: "La prueba de que funciona",
    lead: "El proceso de arriba no es teoría. RicardoOS pasó por cada etapa — de la recepción al lanzamiento — y está en vivo.",
    featuredLabel: "En producción",
    featuredCta: "Abrir RicardoOS",
    restTitle: "El resto de los especímenes",
    restCta: "Visitar",
  },
  services: {
    eyebrow: "Cómo trabajamos juntos",
    title: "Servicios",
    lead: "Formas concretas de trabajar con el laboratorio, desde una sola funcionalidad hasta soporte continuo.",
    items: {
      "product-engineering": {
        title: "Ingeniería de producto",
        summary: "Convertir ideas en productos web claros y usables.",
        outcomes: [
          "Un producto en funcionamiento, no solo un prototipo",
          "Alcance claro y un camino rápido hacia el lanzamiento",
          "Código mantenible sobre el que puedes seguir construyendo",
        ],
      },
      "design-engineering": {
        title: "Ingeniería de diseño",
        summary:
          "Interfaces pulidas, detalles de interacción y UI lista para producción.",
        outcomes: [
          "Interfaces cuidadas al detalle y accesibles",
          "Movimiento e interacción bien pensados",
          "Un sistema de diseño coherente, no pantallas sueltas",
        ],
      },
      "ai-workflow-engineering": {
        title: "Ingeniería de flujos con IA",
        summary:
          "Automatizaciones prácticas, flujos con LLM, prototipos agénticos e integraciones de API.",
        outcomes: [
          "Automatizaciones que eliminan trabajo repetitivo real",
          "Flujos con LLM y agentes conectados a tus herramientas",
          "Funciones de IA prácticas, no demos de moda",
        ],
      },
      "frontend-architecture": {
        title: "Arquitectura frontend",
        summary:
          "Sistemas escalables en React/Next.js, sistemas de diseño, rendimiento, accesibilidad y mantenibilidad.",
        outcomes: [
          "Arquitectura que escala junto con el equipo",
          "Buenas bases de rendimiento y accesibilidad",
          "Código que se mantiene limpio al crecer",
        ],
      },
      "freelance-technical-partner": {
        title: "Socio técnico freelance",
        summary:
          "Soporte de ingeniería senior para fundadores, creadores y equipos pequeños.",
        outcomes: [
          "Un socio senior que construye contigo",
          "Criterio de producto junto con el código",
          "Soporte flexible sin la carga de una agencia",
        ],
      },
    },
  },
  about: {
    eyebrow: "Acerca de",
    title: "La persona detrás del laboratorio",
    lead: "Lamadrid Labs es una sola persona, trabajando como un pequeño estudio.",
    paragraphs: [
      "Ricardo Lamadrid es un ingeniero de software que construye productos de principio a fin — desde los detalles de la interfaz hasta los sistemas que hay detrás. Lamadrid Labs es donde vive ese trabajo: proyectos personales, trabajo de cliente y algún experimento ocasional que no encaja en ningún otro lado.",
      "El hilo conductor es el cuidado. Cada proyecto recibe la misma atención al detalle, ya sea una herramienta personal o el producto de un cliente — código limpio, diseño cuidado y software que se siente pensado, no ensamblado.",
    ],
  },
  contact: {
    eyebrow: "Contacto",
    title: "¿Tienes un proyecto en mente?",
    lead: "Escríbeme directamente — sin formularios, sin idas y vueltas.",
    cta: "Enviar un correo a hello@lamadridlabs.com",
  },
  footer: {
    rights: "Todos los derechos reservados.",
  },
  language: {
    label: "Idioma",
  },
};
