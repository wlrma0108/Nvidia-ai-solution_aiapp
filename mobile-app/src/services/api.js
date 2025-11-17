import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {'Content-Type': 'multipart/form-data'},
});

export const analyzeFoodImage = async imageUri => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'food_image.jpg',
    });

    const response = await api.post('/analyze', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);

    if (error.response) {
      throw new Error(error.response.data?.detail || '서버 오류가 발생했습니다.');
    } else if (error.request) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
    } else {
      throw new Error('요청 처리 중 오류가 발생했습니다.');
    }
  }
};

export const checkServerStatus = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    return {status: 'error'};
  }
};

export default api;
