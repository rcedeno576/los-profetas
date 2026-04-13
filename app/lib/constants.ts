import type { Avatar, League, ScoringRule } from "./types";

// ─── Avatares ──────────────────────────────────────────────────────────────────
export const AVATARS: Avatar[] = [
  { id: "avatar_1", emoji: "🧙‍♂️", label: "Mago" },
  { id: "avatar_2", emoji: "🦁", label: "León" },
  { id: "avatar_3", emoji: "🐺", label: "Lobo" },
  { id: "avatar_4", emoji: "🦅", label: "Águila" },
  { id: "avatar_5", emoji: "🐉", label: "Dragón" },
  { id: "avatar_6", emoji: "⚡", label: "Rayo" },
  { id: "avatar_7", emoji: "🔮", label: "Oráculo" },
  { id: "avatar_8", emoji: "🏆", label: "Campeón" },
  // Pixel art
  { id: "avatar_9", emoji: "💥", label: "SSJ", image: "/avatars/9.png" },
  { id: "avatar_10", emoji: "💥", label: "SSJ", image: "/avatars/10.png" },
  { id: "avatar_11", emoji: "⚽", label: "Capitán", image: "/avatars/11.png" },
  { id: "avatar_12", emoji: "🎮", label: "Plomero", image: "/avatars/12.png" },
  { id: "avatar_13", emoji: "⚔️", label: "Espartano", image: "/avatars/13.png" },
  { id: "avatar_14", emoji: "⚔️", label: "Poderoso", image: "/avatars/14.png" },
  { id: "avatar_15", emoji: "🎮", label: "Soldado", image: "/avatars/15.png" },
  { id: "avatar_16", emoji: "🎮", label: "Héroe", image: "/avatars/16.png" },
  { id: "avatar_17", emoji: "💥", label: "Toro", image: "/avatars/17.png" },
  {
    id: "avatar_18",
    emoji: "💥",
    label: "Pirata",
    image: "/avatars/18.png",
  },
  {
    id: "avatar_19",
    emoji: "💥",
    label: "Alquimista",
    image: "/avatars/19.png",
  },
  { id: "avatar_20", emoji: "🔮", label: "Murciélago", image: "/avatars/20.png" },
  {
    id: "avatar_30",
    emoji: "🎮",
    label: "Jefe",
    image: "/avatars/30.png",
  },
  { id: "avatar_40", emoji: "⚽", label: "Dinho", image: "/avatars/40.png" },
  { id: "avatar_41", emoji: "⚽", label: "Pulga", image: "/avatars/41.png" },
  { id: "avatar_42", emoji: "⚽", label: "Pelusa", image: "/avatars/42.png" },
  { id: "avatar_43", emoji: "⚽", label: "O Rei", image: "/avatars/43.png" },
  { id: "avatar_44", emoji: "⚽", label: "Bicho", image: "/avatars/44.png" },
];

export function getAvatar(id: string): Avatar {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}

// ─── Ligas de fútbol ───────────────────────────────────────────────────────────
// Defaults del front — la fuente de verdad es la BD (tabla leagues)
// El superadmin gestiona esto desde el panel en el futuro
export const LEAGUES: League[] = [
  { id: 1, code: "PL", name: "Premier League", active: true },
  { id: 2, code: "CL", name: "Champions League", active: true },
  { id: 3, code: "WC", name: "Copa del Mundo FIFA", active: true },
];

export function getLeague(id: number): League | undefined {
  return LEAGUES.find((l) => l.id === id);
}

export function getLeagueByCode(code: string): League | undefined {
  return LEAGUES.find((l) => l.code === code);
}

// ─── Tipo de competición ───────────────────────────────────────────────────────
// Define cómo se muestra la UI de fixtures:
//   'league' → jornadas (matchday 1, 2, 3...)
//   'cup'    → fases eliminatorias (Octavos, Semis, Final...)
export type CompetitionType = "league" | "cup";

export const COMPETITION_TYPE: Record<string, CompetitionType> = {
  PL: "league", // Premier League
  BL1: "league", // Bundesliga
  DED: "league", // Eredivisie
  BSA: "league", // Brasileirão
  PD: "league", // La Liga
  FL1: "league", // Ligue 1
  ELC: "league", // Championship
  PPL: "league", // Primeira Liga
  SA: "league", // Serie A
  CL: "cup", // Champions League
  EC: "cup", // Eurocopa
  WC: "cup", // Copa del Mundo
};

// ─── Estados de partido (Match status) ────────────────────────────────────────
// Mapeo completo de todos los valores posibles de football-data.org
// hacia nuestros estados internos simplificados

export type MatchStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "suspended"
  | "cancelled";

