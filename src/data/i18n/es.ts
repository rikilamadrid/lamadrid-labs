import type { Dictionary } from "./en";

export const es: Dictionary = {
  meta: {
    title: "Lamadrid Labs",
    description: "Lamadrid Labs — un estudio de software independiente.",
  },
  nav: {
    process: "Proceso",
    work: "Trabajo",
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
  process: {
    eyebrow: "Cómo avanza un proyecto en el laboratorio",
    title: "Un espécimen, cinco etapas",
    lead: "Cada proyecto sigue la misma reacción, de principio a fin.",
    hud: {
      step: "Etapa",
      readout: "Lectura",
    },
    stages: {
      "reagent-selection": {
        title: "Selección de reactivos",
        stageLine: "La idea llega, reducida a lo que vale la pena construir.",
        serviceLine: "Descubrimiento y alcance.",
        hud: {
          status: "Estable",
          metrics: [
            { label: "Estado", value: "Filtrado" },
            { label: "Bloqueo", value: "Activado" },
          ],
        },
      },
      measurement: {
        title: "Medición",
        stageLine: "Cada requisito se pesa y el sistema se traza.",
        serviceLine: "Diseño de sistema y planificación técnica.",
        hud: {
          status: "Calibrado",
          metrics: [
            { label: "Alcance", value: "Trazado" },
            { label: "Carga", value: "Pesada" },
          ],
        },
      },
      synthesis: {
        title: "Síntesis",
        stageLine:
          "Código real, componentes reales, reaccionando hacia un producto funcional.",
        serviceLine: "Implementación e iteración.",
        hud: {
          status: "Reaccionando",
          metrics: [
            { label: "Construcción", value: "Activa" },
            { label: "Flujo", value: "Máximo" },
          ],
        },
      },
      purification: {
        title: "Purificación",
        stageLine: "Sin asperezas — probado, refinado, accesible.",
        serviceLine: "QA, accesibilidad y rendimiento.",
        hud: {
          status: "Refinado",
          metrics: [
            { label: "Asperezas", value: "Eliminadas" },
            { label: "Pruebas", value: "Superadas" },
          ],
        },
      },
      crystallization: {
        title: "Cristalización",
        stageLine: "La forma final: desplegada, documentada y hecha para durar.",
        serviceLine: "Despliegue y entrega.",
        hud: {
          status: "Fijado",
          metrics: [
            { label: "Forma", value: "Final" },
            { label: "Entrega", value: "Lista" },
          ],
        },
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
