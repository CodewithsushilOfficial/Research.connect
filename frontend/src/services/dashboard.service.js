import axiosInstance from '../api/axiosInstance';

const devMock = {
  metrics: {
    publications: 1,
    citations: 0,
    hIndex: 0,
    i10Index: 0
  },
  recommended: [
    { id: 'r1', name: 'Dr. Asha Kulkarni', title: 'Assistant Professor', institution: 'IIT Bombay' },
    { id: 'r2', name: 'Prof. Ravi Menon', title: 'Associate Professor', institution: 'IISc' },
    { id: 'r3', name: 'Dr. Sara Gomez', title: 'Research Scientist', institution: 'CERN' }
  ],
  trendingPubs: []
};

class DashboardService {
  async getOverview() {
    try {
      const res = await axiosInstance.get('/v1/dashboard/overview');
      return res;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('dashboard.getOverview: backend unreachable, returning dev mock');
        return { success: true, data: { metrics: devMock.metrics } };
      }
      throw err;
    }
  }

  async getRecommendedResearchers() {
    try {
      const res = await axiosInstance.get('/v1/dashboard/recommended-researchers');
      return res;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        return { success: true, data: { researchers: devMock.recommended } };
      }
      throw err;
    }
  }

  async getTrendingPublications() {
    try {
      const res = await axiosInstance.get('/v1/dashboard/trending-publications');
      return res;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        return { success: true, data: { publications: devMock.trendingPubs } };
      }
      throw err;
    }
  }
}

export default new DashboardService();
