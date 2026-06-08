export type PushPayload = {
  title: string
  body: string
  url?: string
  type?: 'fixture_reminder' | 'score_update' | 'general'
}