export type Game = {
  name: string,
  href: string,
  component: React.Component
};

enum CompStatus {
  NOT_STARTED = "not_started",
  STARTED = "started",
  ENDED = "ended",
  ERROR = "error"
}

export type CompInfo = {
  compId: string,
  name: string,
  type: string,
  params: object,
  registeredPlayers: number,
  players: number,
  gamesPlayed: number,
  status: CompStatus,
  currentGame?: string | null,
  winners?: number[] | null
}

export type CompComponentProps = {
  gameHref: string,
  info: CompInfo | Record<string, never>,
  games: string[]
}
