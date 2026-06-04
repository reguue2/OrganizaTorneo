"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

import { CreateTournamentHiddenFields } from "./hidden-fields"
import { BasicsStep } from "./steps/basics-step"
import { DetailsStep } from "./steps/details-step"
import { PricingStep } from "./steps/pricing-step"
import { ReviewStep } from "./steps/review-step"
import { StructureStep } from "./steps/structure-step"
import { CreateTournamentStepSidebar } from "./step-sidebar"
import { useCreateTournamentForm } from "./use-create-tournament-form"
import { CreateTournamentWizardNavigation } from "./wizard-navigation"

function CreateTournamentForm() {
  const {
    addOrSaveCategory,
    canGoBack,
    categoryDraft,
    categoryErrors,
    changePoster,
    clearPoster,
    currentStepIndex,
    draft,
    dropPoster,
    editCategory,
    editingCategoryId,
    errors,
    fileInputRef,
    formAction,
    goBack,
    goNext,
    isLastStep,
    loaded,
    pending,
    posterName,
    posterPreview,
    previewItems,
    removeCategory,
    resetCategoryEditor,
    serverState,
    setCategoryDraft,
    setDraftValue,
    step,
    submit,
  } = useCreateTournamentForm()

  return (
    <form
      action={formAction}
      onSubmit={submit}
      className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]"
    >
      <CreateTournamentHiddenFields draft={draft} />
      <Input
        ref={fileInputRef}
        type="file"
        name="poster"
        accept="image/*"
        onChange={changePoster}
        className="sr-only"
        tabIndex={-1}
      />

      <CreateTournamentStepSidebar
        currentStep={step}
        currentStepIndex={currentStepIndex}
      />

      <div className="min-w-0 space-y-6">
        {serverState.error && (
          <Alert variant="destructive">
            <AlertTitle>No se pudo crear el torneo</AlertTitle>
            <AlertDescription>{serverState.error}</AlertDescription>
          </Alert>
        )}

        {step === "basics" && (
          <BasicsStep
            draft={draft}
            errors={errors}
            onDraftChange={setDraftValue}
          />
        )}

        {step === "structure" && (
          <StructureStep
            categoryDraft={categoryDraft}
            categoryErrors={categoryErrors}
            draft={draft}
            editingCategoryId={editingCategoryId}
            errors={errors}
            onAddOrSaveCategory={addOrSaveCategory}
            onCancelCategoryEdit={resetCategoryEditor}
            onCategoryDraftChange={(patch) =>
              setCategoryDraft((current) => ({ ...current, ...patch }))
            }
            onDraftChange={setDraftValue}
            onEditCategory={editCategory}
            onRemoveCategory={removeCategory}
          />
        )}

        {step === "pricing" && (
          <PricingStep
            draft={draft}
            errors={errors}
            onDraftChange={setDraftValue}
          />
        )}

        {step === "details" && (
          <DetailsStep
            draft={draft}
            errors={errors}
            fileInputRef={fileInputRef}
            posterName={posterName}
            posterPreview={posterPreview}
            onClearPoster={clearPoster}
            onDraftChange={setDraftValue}
            onPosterDrop={dropPoster}
          />
        )}

        {step === "review" && (
          <ReviewStep
            draft={draft}
            posterName={posterName}
            posterPreview={posterPreview}
            previewItems={previewItems}
          />
        )}

        <CreateTournamentWizardNavigation
          canGoBack={canGoBack}
          isLastStep={isLastStep}
          loaded={loaded}
          pending={pending}
          onBack={goBack}
          onNext={goNext}
        />
      </div>
    </form>
  )
}

export { CreateTournamentForm }
