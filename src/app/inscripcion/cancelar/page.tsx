import { PublicPage } from "@/components/layout"
import { CancelRegistrationFlow } from "@/modules/registrations/ui"

type SearchParams = Promise<{
  reference?: string
  token?: string
  code?: string
}>

export default async function CancelarInscripcionPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { reference = "", token = "", code = "" } = await searchParams

  return (
    <PublicPage size="narrow">
      <CancelRegistrationFlow
        initialReference={reference}
        initialToken={token}
        initialCode={code}
      />
    </PublicPage>
  )
}
