import { Badge } from "@/components/ui/badge"
import type { GroupsKnockoutBody } from "@/modules/tournaments/domain"

import { EliminationColumns } from "./elimination-view"
import { FixtureCard } from "./round-robin-view"

export function GroupsKnockoutView({ body }: { body: GroupsKnockoutBody }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {body.groups.map((group) => (
          <div key={group.name} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground">{group.name}</h3>
              <Badge variant="secondary">
                {group.participants.length} participantes
              </Badge>
            </div>

            <ol className="mt-3 space-y-1 text-sm">
              {group.participants.map((participant, index) => (
                <li key={participant.id} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-right text-xs text-muted-foreground">
                    {index + 1}.
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {participant.name}
                  </span>
                </li>
              ))}
            </ol>

            {group.rounds.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Calendario
                </p>
                <div className="space-y-2">
                  {group.rounds.map((round) => (
                    <FixtureCard key={round.name} round={round} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {body.knockout.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Fase final</h3>
          <EliminationColumns rounds={body.knockout} />
        </div>
      )}
    </div>
  )
}
