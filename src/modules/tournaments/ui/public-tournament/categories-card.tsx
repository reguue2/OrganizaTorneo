import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatDate,
  formatMoney,
  type PublicTournamentCategory,
} from "@/modules/tournaments/domain"

function TournamentCategoriesCard({
  categories,
}: {
  categories: PublicTournamentCategory[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías disponibles</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-lg border border-border p-4">
            <div className="min-w-0 space-y-2">
              <h3 className="text-base font-semibold text-foreground">
                {category.name}
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Precio: {formatMoney(category.price)}</p>
                <p>
                  Plazas:{" "}
                  {category.max_participants === null
                    ? "sin límite"
                    : `${category.max_participants} plazas`}
                </p>
                {category.start_at && (
                  <p>
                    Fecha/hora:{" "}
                    {formatDate(category.start_at, { withTime: true })}
                  </p>
                )}
                {category.address && <p>Dirección: {category.address}</p>}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export { TournamentCategoriesCard }
