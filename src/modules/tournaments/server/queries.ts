import { createClient } from "@/lib/supabase/server"
import type {
  ExploreTournament,
  PublicTournamentCategory,
  PublicTournamentDetail,
  RegistrationCategory,
  RegistrationTournament,
  TournamentBracketRow,
} from "@/modules/tournaments/domain"
import { VISIBLE_PUBLIC_TOURNAMENT_STATUSES } from "@/modules/tournaments/domain"

export type PublicTournamentBrackets = {
  tournament: { id: string; title: string; has_categories: boolean }
  categories: { id: string; name: string }[]
  brackets: TournamentBracketRow[]
}

export type TournamentQueryResult<T> = {
  data: T
  error: string | null
}

function getOpenRegistrationFilterDate() {
  return new Date().toISOString()
}

export async function listPublishedPublicTournaments({
  province,
}: {
  province?: string | null
} = {}): Promise<TournamentQueryResult<ExploreTournament[]>> {
  const supabase = await createClient()
  const selectedProvince = province?.trim()
  const openRegistrationFilterDate = getOpenRegistrationFilterDate()

  let query = supabase
    .from("tournaments")
    .select(`
      id,
      title,
      poster_url,
      province,
      date,
      registration_deadline,
      status,
      has_categories,
      min_participants,
      max_participants,
      entry_price,
      payment_method,
      categories (
        id,
        name,
        price,
        min_participants,
        max_participants
      )
    `)
    .eq("status", "published")
    .eq("is_public", true)
    .or(
      `registration_deadline.is.null,registration_deadline.gte.${openRegistrationFilterDate}`
    )
    .order("date", { ascending: true })

  if (selectedProvince) {
    query = query.eq("province", selectedProvince)
  }

  const { data, error } = await query.returns<ExploreTournament[]>()

  return {
    data: data ?? [],
    error: error?.message ?? null,
  }
}

export async function getPublicTournamentDetail(tournamentId: string) {
  const supabase = await createClient()

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(`
      id,
      title,
      description,
      poster_url,
      prizes,
      rules,
      province,
      address,
      date,
      max_participants,
      min_participants,
      registration_deadline,
      payment_method,
      is_public,
      status,
      has_categories,
      prize_mode,
      entry_price
    `)
    .eq("id", tournamentId)
    .in("status", VISIBLE_PUBLIC_TOURNAMENT_STATUSES)
    .single()

  if (error || !tournament) {
    return null
  }

  let categories: PublicTournamentCategory[] = []
  const tournamentData = tournament as PublicTournamentDetail

  if (tournamentData.has_categories) {
    const { data } = await supabase
      .from("categories")
      .select("id,name,price,min_participants,max_participants,start_at,address,prizes")
      .eq("tournament_id", tournamentId)
      .order("name", { ascending: true })

    categories = (data as PublicTournamentCategory[]) ?? []
  }

  return {
    tournament: tournamentData,
    categories,
  }
}

export async function getPublicTournamentBrackets(
  tournamentId: string
): Promise<PublicTournamentBrackets | null> {
  const supabase = await createClient()

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("id,title,has_categories")
    .eq("id", tournamentId)
    .in("status", VISIBLE_PUBLIC_TOURNAMENT_STATUSES)
    .single<{ id: string; title: string; has_categories: boolean }>()

  if (error || !tournament) {
    return null
  }

  const { data: bracketsData } = await supabase
    .from("tournament_brackets")
    .select(
      "id,tournament_id,category_id,format,structure,participant_count,created_at,updated_at"
    )
    .eq("tournament_id", tournamentId)
    .returns<TournamentBracketRow[]>()

  const brackets = bracketsData ?? []

  if (brackets.length === 0) {
    return null
  }

  let categories: { id: string; name: string }[] = []
  if (tournament.has_categories) {
    const { data } = await supabase
      .from("categories")
      .select("id,name")
      .eq("tournament_id", tournamentId)
      .returns<{ id: string; name: string }[]>()

    categories = data ?? []
  }

  return { tournament, categories, brackets }
}

export async function getRegistrationTournamentConfig(tournamentId: string) {
  const supabase = await createClient()

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(`
      id,
      title,
      province,
      address,
      date,
      registration_deadline,
      status,
      has_categories,
      participant_type,
      payment_method,
      entry_price,
      is_public
    `)
    .eq("id", tournamentId)
    .in("status", VISIBLE_PUBLIC_TOURNAMENT_STATUSES)
    .single()

  if (error || !tournament) {
    return null
  }

  let categories: RegistrationCategory[] = []
  const tournamentData = tournament as RegistrationTournament

  if (tournamentData.has_categories) {
    const { data } = await supabase
      .from("categories")
      .select(
        "id,name,participant_type,price,min_participants,max_participants,start_at,address"
      )
      .eq("tournament_id", tournamentId)
      .order("name", { ascending: true })

    categories = (data as RegistrationCategory[]) ?? []
  }

  return {
    tournament: tournamentData,
    categories,
  }
}
