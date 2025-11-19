import axios, { AxiosInstance } from 'axios'
import {
  User,
  UserLogin,
  UserCreate,
  Token,
  IntakeLog,
  DailyStats,
  FoodDetectionResponse,
  DrugDetectionResponse,
  LiveDetectionResponse
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const createAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
})

export const register = async (userData: UserCreate): Promise<User> => {
  const response = await api.post<User>('/auth/register', userData)
  return response.data
}

export const login = async (credentials: UserLogin): Promise<Token> => {
  const response = await api.post<Token>('/auth/login', credentials)
  return response.data
}

export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await api.get<User>('/auth/me', {
    headers: createAuthHeader(token)
  })
  return response.data
}

export const detectFood = async (imageBlob: Blob, token: string): Promise<FoodDetectionResponse> => {
  try {
    const formData = new FormData()
    formData.append('file', imageBlob, 'food.jpg')

    const response = await api.post<FoodDetectionResponse>('/api/food/detect', formData, {
      headers: {
        ...createAuthHeader(token),
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error: any) {
    console.error('Food detection error:', error)
    throw new Error(
      error.response?.data?.detail || '음식 분석 중 오류가 발생했습니다.'
    )
  }
}

export const detectDrug = async (imageBlob: Blob, token: string): Promise<DrugDetectionResponse> => {
  try {
    const formData = new FormData()
    formData.append('file', imageBlob, 'drug.jpg')

    const response = await api.post<DrugDetectionResponse>('/api/drug/detect', formData, {
      headers: {
        ...createAuthHeader(token),
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error: any) {
    console.error('Drug detection error:', error)
    throw new Error(
      error.response?.data?.detail || '약 분석 중 오류가 발생했습니다.'
    )
  }
}

export const getIntakeLogs = async (
  token: string,
  date?: string,
  logType?: 'food' | 'drug'
): Promise<IntakeLog[]> => {
  const params: any = {}

  if (date) params.date = date
  if (logType) params.log_type = logType

  const response = await api.get<IntakeLog[]>('/api/user/logs', {
    headers: createAuthHeader(token),
    params
  })

  return response.data
}

export const getDailyStats = async (token: string, period: number = 1): Promise<DailyStats> => {
  const response = await api.get<DailyStats>('/api/user/stats', {
    headers: createAuthHeader(token),
    params: { period }
  })

  return response.data
}

export const analyzeFoodImage = async (imageBlob: Blob): Promise<any> => {
  try {
    const formData = new FormData()
    formData.append('file', imageBlob, 'food.jpg')

    const response = await api.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error: any) {
    console.error('API Error:', error)
    throw new Error(
      error.response?.data?.detail || '이미지 분석 중 오류가 발생했습니다.'
    )
  }
}

export const detectLive = async (imageBlob: Blob): Promise<LiveDetectionResponse> => {
  try {
    const formData = new FormData()
    formData.append('file', imageBlob, 'frame.jpg')

    const response = await api.post<LiveDetectionResponse>('/detect-live', formData, {
      timeout: 3000,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      return { detected: false, message: 'Timeout' }
    }

    console.error('Live detection error:', error)
    return { detected: false, message: 'Error' }
  }
}

export const checkHealth = async (): Promise<{ status: string }> => {
  try {
    const response = await api.get<{ status: string }>('/health')
    return response.data
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

export default api
