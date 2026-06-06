import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BRACKET_FORMAT_LABELS,
  type TournamentBracketRow,
} from "@/modules/tournaments/domain"

import { BracketView } from "./bracket-view"

export function BracketSections({
  brackets,
  categories = [],
}: {
  brackets: TournamentBracketRow[]
  categories?: { id: string; name: string }[]
}) {
  const categoryName = new Map(categories.map((category) => [category.id, category.name]))

  const ordered = [...brackets].sort((a, b) => {
    const aName = a.category_id ? categoryName.get(a.category_id) ?? "" : ""
    const bName = b.category_id ? categoryName.get(b.category_id) ?? "" : ""
    return aName.localeCompare(bName)
  })

  return (
    <div className="space-y-6">
      {ordered.map((bracket) => {
        const title = bracket.category_id
          ? categoryName.get(bracket.category_id) ?? "Categoría"
          : "Cuadro general"

        return (
          <Card key={bracket.id}>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{BRACKET_FORMAT_LABELS[bracket.format]}</Badge>
                <Badge variant="outline">{bracket.participant_count} participantes</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <BracketView structure={bracket.structure} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