// Para guardar en BD (nuestro sistema simplificado)
export const STATUS_MAP: Record<string, MatchStatus> = {
  SCHEDULED: "scheduled", // Programado (fecha conocida, hora no confirmada)
  TIMED: "scheduled", // Programado con hora confirmada
  IN_PLAY: "live", // En curso
  PAUSED: "live", // Medio tiempo
  EXTRA_TIME: "live", // Tiempo extra
  PENALTY_SHOOTOUT: "live", // Penales
  FINISHED: "finished", // Finalizado
  AWARDED: "finished", // Resultado asignado (W.O. o similar)
  SUSPENDED: "suspended", // Suspendido temporalmente
  POSTPONED: "suspended", // Pospuesto
  CANCELLED: "cancelled", // Cancelado definitivamente
};

// Para mostrar en la UI (etiquetas en español)
export const STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: "Programado",
  live: "En vivo",
  finished: "Finalizado",
  suspended: "Suspendido",
  cancelled: "Cancelado",
};

// Colores por estado
export const STATUS_COLOR: Record<MatchStatus, string> = {
  scheduled: "text-gray-400",
  live: "text-emerald-400",
  finished: "text-white",
  suspended: "text-amber-400",
  cancelled: "text-red-400",
};

// Badge de fondo por estado (para chips/badges en la UI)
export const STATUS_BG: Record<MatchStatus, string> = {
  scheduled: "bg-gray-800 text-gray-400",
  live: "bg-emerald-500/20 text-emerald-400",
  finished: "bg-gray-700 text-white",
  suspended: "bg-amber-500/20 text-amber-400",
  cancelled: "bg-red-500/20 text-red-400",
};

// Indica si el partido acepta predicciones
export const STATUS_CAN_PREDICT: Record<MatchStatus, boolean> = {
  scheduled: true,
  live: false,
  finished: false,
  suspended: false,
  cancelled: false,
};

// ─── Fases / Stages ────────────────────────────────────────────────────────────
// Mapeo completo de todos los stages posibles de football-data.org

export const STAGE_LABEL: Record<string, string> = {
  // Fases de grupos
  LEAGUE_STAGE: "Fase de Liga",
  GROUP_STAGE: "Fase de Grupos",
  PRELIMINARY_ROUND: "Ronda Preliminar",

  // Clasificación
  QUALIFICATION: "Clasificación",
  QUALIFICATION_ROUND_1: "Clasificación — Ronda 1",
  QUALIFICATION_ROUND_2: "Clasificación — Ronda 2",
  QUALIFICATION_ROUND_3: "Clasificación — Ronda 3",

  // Playoffs
  PLAYOFFS: "Playoffs",
  PLAYOFF_ROUND_1: "Playoff — Ronda 1",
  PLAYOFF_ROUND_2: "Playoff — Ronda 2",

  // Eliminación directa
  LAST_64: "Ronda de 64",
  LAST_32: "Ronda de 32",
  LAST_16: "Octavos de Final",
  QUARTER_FINALS: "Cuartos de Final",
  SEMI_FINALS: "Semifinales",
  THIRD_PLACE: "Tercer Puesto",
  FINAL: "Final",

  // Ligas domésticas
  REGULAR_SEASON: "Temporada Regular",
  CLAUSURA: "Clausura",
  APERTURA: "Apertura",
  CHAMPIONSHIP: "Final de Campeonato",
  RELEGATION: "Playoff de Descenso",
  RELEGATION_ROUND: "Ronda de Descenso",
  ROUND_1: "Ronda 1",
  ROUND_2: "Ronda 2",
  ROUND_3: "Ronda 3",
  ROUND_4: "Ronda 4",
};

// Orden de las fases para mostrarlas correctamente en la UI
// (de menos importante a más importante)
export const STAGE_ORDER: Record<string, number> = {
  PRELIMINARY_ROUND: 1,
  QUALIFICATION: 2,
  QUALIFICATION_ROUND_1: 3,
  QUALIFICATION_ROUND_2: 4,
  QUALIFICATION_ROUND_3: 5,
  PLAYOFF_ROUND_1: 6,
  PLAYOFF_ROUND_2: 7,
  LEAGUE_STAGE: 10,
  GROUP_STAGE: 10,
  REGULAR_SEASON: 10,
  CLAUSURA: 10,
  APERTURA: 10,
  PLAYOFFS: 18,
  LAST_64: 20,
  LAST_32: 30,
  LAST_16: 40,
  QUARTER_FINALS: 50,
  SEMI_FINALS: 60,
  THIRD_PLACE: 65,
  CHAMPIONSHIP: 68,
  RELEGATION: 69,
  RELEGATION_ROUND: 69,
  FINAL: 70,
};

// Helper: obtener etiqueta de stage con fallback
export function getStageLabel(stage: string): string {
  return STAGE_LABEL[stage] ?? stage.replace(/_/g, " ");
}

