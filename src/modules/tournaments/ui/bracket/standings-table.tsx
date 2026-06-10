import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { Standing } from "@/modules/tournaments/domain"

const COLUMNS: { key: keyof Standing; label: string; title: string }[] = [
  { key: "played", label: "PJ", title: "Partidos jugados" },
  { key: "won", label: "G", title: "Ganados" },
  { key: "drawn", label: "E", title: "Empatados" },
  { key: "lost", label: "P", title: "Perdidos" },
  { key: "goalDifference", label: "Dif", title: "Diferencia" },
  { key: "points", label: "Pts", title: "Puntos" },
]

/**
 * League / group standings. `qualifiers` highlights the top N positions that
 * advance (the qualifying spots in a groups + knockout bracket).
 */
export function StandingsTable({
  standings,
  qualifiers = 0,
}: {
  standings: Standing[]
  qualifiers?: number
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8 text-center">#</TableHead>
          <TableHead>Participante</TableHead>
          {COLUMNS.map((column) => (
            <TableHead key={column.key} className="text-center" title={column.title}>
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((row, index) => {
          const qualifies = qualifiers > 0 && index < qualifiers
          return (
            <TableRow key={row.participantId} className={cn(qualifies && "bg-primary/5")}>
              <TableCell className="py-2 text-center text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  {qualifies && (
                    <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                  )}
                  {index + 1}
                </span>
              </TableCell>
              <TableCell className="py-2 font-medium text-foreground">{row.name}</TableCell>
              {COLUMNS.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    "py-2 text-center tabular-nums",
                    column.key === "points"
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {column.key === "goalDifference" && row.goalDifference > 0
                    ? `+${row.goalDifference}`
                    : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
