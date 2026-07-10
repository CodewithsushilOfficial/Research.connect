import axiosInstance from '../api/axiosInstance';

class ProfileService {
  // Get public profile by slug
  async getPublicProfile(profileSlug) {
    return await axiosInstance.get(`/v1/profile/${profileSlug}`);
  }

  // Get own authenticated profile details
  async getProfile() {
    return await axiosInstance.get('/v1/profile/me');
  }

  // General profile update
  async updateProfile(data) {
    return await axiosInstance.patch('/v1/profile', data);
  }

  // Specific PATCH routes for micro-saves / real-time updates
  async updateBanner(coverImageOrFile) {
    if (coverImageOrFile instanceof File) {
      const formData = new FormData();
      formData.append('file', coverImageOrFile);
      return await axiosInstance.patch('/v1/profile/banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return await axiosInstance.patch('/v1/profile/banner', { coverImage: coverImageOrFile });
  }

  async updateAvatar(profileImageOrFile) {
    if (profileImageOrFile instanceof File) {
      const formData = new FormData();
      formData.append('file', profileImageOrFile);
      return await axiosInstance.patch('/v1/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return await axiosInstance.patch('/v1/profile/avatar', { profileImage: profileImageOrFile });
  }

  async updateBasic(data) {
    return await axiosInstance.patch('/v1/profile/basic', data);
  }

  async updateAbout(data) {
    return await axiosInstance.patch('/v1/profile/about', data);
  }

  async updateSkills(skills) {
    return await axiosInstance.patch('/v1/profile/skills', { skills });
  }

  async updateResearch(data) {
    return await axiosInstance.patch('/v1/profile/research', data);
  }

  async updateEducation(education) {
    return await axiosInstance.patch('/v1/profile/education', { education });
  }

  async updateExperience(experience) {
    return await axiosInstance.patch('/v1/profile/experience', { experience });
  }

  async updateProjects(projects) {
    return await axiosInstance.patch('/v1/profile/projects', { projects });
  }

  async updateSocial(socialLinks) {
    return await axiosInstance.patch('/v1/profile/social', { socialLinks });
  }

  async updateMetrics(metrics) {
    return await axiosInstance.patch('/v1/profile/metrics', { metrics });
  }

  // Analytics endpoints
  async getAnalytics() {
    return await axiosInstance.get('/v1/profile/analytics');
  }

  async trackDownload() {
    return await axiosInstance.patch('/v1/profile/analytics/download');
  }

  // Google Scholar trigger sync
  async syncGoogleScholar() {
    return await axiosInstance.post('/v1/profile/google-scholar/sync');
  }

  // Upload any file (avatar/banner/etc.)
  async uploadFile(formData) {
    return await axiosInstance.post('/v1/profile/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Soft delete account & profile
  async deleteProfile() {
    return await axiosInstance.delete('/v1/profile');
  }

  // Backward compatibility mock activity/areas/keywords
  async getPublications() {
    return await axiosInstance.get('/v1/scholar/publications');
  }

  async getActivity() {
    return { success: true, data: [] };
  }

  async getResearchAreas() {
    return { success: true, data: [] };
  }

  async getKeywords() {
    return { success: true, data: [] };
  }
}

export default new ProfileService();
