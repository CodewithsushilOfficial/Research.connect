import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, ArrowLeft, Search, 
  Filter, RefreshCw, X, ChevronDown, Check, Handshake, 
  SlidersHorizontal, Award, Users, BookOpen, Building2, MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import recommendationService from '../../../services/recommendation.service';
import ResearcherCard from '../components/ResearcherCard';

const SuggestedResearchersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.user);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [researchArea, setResearchArea] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [country, setCountry] = useState('');
  const [designation, setDesignation] = useState('');
  const [minPublications, setMinPublications] = useState('');
  const [minCitations, setMinCitations] = useState('');
  const [minHIndex, setMinHIndex] = useState('');
  const [isAvailableForCollaboration, setIsAvailableForCollaboration] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [recentlyJoined, setRecentlyJoined] = useState(false);
  const [sortBy, setSortBy] = useState('matchPercentage');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Modal State for Collaboration
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [collabNote, setCollabNote] = useState('');
  const [sendingCollab, setSendingCollab] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Recommended Researchers from MongoDB API
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'suggestedResearchersFull', 
      page, limit, debouncedSearch, researchArea, institution, 
      department, country, designation, minPublications, 
      minCitations, minHIndex, isAvailableForCollaboration, 
      isVerified, recentlyJoined, sortBy
    ],
    queryFn: async () => {
      const res = await recommendationService.getResearchers({
        page,
        limit,
        search: debouncedSearch,
        researchArea,
        institution,
        department,
        country,
        designation,
        minPublications: minPublications || undefined,
        minCitations: minCitations || undefined,
        minHIndex: minHIndex || undefined,
        isAvailableForCollaboration,
        isVerified,
        recentlyJoined,
        sortBy
      });
      return res.success ? res.data : { docs: [], total: 0, page: 1, totalPages: 1 };
    },
    keepPreviousData: true
  });

  const researchers = data?.docs || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleRefresh = async () => {
    try {
      await recommendationService.refreshRecommendations();
      toast.success('Refreshing recommendations in background...');
      refetch();
    } catch {
      toast.error('Could not trigger refresh.');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setResearchArea('');
    setInstitution('');
    setDepartment('');
    setCountry('');
    setDesignation('');
    setMinPublications('');
    setMinCitations('');
    setMinHIndex('');
    setIsAvailableForCollaboration(false);
    setIsVerified(false);
    setRecentlyJoined(false);
    setSortBy('matchPercentage');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    debouncedSearch || researchArea || institution || department || 
    country || designation || minPublications || minCitations || 
    minHIndex || isAvailableForCollaboration || isVerified || recentlyJoined || sortBy !== 'matchPercentage'
  );

  const handleSendCollaboration = (e) => {
    e.preventDefault();
    if (!selectedCollaborator) return;
    setSendingCollab(true);
    setTimeout(() => {
      toast.success(`Collaboration invitation sent to ${selectedCollaborator.fullName || selectedCollaborator.name}!`);
      setSendingCollab(false);
      setSelectedCollaborator(null);
      setCollabNote('');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/home')}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Feed</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-bg-surface hover:bg-bg-card border border-border hover:border-primary text-text-secondary transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-primary' : ''}`} />
            <span>Refresh Engine</span>
          </button>
        </div>
      </div>


      {/* 3. Search & Filter Bar */}
      <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        {/* Search Bar & Basic Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search researchers by name, institution, department, research area, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <label className="text-xs font-bold text-text-muted whitespace-nowrap hidden sm:inline">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="bg-bg-surface border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer w-full md:w-auto"
            >
              <option value="matchPercentage">Highest Match Score</option>
              <option value="citations">Most Citations</option>
              <option value="publications">Most Publications</option>
              <option value="hIndex">Highest h-index</option>
              <option value="recent">Recently Joined</option>
            </select>

            {/* Toggle Filter Panel */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-bg-surface hover:bg-bg-card text-text-primary border-border hover:border-primary'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5"></span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Institution Filter */}
              <div>
                <label className="text-[11px] font-bold text-text-muted mb-1 block">Institution</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford, MIT..."
                  value={institution}
                  onChange={(e) => { setInstitution(e.target.value); setPage(1); }}
                  className="w-full bg-bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Department Filter */}
              <div>
                <label className="text-[11px] font-bold text-text-muted mb-1 block">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science..."
                  value={department}
                  onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                  className="w-full bg-bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Country Filter */}
              <div>
                <label className="text-[11px] font-bold text-text-muted mb-1 block">Country</label>
                <input
                  type="text"
                  placeholder="e.g. United States, Germany..."
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); setPage(1); }}
                  className="w-full bg-bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Designation Filter */}
              <div>
                <label className="text-[11px] font-bold text-text-muted mb-1 block">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Professor, Scientist..."
                  value={designation}
                  onChange={(e) => { setDesignation(e.target.value); setPage(1); }}
                  className="w-full bg-bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Min Publications */}
              <div>
                <label className="text-[11px] font-bold text-text-muted mb-1 block">Min Publications</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={minPublications}
                  onChange={(e) => { setMinPublications(e.target.value); setPage(1); }}
                  className="w-full bg-bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Min Citations */}
              <div>
                <label className="text-[11px] font-bold text-text-muted mb-1 block">Min Citations</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50"
                  value={minCitations}
                  onChange={(e) => { setMinCitations(e.target.value); setPage(1); }}
                  className="w-full bg-bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Min h-index */}
              <div>
                <label className="text-[11px] font-bold text-text-muted mb-1 block">Min h-index</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 3"
                  value={minHIndex}
                  onChange={(e) => { setMinHIndex(e.target.value); setPage(1); }}
                  className="w-full bg-bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Research Area / Skill */}
              <div>
                <label className="text-[11px] font-bold text-text-muted mb-1 block">Research Area / Skill</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence..."
                  value={researchArea}
                  onChange={(e) => { setResearchArea(e.target.value); setPage(1); }}
                  className="w-full bg-bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-border">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailableForCollaboration}
                  onChange={(e) => { setIsAvailableForCollaboration(e.target.checked); setPage(1); }}
                  className="rounded border-border text-primary focus:ring-primary accent-primary w-4 h-4"
                />
                <span>Open for Collaboration Only</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => { setIsVerified(e.target.checked); setPage(1); }}
                  className="rounded border-border text-primary focus:ring-primary accent-primary w-4 h-4"
                />
                <span>Verified Researchers Only</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={recentlyJoined}
                  onChange={(e) => { setRecentlyJoined(e.target.checked); setPage(1); }}
                  className="rounded border-border text-primary focus:ring-primary accent-primary w-4 h-4"
                />
                <span>Recently Joined Scholars</span>
              </label>
            </div>
          </div>
        )}

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mr-1">Active Filters:</span>

              {debouncedSearch && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold rounded-lg">
                  Search: "{debouncedSearch}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
                </span>
              )}

              {institution && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold rounded-lg">
                  Institution: {institution}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setInstitution('')} />
                </span>
              )}

              {department && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold rounded-lg">
                  Dept: {department}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setDepartment('')} />
                </span>
              )}

              {country && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold rounded-lg">
                  Country: {country}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setCountry('')} />
                </span>
              )}

              {designation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold rounded-lg">
                  Desig: {designation}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setDesignation('')} />
                </span>
              )}

              {researchArea && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold rounded-lg">
                  Area: {researchArea}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setResearchArea('')} />
                </span>
              )}

              {isAvailableForCollaboration && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-lg">
                  Collaboration Only
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setIsAvailableForCollaboration(false)} />
                </span>
              )}

              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-lg">
                  Verified Only
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setIsVerified(false)} />
                </span>
              )}
            </div>

            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer shrink-0"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* 4. Results Section */}
      <div className="flex items-center justify-between text-xs font-bold text-text-muted px-1">
        <span>Showing {researchers.length} of {total} recommended researchers</span>
        {isFetching && <span className="text-primary font-semibold">Updating results...</span>}
      </div>

      {/* Grid of Researcher Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="bg-bg-card border border-border rounded-2xl p-6 h-64 animate-pulse space-y-4 shadow-sm">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-bg-surface rounded-full shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-bg-surface rounded w-3/4" />
                  <div className="h-3 bg-bg-surface rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-bg-surface rounded-xl w-full" />
              <div className="h-8 bg-bg-surface rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : researchers.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchers.map((res) => (
              <ResearcherCard
                key={res._id || res.userId}
                researcher={res}
                currentUserId={currentUser?._id}
                onCollaborate={(cand) => setSelectedCollaborator(cand)}
                onFollowChange={() => {
                  queryClient.invalidateQueries({ queryKey: ['suggestedResearchers'] });
                }}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 bg-bg-card border border-border rounded-xl text-xs font-bold text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-surface transition-all"
              >
                Previous
              </button>

              <span className="text-xs font-extrabold text-text-muted px-3">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-bg-card border border-border rounded-xl text-xs font-bold text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-surface transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-bg-card border border-border rounded-3xl shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-text-muted mx-auto opacity-60" />
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-text-primary uppercase tracking-tight">No Suggested Researchers Found</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto font-medium leading-relaxed">
              No suggested researchers available yet based on your current profile or active filters. Try adjusting or clearing your search criteria!
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary-hover transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* 5. Collaboration Modal */}
      {selectedCollaborator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-base text-text-primary">Collaborate with {selectedCollaborator.fullName || selectedCollaborator.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCollaborator(null)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendCollaboration} className="space-y-4">
              <p className="text-xs text-text-secondary leading-relaxed">
                Send a direct academic collaboration request to <strong className="text-text-primary">{selectedCollaborator.fullName || selectedCollaborator.name}</strong> ({selectedCollaborator.institution || 'Researcher'}).
              </p>

              <div>
                <label className="text-xs font-bold text-text-muted mb-1 block">Collaboration Note / Project Focus</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your research topic, joint project idea, or collaboration proposal..."
                  value={collabNote}
                  onChange={(e) => setCollabNote(e.target.value)}
                  className="w-full bg-bg-surface border border-border rounded-xl p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCollaborator(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-border text-text-muted hover:bg-bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingCollab}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-sm flex items-center gap-1.5"
                >
                  {sendingCollab ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestedResearchersPage;