// ─── Grupos ────────────────────────────────────────────────────────────────────
// Mapeo de GROUP_A → Grupo A para la UI
export function getGroupLabel(group: string | null): string | null {
  if (!group) return null;
  return group.replace("GROUP_", "Grupo ");
}

// ─── Duración del partido ──────────────────────────────────────────────────────
export const DURATION_LABEL: Record<string, string> = {
  REGULAR: "Tiempo reglamentario",
  EXTRA_TIME: "Tiempo extra",
  PENALTY_SHOOTOUT: "Penales",
};

// ─── Reglas de puntuación ──────────────────────────────────────────────────────
export const SCORING_RULES_DEFAULTS: Pick<
  ScoringRule,
  "code" | "name" | "description"
>[] = [
  {
    code: "winner",
    name: "Ganador correcto",
    description: "Acertar quién gana o si hay empate",
  },
  {
    code: "home_goals",
    name: "Goles local exacto",
    description: "Acertar los goles del equipo local",
  },
  {
    code: "away_goals",
    name: "Goles visitante exacto",
    description: "Acertar los goles del equipo visitante",
  },
  {
    code: "goal_diff",
    name: "Diferencia de goles",
    description: "Acertar la diferencia de goles entre ambos equipos",
  },
  {
    code: "exact",
    name: "Marcador exacto",
    description: "Bonus por acertar ambos goles exactamente",
  },
];

// Puntos default al crear una liguilla
export const DEFAULT_RULE_PTS: Record<string, number> = {
  winner: 3,
  home_goals: 2,
  away_goals: 2,
  goal_diff: 1,
  exact: 2,
};

// ─── Reglas del juego ──────────────────────────────────────────────────────────
export const PREDICTION_LOCK_MINUTES = 5; // minutos antes del kickoff para cerrar predicciones

// ─── Límites ───────────────────────────────────────────────────────────────────
export const MAX_POOLS_PER_USER = 2;

// ─── Pool status ───────────────────────────────────────────────────────────────
export const POOL_STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  open: "Abierta",
  active: "En juego",
  finished: "Finalizada",
};

export const POOL_STATUS_COLOR: Record<string, string> = {
  draft: "text-gray-400",
  open: "text-green-400",
  active: "text-purple-400",
  finished: "text-amber-400",
};

export const POOL_STATUS_BG: Record<string, string> = {
  draft: "bg-gray-800 text-gray-400",
  open: "bg-green-500/20 text-green-400",
  active: "bg-purple-500/20 text-purple-400",
  finished: "bg-amber-500/20 text-amber-400",
};

// ─── Mensajes ──────────────────────────────────────────────────────────────────
export const MESSAGES = {
  auth: {
    registerSuccess: "¡Listo! Revisa tu email para confirmar tu cuenta.",
    loginError: "Email o contraseña incorrectos.",
    emailExists: "Este email ya está registrado.",
    genericError: "Hubo un problema. Intenta de nuevo.",
  },
  validation: {
    usernameRequired: "El nombre es obligatorio.",
    usernameInvalid: "Solo letras, números y guiones. Entre 3 y 30 caracteres.",
    emailInvalid: "El email no es válido.",
    passwordShort: "La contraseña debe tener al menos 8 caracteres.",
    passwordRequired: "La contraseña es obligatoria.",
  },
  pool: {
    maxReached: `Solo puedes crear hasta ${MAX_POOLS_PER_USER} liguillas.`,
    notFound: "Liguilla no encontrada.",
    invalidCode: "Código de invitación inválido.",
    alreadyMember: "Ya eres miembro de esta liguilla.",
    notOpen: "Esta liguilla ya no acepta nuevos miembros.",
    nameRequired: "El nombre de la liguilla es obligatorio.",
    leagueRequired: "Debes seleccionar una liga.",
  },
  sync: {
    success: "Fixtures sincronizados correctamente.",
    error: "Error al sincronizar fixtures.",
    unauthorized: "No autorizado.",
  },
  prediction: {
    saved: "Predicción guardada.",
    updated: "Predicción actualizada.",
    notFound: "Partido no encontrado.",
    notScheduled: "Este partido ya no acepta predicciones.",
    locked: "Predicciones cerradas (menos de 5 min para el inicio).",
    unauthorized: "No autenticado.",
    error: "Hubo un problema. Intenta de nuevo.",
  },
};

// ─── Design System ─────────────────────────────────────────────────────────────
export const COLORS = {
  brand: "#7C3AED",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  dark: "#030712",
};

// ─── Rutas ─────────────────────────────────────────────────────────────────────
export const PROTECTED_ROUTES = ["/dashboard", "/liga"];
export const AUTH_ROUTES = ["/login", "/register"];
