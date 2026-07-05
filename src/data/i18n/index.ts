import type { Locale } from "@/lib/locale";
import { en, type Dictionary } from "./en";
import { es } from "./es";
import { fr } from "./fr";

export type { Dictionary } from "./en";

export const dictionaries: Record<Locale, Dictionary> = { en, fr, es };
