import axios from 'axios';

// API 베이스 URL - 실제 배포 시 변경 필요
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

/**
 * 이미지를 서버로 전송하여 음식 분석
 * @param {string} imageUri - 이미지 URI
 * @returns {Promise} 분석 결과
 */
export const analyzeFoodImage = async imageUri => {
  try {
    const formData = new FormData();

    // 이미지 파일 추가
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'food_image.jpg',
    });

    const response = await api.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('API 호출 오류:', error);

    if (error.response) {
      // 서버가 응답을 반환한 경우
      throw new Error(
        error.response.data?.detail || '서버 오류가 발생했습니다.',
      );
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못한 경우
      throw new Error(
        '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.',
      );
    } else {
      // 요청 설정 중 오류 발생
      throw new Error('요청 처리 중 오류가 발생했습니다.');
    }
  }
};

/**
 * 서버 상태 확인
 * @returns {Promise} 서버 상태
 */
export const checkServerStatus = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('서버 상태 확인 오류:', error);
    return {status: 'error'};
  }
};

export default api;
