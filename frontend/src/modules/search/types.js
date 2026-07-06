/**
 * @typedef {'journal_article' | 'conference_paper' | 'preprint' | 'book_chapter' | 'thesis' | 'patent'} PublicationType
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} id
 * @property {PublicationType} type
 * @property {string} title
 * @property {string[]} authors
 * @property {string} venue
 * @property {number} year
 * @property {number} citationCount
 * @property {number[]} [citationTrend]
 * @property {string} abstract
 * @property {string[]} tags
 */

/**
 * @typedef {Object} FilterState
 * @property {PublicationType[]} publicationTypes
 * @property {number} yearFrom
 * @property {number} yearTo
 * @property {number} citationMin
 * @property {number} citationMax
 * @property {string} sort - 'relevance' | 'mostCited' | 'newest' | 'oldest'
 */

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'mostCited', label: 'Most Cited' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export const PUBLICATION_TYPES = [
  { value: 'journal_article', label: 'Journal Article' },
  { value: 'conference_paper', label: 'Conference Paper' },
  { value: 'preprint', label: 'Preprint' },
  { value: 'book_chapter', label: 'Book Chapter' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'patent', label: 'Patent' },
];

export const DEFAULT_FILTER_STATE = {
  publicationTypes: [],
  yearFrom: 2000,
  yearTo: new Date().getFullYear(),
  citationMin: 0,
  citationMax: 5000,
  sort: 'relevance',
};

export const CITATION_PRESETS = [
  { label: '500+', min: 500, max: 5000 },
  { label: '1,000+', min: 1000, max: 5000 },
  { label: '5,000+', min: 5000, max: 5000 },
];
