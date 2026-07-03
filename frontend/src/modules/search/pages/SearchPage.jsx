import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, Users, Building2, Mic2, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import searchService from '../../../services/search.service';
import SearchBar from '../components/SearchBar';
import SearchFilters from '../components/SearchFilters';
import PublicationResultCard from '../components/PublicationResultCard';
import AuthorResultCard from '../components/AuthorResultCard';
import TrendingSection from '../components/TrendingSection';

const TABS = [
  { key: 'all',          label: 'All',          icon: Search },
  { key: 'publications', label: 'Publications',  icon: BookOpen },
  { key: 'authors',      label: 'Authors',       icon: Users },
  { key: 'journals',     label: 'Journals',      icon: Building2 },
  { key: 'conferences',  label: 'Conferences',   icon: Mic2 },
];

const DEFAULT_FILTERS = {
  publicationType: '', yearFrom: '', yearTo: '', language: '',
  openAccess: '', hasPDF: '', isScholarImported: '',
};

const countActiveFilters = (filters) =>
  Object.values(filters).filter(v => v !== '' && v !== undefined).length;

const EmptyState = ({ query }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
      <Search className="w-9 h-9 text-gray-400" />
    </div>
    <h3 className="text-lg font-bold text-gray-800 mb-2">No results found</h3>
    <p className="text-gray-500 text-sm max-w-sm">
      No results for <strong>"{query}"</strong>. Try different keywords, check spelling, or broaden your filters.
    </p>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
    <div className="flex gap-2 mb-3"><div className="h-5 w-20 bg-gray-200 rounded-full" /><div className="h-5 w-16 bg-gray-200 rounded-full" /></div>
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
    <div className="h-4 bg-gray-100 rounded w-5/6 mb-4" />
    <div className="h-px bg-gray-100 mb-3" />
    <div className="flex justify-between"><div className="flex gap-4"><div className="h-3 w-16 bg-gray-100 rounded" /><div className="h-3 w-16 bg-gray-100 rounded" /></div><div className="h-7 w-16 bg-gray-200 rounded-xl" /></div>
  </div>
);

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        let p = i + 1;
        if (totalPages > 7) {
          if (page <= 4) p = i + 1;
          else if (page >= totalPages - 3) p = totalPages - 6 + i;
          else p = page - 3 + i;
        }
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
              p === page ? 'bg-blue-600 text-white border border-blue-600' : 'border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {p}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const qParam = searchParams.get('q') || '';
  const tabParam = searchParams.get('tab') || 'all';

  const [query, setQuery] = useState(qParam);
  const [activeTab, setActiveTab] = useState(tabParam);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync URL params → local state
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const tab = searchParams.get('tab') || 'all';
    setQuery(q);
    setActiveTab(tab);
    setPage(1);
  }, [searchParams]);

  const pushSearch = useCallback((newQ, newTab) => {
    const params = {};
    if (newQ) params.q = newQ;
    if (newTab && newTab !== 'all') params.tab = newTab;
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [setSearchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    pushSearch(query, tab);
  };

  const handleSearch = (q) => {
    setQuery(q);
    pushSearch(q, activeTab);
  };

  const handleFiltersChange = (f) => { setFilters(f); setPage(1); };
  const handleResetFilters = () => { setFilters(DEFAULT_FILTERS); setPage(1); };

  // Build query params for service call
  const searchParams_ = {
    q: query,
    sort,
    page,
    limit: 15,
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined))
  };

  // Publications query
  const pubQuery = useQuery({
    queryKey: ['search-publications', query, filters, sort, page],
    queryFn: () => searchService.searchPublications(searchParams_),
    enabled: (activeTab === 'all' || activeTab === 'publications') && !!query,
    staleTime: 30 * 1000,
    keepPreviousData: true,
  });

  // Authors query
  const authQuery = useQuery({
    queryKey: ['search-authors', query, page],
    queryFn: () => searchService.searchAuthors({ q: query, page, limit: 15 }),
    enabled: (activeTab === 'all' || activeTab === 'authors') && !!query,
    staleTime: 30 * 1000,
  });

  // Journals query
  const journalsQuery = useQuery({
    queryKey: ['search-journals', query, page],
    queryFn: () => searchService.searchJournals({ q: query, page, limit: 20 }),
    enabled: activeTab === 'journals' && !!query,
    staleTime: 60 * 1000,
  });

  // Conferences query
  const confsQuery = useQuery({
    queryKey: ['search-conferences', query, page],
    queryFn: () => searchService.searchConferences({ q: query, page, limit: 20 }),
    enabled: activeTab === 'conferences' && !!query,
    staleTime: 60 * 1000,
  });

  const activeFilterCount = countActiveFilters(filters);

  const pubResults = pubQuery.data?.data || {};
  const authResults = authQuery.data?.data || {};
  const journalResults = journalsQuery.data?.data || {};
  const confResults = confsQuery.data?.data || {};

  const isLoading = pubQuery.isFetching || authQuery.isFetching || journalsQuery.isFetching || confsQuery.isFetching;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-2xl">
              <SearchBar
                placeholder="Search publications, authors, journals, conferences…"
                onSearch={handleSearch}
              />
            </div>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(s => !s)}
              className="lg:hidden p-2.5 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors relative"
            >
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-px no-scrollbar">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!query ? (
          /* Empty / Discovery State */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="text-center py-20">
                <div className="w-24 h-24 rounded-3xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Discover Research</h2>
                <p className="text-gray-500 max-w-md mx-auto text-base leading-relaxed">
                  Search millions of publications, authors, journals, and conferences from Research Connect.
                </p>
              </div>
            </div>
            <div className="lg:col-span-1">
              <TrendingSection onQueryClick={handleSearch} />
            </div>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* Sidebar Filters — Desktop */}
            <div className="hidden lg:block">
              {(activeTab === 'all' || activeTab === 'publications') && (
                <SearchFilters
                  filters={filters}
                  onChange={handleFiltersChange}
                  onReset={handleResetFilters}
                  sort={sort}
                  onSortChange={(s) => { setSort(s); setPage(1); }}
                  activeCount={activeFilterCount}
                />
              )}
            </div>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {/* Results count */}
              {!isLoading && query && (
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {(activeTab === 'all' || activeTab === 'publications') && pubResults.total !== undefined && (
                      <span><strong className="text-gray-900">{pubResults.total?.toLocaleString()}</strong> publications</span>
                    )}
                    {(activeTab === 'authors') && authResults.total !== undefined && (
                      <span><strong className="text-gray-900">{authResults.total?.toLocaleString()}</strong> authors</span>
                    )}
                    {' '}for <strong className="text-gray-900">"{query}"</strong>
                  </p>
                  {isLoading && <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />}
                </div>
              )}

              {/* Publication Results */}
              {(activeTab === 'all' || activeTab === 'publications') && (
                <div className="space-y-4">
                  {pubQuery.isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : pubResults.results?.length > 0
                      ? <>
                          {pubResults.results.map((pub, i) => (
                            <PublicationResultCard key={pub._id || i} publication={pub} index={i} />
                          ))}
                          <Pagination
                            page={pubResults.page || page}
                            totalPages={pubResults.totalPages || 1}
                            onPageChange={setPage}
                          />
                        </>
                      : query && !pubQuery.isLoading && <EmptyState query={query} />
                  }
                </div>
              )}

              {/* Author Results */}
              {(activeTab === 'all' || activeTab === 'authors') && authResults.results?.length > 0 && (
                <div className="space-y-4 mt-8">
                  {activeTab === 'all' && (
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" /> Authors
                    </h2>
                  )}
                  {authResults.results.map((author, i) => (
                    <AuthorResultCard key={i} author={author} index={i} />
                  ))}
                  {activeTab === 'authors' && (
                    <Pagination
                      page={authResults.page || page}
                      totalPages={authResults.totalPages || 1}
                      onPageChange={setPage}
                    />
                  )}
                </div>
              )}

              {/* Journals Results */}
              {activeTab === 'journals' && (
                <div className="space-y-3">
                  {journalsQuery.isLoading
                    ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-gray-200 animate-pulse" />)
                    : journalResults.results?.length > 0
                      ? <>
                          {journalResults.results.map((j, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{j.name}</p>
                                  <p className="text-xs text-gray-400">{j.publicationCount} publications · Last in {j.latestYear}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleSearch(j.name)}
                                className="px-4 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-xl transition-colors"
                              >
                                Browse
                              </button>
                            </motion.div>
                          ))}
                          <Pagination page={journalResults.page || page} totalPages={journalResults.totalPages || 1} onPageChange={setPage} />
                        </>
                      : <EmptyState query={query} />
                  }
                </div>
              )}

              {/* Conferences Results */}
              {activeTab === 'conferences' && (
                <div className="space-y-3">
                  {confsQuery.isLoading
                    ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-gray-200 animate-pulse" />)
                    : confResults.results?.length > 0
                      ? <>
                          {confResults.results.map((c, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                  <Mic2 className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                                  <p className="text-xs text-gray-400">{c.publicationCount} publications · Last in {c.latestYear}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleSearch(c.name)}
                                className="px-4 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl transition-colors"
                              >
                                Browse
                              </button>
                            </motion.div>
                          ))}
                          <Pagination page={confResults.page || page} totalPages={confResults.totalPages || 1} onPageChange={setPage} />
                        </>
                      : <EmptyState query={query} />
                  }
                </div>
              )}
            </div>

            {/* Right Sidebar — Trending when there's a query */}
            {query && (activeTab === 'all' || activeTab === 'publications') && (
              <div className="hidden xl:block w-72 flex-shrink-0">
                <TrendingSection onQueryClick={handleSearch} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-[#F8FAFC] overflow-y-auto p-5"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <SearchFilters
                filters={filters}
                onChange={handleFiltersChange}
                onReset={handleResetFilters}
                sort={sort}
                onSortChange={setSort}
                activeCount={activeFilterCount}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPage;
