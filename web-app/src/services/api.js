import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const analyzeFoodImage = async (imageBlob) => {
  try {
    const formData = new FormData();
    formData.append('file', imageBlob, 'food.jpg');

    const response = await api.post('/analyze', formData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(
      error.response?.data?.detail ||
      '이미지 분석 중 오류가 발생했습니다.'
    );
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default api;
