import type { Dictionary } from "./en";

export const es: Dictionary = {
  meta: {
    title: "Lamadrid Labs",
    description: "Lamadrid Labs: un estudio de software independiente.",
  },
  nav: {
    home: "Inicio",
    work: "Proyectos",
    about: "Acerca de",
    contact: "Contacto",
    skipToContent: "Ir al contenido",
    primary: "Principal",
  },
  shell: {
    inDevelopment: "En desarrollo",
  },
  hero: {
    eyebrow: "Estudio de software independiente",
    titleLines: ["El ruido se vuelve", "estructura."],
    lead: "Lamadrid Labs convierte requisitos dispersos e ideas a medio formar en sistemas claros y software terminado.",
    ctaPrimary: "Ver el trabajo",
  },
  work: {
    eyebrow: "Sistemas seleccionados",
    title: "El trabajo, resuelto.",
    supporting:
      "Cuatro problemas distintos. Cuatro sistemas moldeados en algo utilizable.",
    lead: "Una muestra de lo que ya está en marcha: proyectos reales, usuarios reales.",
    featuredLabel: "Destacado",
    restTitle: "Más trabajo",
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
    world: {
      overview: "Proyecto",
      enter: "Entrar al proyecto",
      problem: "Problema",
      solution: "Solución",
      outcome: "Resultado",
      tech: "Hecho con",
      architecture: "Arquitectura",
      results: "Resultados",
      visitLive: "Ver en vivo",
      viewSource: "Ver código",
      back: "Volver al trabajo",
      scroll: "Desplázate para explorar",
    },
    projects: {
      "ricardo-os": {
        title: "RicardoOS",
        summary:
          "El sitio personal de Ricardo reinventado como una experiencia de portafolio inspirada en un sistema operativo.",
        tags: ["Next.js", "React", "Diseño de interacción", "Personal"],
        world: {
          statement:
            "Un portafolio personal reinventado como un sistema operativo que de verdad puedes usar.",
          problem:
            "Un currículum y una lista de enlaces te dicen qué ha hecho alguien. No te dejan sentir cómo piensa. El portafolio tenía que ser el argumento en sí: prueba de oficio, no una descripción de él.",
          solution:
            "RicardoOS convierte el portafolio en un entorno de escritorio: ventanas, un dock y apps que abren cada una una faceta distinta del trabajo. No recorres una página, exploras un sistema, igual que explorarías cualquier producto que construye Ricardo.",
          outcome:
            "El medio se vuelve el mensaje. Para cuando has abierto una ventana y la has movido, ya has sentido el oficio de interacción que el portafolio intenta transmitir, sin necesidad de un caso de estudio.",
          architecture: [
            "Next.js App Router con un gestor de ventanas del lado del cliente para ventanas arrastrables, enfocables y apilables.",
            "Un registro de apps tipado, de modo que añadir una ventana es un dato, no una reconstrucción.",
            "Estado local y efímero: sin backend, exportable de forma estática, rápido de cargar.",
          ],
          results: [
            "Publicado y en vivo en ricardolamadrid.com.",
            "Se lee como un producto, no como una página: la interacción misma es la prueba del oficio.",
          ],
        },
      },
      "marina-cuesta": {
        title: "Marina Cuesta",
        summary:
          "Un sitio web pulido y a medida creado para Marina Cuesta: un ejemplo de diseño limpio e implementación cuidada.",
        tags: ["Diseño web", "Next.js", "Trabajo de cliente"],
        world: {
          statement:
            "Un sitio web a medida y tranquilo que deja que el trabajo hable primero.",
          problem:
            "Marina necesitaba un hogar en línea tan cuidado como su propio trabajo, ni una plantilla ni un constructor de páginas, algo que se leyera como intencional.",
          solution:
            "Un sitio a medida con una composición sobria, tipografía cuidada y la justa dosis de movimiento para sentirse vivo sin estorbar.",
          outcome:
            "Un sitio personal limpio y rápido que parece hecho, no ensamblado.",
          architecture: [
            "Next.js con generación estática para un sitio rápido y barato de alojar.",
            "Estilos basados en tokens de diseño, para que el aspecto se mantenga consistente y fácil de ajustar.",
          ],
          results: ["Publicado y en vivo en marinacuesta.com."],
        },
      },
      subrooms: {
        title: "SubRooms",
        summary:
          "Un organizador de suscripciones de YouTube que convierte un feed ruidoso en salas de visualización enfocadas como Programación, Cocina y Música.",
        tags: ["React", "TypeScript", "Sistema de diseño", "Vercel"],
        world: {
          statement: "Convierte un feed ruidoso de YouTube en salas enfocadas.",
          problem:
            "Un único feed de suscripciones lo mezcla todo (programación, cocina, música), así que nada recibe toda tu atención.",
          solution:
            "SubRooms ordena los canales en salas con un propósito, de modo que cada sesión tiene un foco único y claro.",
          outcome:
            "Un feed de suscripciones que por fin encaja con cómo la gente ve de verdad: un contexto a la vez.",
          architecture: [
            "App de una sola página en React y TypeScript con un sistema de diseño pequeño y consistente.",
            "Desplegado en Vercel.",
          ],
          results: ["Publicado y en vivo."],
        },
      },
      "writer-companion": {
        title: "Writer Companion",
        summary:
          "Una app de coaching de escritura que convierte una idea de historia en impulso de escritura diario, con tareas guiadas y retroalimentación.",
        tags: ["Next.js", "TypeScript", "IA", "Vercel"],
        world: {
          statement:
            "Convierte una idea de historia en impulso de escritura diario.",
          problem:
            "La mayoría de las herramientas de escritura guardan palabras. Casi ninguna te ayuda a seguir, día tras día.",
          solution:
            "Writer Companion divide una historia en tareas guiadas y comentarios amables, de modo que el siguiente paso siempre es obvio y el hábito se construye solo.",
          outcome:
            "Escribir se vuelve una secuencia de pasos pequeños y factibles en lugar de una página en blanco.",
          architecture: [
            "Next.js y TypeScript con orientación asistida por IA.",
            "Desplegado en Vercel.",
          ],
          results: ["Publicado y en vivo."],
        },
      },
    },
  },
  about: {
    eyebrow: "Acerca de",
    title: "La persona detrás del laboratorio",
    lead: "Lamadrid Labs es una sola persona, trabajando como un pequeño estudio.",
    paragraphs: [
      "Ricardo Lamadrid es un ingeniero de software que construye productos de principio a fin, desde los detalles de la interfaz hasta los sistemas que hay detrás. Lamadrid Labs es donde vive ese trabajo: proyectos personales, trabajo de cliente y algún experimento ocasional que no encaja en ningún otro lado.",
      "El hilo conductor es el cuidado. Cada proyecto recibe la misma atención al detalle, ya sea una herramienta personal o el producto de un cliente: código limpio, diseño cuidado y software que se siente pensado, no ensamblado.",
    ],
  },
  contact: {
    eyebrow: "Contacto",
    title: "¿Tienes un proyecto en mente?",
    lead: "Escríbeme directamente: sin formularios, sin idas y vueltas.",
    cta: "Enviar un correo a hello@lamadridlabs.com",
  },
  footer: {
    rights: "Todos los derechos reservados.",
  },
  sound: {
    enable: "Activar sonido",
    disable: "Desactivar sonido",
  },
  language: {
    label: "Idioma",
  },
};
