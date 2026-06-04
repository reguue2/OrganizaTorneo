import { PublicPage } from "@/components/layout"
import { VerifyRegistrationFlow } from "@/modules/registrations/ui"

type SearchParams = Promise<{
  request?: string
  token?: string
  code?: string
}>

export default async function VerificarInscripcionPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { request = "", token = "", code = "" } = await searchParams

  return (
    <PublicPage size="narrow">
      <VerifyRegistrationFlow
        initialRequestId={request}
        initialToken={token}
        initialCode={code}
      />
    </PublicPage>
  )
}
