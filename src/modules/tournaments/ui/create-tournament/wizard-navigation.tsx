import { ChevronLeft, ChevronRight, Save } from "lucide-react"

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
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={!canGoBack || pending}
      >
        <ChevronLeft className="size-4" />
        Atrás
      </Button>

      {isLastStep ? (
        <Button type="submit" disabled={pending || !loaded}>
          <Save className="size-4" />
          {pending ? "Creando..." : "Crear y publicar"}
        </Button>
      ) : (
        <Button type="button" onClick={onNext} disabled={pending || !loaded}>
          Continuar
          <ChevronRight className="size-4" />
        </Button>
      )}
    </div>
  )
}

export { CreateTournamentWizardNavigation }
