export type Patient = {
  id: string
  name: string
  diagnosis: string
  lastSession: string
  sessionCount: number
  initials: string
}

export type Distortion = {
  name: string
  severity: number
  description: string
}

export type Analysis = {
  distortions: Distortion[]
  automaticThoughts: string[]
  coreBeliefs: string[]
  emotions: { label: string; value: number }[]
  risk: 'Düşük' | 'Orta' | 'Yüksek'
  riskNote: string
  recommendations: string[]
}