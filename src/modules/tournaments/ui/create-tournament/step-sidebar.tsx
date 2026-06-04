import { Check } from "lucide-react"

import { Card } from "@/components/ui/card"

import { CREATE_TOURNAMENT_STEPS } from "./form-state"
import type { CreateTournamentStepId } from "./types"

type CreateTournamentStepSidebarProps = {
  currentStep: CreateTournamentStepId
  currentStepIndex: number
}

function CreateTournamentStepSidebar({
  currentStep,
  currentStepIndex,
}: CreateTournamentStepSidebarProps) {
  return (
    <aside className="space-y-3">
      <Card className="p-3">
        <div className="space-y-1">
          {CREATE_TOURNAMENT_STEPS.map((item, index) => {
            const isActive = item.id === currentStep
            const isDone = index < currentStepIndex

            return (
              <div
                key={item.id}
                aria-current={isActive ? "step" : undefined}
                className={
                  "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm " +
                  (isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground")
                }
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                  {isDone ? <Check className="size-3" /> : index + 1}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
            )
          })}
        </div>
      </Card>

    </aside>
  )
}

export { CreateTournamentStepSidebar }
