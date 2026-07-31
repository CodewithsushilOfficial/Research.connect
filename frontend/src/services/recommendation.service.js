import axiosInstance from '../api/axiosInstance';

class RecommendationService {
  async getResearchers(params = {}) {
    let queryParams;
    if (typeof params === 'number') {
      queryParams = { limit: params };
    } else {
      queryParams = params;
    }
    return await axiosInstance.get('/v1/recommendations/researchers', { params: queryParams });
  }

  async getPublications(limit = 5, cursor = '') {
    const params = new URLSearchParams({ limit });
    if (cursor) params.set('cursor', cursor);
    return await axiosInstance.get(`/v1/recommendations/publications?${params}`);
  }


  async getProjects(limit = 5, cursor = '') {
    const params = new URLSearchParams({ limit });
    if (cursor) params.set('cursor', cursor);
    return await axiosInstance.get(`/v1/recommendations/projects?${params}`);
  }

  async getFunding(limit = 5, cursor = '') {
    const params = new URLSearchParams({ limit });
    if (cursor) params.set('cursor', cursor);
    return await axiosInstance.get(`/v1/recommendations/funding?${params}`);
  }

  async getConferences(limit = 5, cursor = '') {
    const params = new URLSearchParams({ limit });
    if (cursor) params.set('cursor', cursor);
    return await axiosInstance.get(`/v1/recommendations/conferences?${params}`);
  }

  async refreshRecommendations() {
    return await axiosInstance.post('/v1/recommendations/refresh');
  }
}

export default new RecommendationService();
