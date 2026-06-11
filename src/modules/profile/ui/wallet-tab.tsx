import {
  ArrowDownToLine,
  Banknote,
  CreditCard,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatEur, type OrganizerWallet } from "@/modules/profile/domain"

function SummaryCard({
  icon,
  label,
  amount,
  hint,
}: {
  icon: React.ReactNode
  label: string
  amount: string
  hint: string
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
            {icon}
          </span>
          {label}
        </div>
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {amount}
        </p>
        <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

export function WalletTab({ wallet }: { wallet: OrganizerWallet }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Recaudado en total
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              {formatEur(wallet.totalCollected)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Suma de lo cobrado online y en efectivo en tus torneos.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-1 sm:items-end">
            <Button type="button" disabled>
              <ArrowDownToLine data-icon="inline-start" />
              Retirar
            </Button>
            <span className="text-center text-xs text-muted-foreground sm:text-right">
              Próximamente
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<CreditCard className="size-4" />}
          label="Disponible (online)"
          amount={formatEur(wallet.availableOnline)}
          hint="Pagos online confirmados. Podrás retirarlo cuando se conecten los pagos."
        />
        <SummaryCard
          icon={<Banknote className="size-4" />}
          label="En efectivo"
          amount={formatEur(wallet.collectedCash)}
          hint="Cobrado en mano por ti. La app no custodia este dinero."
        />
        <SummaryCard
          icon={<Clock className="size-4" />}
          label="Pendiente (online)"
          amount={formatEur(wallet.pendingOnline)}
          hint="Pagos online iniciados que aún no se han confirmado."
        />
      </div>
    </div>
  )
}
