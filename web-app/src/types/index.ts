export interface User {
  id: number
  email: string
  name: string
  birthYear?: number
  gender?: string
  usesInsulin: boolean
  dailySugarTargetG: number
  createdAt: string
  updatedAt: string
}

export interface UserCreate {
  email: string
  password: string
  name: string
  birthYear?: number
  gender?: string
  usesInsulin?: boolean
  dailySugarTargetG?: number
}

export interface UserLogin {
  email: string
  password: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface DetectionBox {
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
  score: number
  text?: string
}

export interface DetectionResult {
  mode: 'food' | 'drug'
  boxes: DetectionBox[]
  riskMessage: string
  drugInfo?: {
    name?: string
    ingredients?: string[]
    dosage?: string
  }
}

export interface IntakeLog {
  id: number
  userId: number
  logType: 'food' | 'drug'
  loggedAt: string
  detectionResult: string
  riskLevel: 'GOOD' | 'WARNING' | 'BAD'
  estimatedSugarG: number
  riskScore: number
  summary: string | null
}

export interface DailyStats {
  achieved: boolean
  totalSugarG: number
  targetG: number
  message: string
  costImpact: number
  logCount: number
}

export interface FoodDetectionResponse {
  detected: boolean
  logId?: number
  foodType?: string
  riskLevel?: string
  riskMessage?: string
  estimatedSugarG?: number
  ocrTexts?: string[]
  nutritionAnalysis?: string
  message?: string
}

export interface DrugDetectionResponse {
  detected: boolean
  logId?: number
  drugInfo?: {
    name?: string
    ingredients?: string[]
    dosage?: string
  }
  riskLevel?: string
  riskMessage?: string
  ocrTexts?: string[]
  message?: string
}

export interface LiveDetectionResponse {
  detected: boolean
  foodType?: string
  foodClass?: number
  confidence?: number
  riskLevel?: string
  message?: string
}
