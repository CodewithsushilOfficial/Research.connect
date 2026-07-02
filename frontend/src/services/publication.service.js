const PUBLICATION_STORAGE_KEY = 'research_publications';

const publicationService = {
  getPublications() {
    const raw = localStorage.getItem(PUBLICATION_STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse publications from localStorage', err);
      return [];
    }
  },

  savePublication(publication) {
    const publications = publicationService.getPublications();
    publications.unshift(publication);
    localStorage.setItem(PUBLICATION_STORAGE_KEY, JSON.stringify(publications));
    return publications;
  },

  clearPublications() {
    localStorage.removeItem(PUBLICATION_STORAGE_KEY);
  }
};

export default publicationService;
