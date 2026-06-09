import {
  ArrowDownToLine,
  Banknote,
  CreditCard,
  Clock,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import {
  formatEur,
  formatWalletDate,
  type OrganizerWallet,
  type WalletPaymentMethod,
  type WalletPaymentStatus,
} from "@/modules/profile/domain"

function methodLabel(method: WalletPaymentMethod | null): string {
  if (method === "online") return "Online"
  if (method === "cash") return "Efectivo"
  return "—"
}

function StatusBadge({ status }: { status: WalletPaymentStatus | null }) {
  if (status === "paid") return <Badge variant="success">Pagado</Badge>
  if (status === "pending") return <Badge variant="warning">Pendiente</Badge>
  if (status === "refunded") return <Badge variant="destructive">Reembolsado</Badge>
  return <Badge variant="outline">—</Badge>
}

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

      <Card>
        <CardHeader>
          <CardTitle>Movimientos</CardTitle>
          <CardDescription>
            Cada inscripción cobrada genera un movimiento en tu monedero.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {wallet.movements.length === 0 ? (
            <EmptyState
              icon={<Wallet className="size-5" />}
              title="Aún no hay movimientos"
              description="Cuando cobres inscripciones de tus torneos aparecerán aquí."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Torneo</th>
                    <th className="px-3 py-2 font-medium">Participante</th>
                    <th className="px-3 py-2 font-medium">Método</th>
                    <th className="px-3 py-2 font-medium">Estado</th>
                    <th className="px-3 py-2 font-medium">Fecha</th>
                    <th className="px-3 py-2 text-right font-medium">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.movements.map((movement) => (
                    <tr key={movement.id} className="border-b border-border/60">
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {movement.tournamentTitle}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {movement.participantName}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {methodLabel(movement.method)}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={movement.status} />
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {formatWalletDate(movement.date)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-foreground">
                        {formatEur(movement.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
