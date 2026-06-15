import { PREDICTION_LOCK_MINUTES_BEFORE_KICKOFF } from "@/app/lib/constants";

// Zona horaria del navegador — se resuelve en runtime, no en build time.
// Esto garantiza que la hora se muestre correcta en móviles Android/iOS
// donde Intl sin timeZone explícito puede usar UTC en vez del timezone local.
function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: localTimeZone(),
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: localTimeZone(),
  }).format(new Date(date));
}

export function formatTimeOnly(date: string): string {
  return new Intl.DateTimeFormat("es", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: localTimeZone(),
  }).format(new Date(date));
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  if (mins > 0) return `hace ${mins} minuto${mins > 1 ? "s" : ""}`;
  return "ahora mismo";
}

export function formatMonthYear(date: string | Date) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function formatDateTwoDigit(date: string | Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function formatTimeTwoDigit(date: string | Date) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function getPredictionLockDate(kickoffAt: string | Date) {
  return new Date(
    new Date(kickoffAt).getTime() -
      PREDICTION_LOCK_MINUTES_BEFORE_KICKOFF * 60 * 1000,
  );
}

export function isPredictionLocked(kickoffAt: string | Date) {
  return Date.now() >= getPredictionLockDate(kickoffAt).getTime();
}

export function getMinutesUntilPredictionLock(kickoffAt: string | Date) {
  return Math.max(
    0,
    Math.floor(
      (getPredictionLockDate(kickoffAt).getTime() - Date.now()) / 60_000,
    ),
  );
}
