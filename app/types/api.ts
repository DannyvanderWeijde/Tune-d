export interface ScoreBody {
  userId: number
  trackId: string
  score: number
}

export interface RatingResponse {
  score: number | null
  rankingTime: number
}