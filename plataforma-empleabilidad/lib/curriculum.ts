export type LearningModule = {
  id: string;
  title: string;
  description: string;
  resources: string[];
  locked: boolean;
};

export type Curriculum = {
  welcomeMessage: string;
  modules: LearningModule[];
};

export const CURRICULUM_STORAGE_KEY = "empleamas-curriculum-v1";
export const CURRICULUM_UPDATED_EVENT = "empleamas-curriculum-updated";

export const DEFAULT_CURRICULUM: Curriculum = {
  welcomeMessage:
    "Estás en un buen momento para impulsar tu carrera. Continúa con tu ruta de aprendizaje.",
  modules: [
    {
      id: "experiencia-1",
      title: "Experiencia de Aprendizaje 1 - FASE 1 | Definición Proyecto APT",
      description: "Define los objetivos principales de tu desarrollo laboral.",
      resources: [
        "Información EA1",
        "Autoevaluación EA1",
        "Espacio de consultas EA1",
        "Documento de Análisis FODA",
      ],
      locked: false,
    },
    {
      id: "experiencia-2",
      title: "Experiencia de Aprendizaje 2 - FASE 2 | Currículum de Alto Impacto",
      description: "Aprende a estructurar un CV que capte la atención.",
      resources: ["Plantilla de CV Profesional"],
      locked: false,
    },
    {
      id: "experiencia-3",
      title: "Experiencia de Aprendizaje 3 - FASE 3 | Estrategias y Entrevistas",
      description: "Optimiza tu perfil digital y prepárate para entrevistas.",
      resources: [],
      locked: true,
    },
  ],
};

export function loadCurriculum(): Curriculum {
  try {
    const stored = window.localStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (!stored) return DEFAULT_CURRICULUM;

    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== "object") return DEFAULT_CURRICULUM;

    const candidate = value as Partial<Curriculum>;
    if (typeof candidate.welcomeMessage !== "string" || !Array.isArray(candidate.modules)) {
      return DEFAULT_CURRICULUM;
    }

    const modules = candidate.modules.filter(
      (item): item is LearningModule =>
        Boolean(item) &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.description === "string" &&
        Array.isArray(item.resources) &&
        item.resources.every((resource) => typeof resource === "string") &&
        typeof item.locked === "boolean",
    );

    return { welcomeMessage: candidate.welcomeMessage, modules };
  } catch {
    return DEFAULT_CURRICULUM;
  }
}

export function saveCurriculum(curriculum: Curriculum): boolean {
  try {
    window.localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(curriculum));
    window.dispatchEvent(new Event(CURRICULUM_UPDATED_EVENT));
    return true;
  } catch {
    return false;
  }
}