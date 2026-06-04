import { ChevronLeft, ChevronRight } from "lucide-react"
import type { MouseEvent } from "react"

import { Button } from "@/components/ui/button"

type CreateTournamentWizardNavigationProps = {
  canGoBack: boolean
  isLastStep: boolean
  loaded: boolean
  pending: boolean
  onBack: () => void
  onNext: () => void
}

function CreateTournamentWizardNavigation({
  canGoBack,
  isLastStep,
  loaded,
  pending,
  onBack,
  onNext,
}: CreateTournamentWizardNavigationProps) {
  const handleBack = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onBack()
  }

  const handleNext = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onNext()
  }

  return (
    <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={handleBack}
        disabled={!canGoBack || pending}
      >
        <ChevronLeft className="size-4" />
        Atrás
      </Button>

      {isLastStep ? (
        <Button key="publish" type="submit" disabled={pending || !loaded}>
          {pending ? "Publicando..." : "Publicar"}
        </Button>
      ) : (
        <Button
          key="continue"
          type="button"
          onClick={handleNext}
          disabled={pending || !loaded}
        >
          Continuar
          <ChevronRight className="size-4" />
        </Button>
      )}
    </div>
  )
}

export { CreateTournamentWizardNavigation }
