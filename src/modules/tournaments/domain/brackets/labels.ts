import type { BracketFormat } from "./types"

export const BRACKET_FORMAT_LABELS: Record<BracketFormat, string> = {
  single_elimination: "Eliminación directa",
  round_robin: "Liga (todos contra todos)",
  groups_knockout: "Grupos + eliminatoria",
}

export function getBracketFormatLabel(format: BracketFormat): string {
  return BRACKET_FORMAT_LABELS[format] ?? format
}
