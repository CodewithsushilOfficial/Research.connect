import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, BarChart3, Plus, ArrowUpRight, ArrowDownToLine, Eye, Bookmark, Calendar } from 'lucide-react';
import api from '../../services/api';

const PublicationsDashboard = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCitations: 0,
    hIndex: 0,
    i10Index: 0,
    totalViews: 412,  // Simulated default
    totalDownloads: 184 // Simulated default
  });

  const fetchMyPublications = async () => {
    try {
      const response = await api.get('/profile/me');
      setPublications(response.data.publications || []);
      const profile = response.data.profile;
      if (profile) {
        setStats({
          totalCitations: profile.citations || 0,
          hIndex: profile.hIndex || 0,
          i10Index: profile.i10Index || 0,
          totalViews: 412,
          totalDownloads: 184
        });
      }
    } catch (err) {
      console.error('Failed to load portfolio publications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPublications();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-medium">Loading portfolio dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Research Portfolio Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your bibliography publications, track downloads metrics, and coordinate revisions.</p>
        </div>
        <Link to="/publications/upload" className="shrink-0">
          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/10 flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Upload Publication
          </button>
        </Link>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Publications</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="text-2xl font-bold text-slate-800 mt-4">{publications.length}</h4>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Citations</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <h4 className="text-2xl font-bold text-slate-800 mt-4">{stats.totalCitations}</h4>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">h-index</span>
            <BarChart3 className="w-4 h-4 text-emerald-500" />
          </div>
          <h4 className="text-2xl font-bold text-slate-800 mt-4">{stats.hIndex}</h4>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Reads / Views</span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <h4 className="text-2xl font-bold text-slate-800 mt-4">{stats.totalViews}</h4>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">PDF Downloads</span>
            <ArrowDownToLine className="w-4 h-4 text-rose-500" />
          </div>
          <h4 className="text-2xl font-bold text-slate-800 mt-4">{stats.totalDownloads}</h4>
        </div>
      </div>

      {/* Publications List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Indexed Works ({publications.length})</h3>
          <span className="text-xs text-slate-400">Click publication title to open timeline and revision history</span>
        </div>
        
        {publications.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h4 className="font-bold text-slate-700">Your portfolio is empty</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Upload your first academic paper or connect your Google Scholar profile to import your published history.
              </p>
            </div>
            <Link to="/publications/upload" className="inline-block">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                Upload a Paper Now
              </button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {publications.map((pub) => (
              <div key={pub._id} className="p-6 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider">
                      {pub.publicationType || 'journal'}
                    </span>
                    {pub.doi && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100/50 rounded text-[9px] font-medium font-mono">
                        {pub.doi}
                      </span>
                    )}
                  </div>
                  <Link to={`/publications/${pub._id}`} className="block">
                    <h4 className="text-base font-bold text-slate-800 hover:text-blue-600 transition-colors leading-snug">
                      {pub.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-slate-400 font-medium">
                    Published in: {pub.journal || pub.publisher || 'Academic Venue'} ({pub.publicationYear})
                  </p>
                  
                  {pub.authors && pub.authors.length > 0 && (
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="font-semibold text-slate-400">Authors:</span>
                      {pub.authors
                        .sort((a, b) => a.authorOrder - b.authorOrder)
                        .map((a, i) => (
                          <span key={i} className={a.user ? 'text-blue-600 font-semibold' : ''}>
                            {a.authorName || a.displayName}{i < pub.authors.length - 1 ? ',' : ''}
                          </span>
                        ))
                      }
                    </div>
                  )}
                </div>

                {/* Metrics / Actions panel */}
                <div className="flex md:flex-col items-end gap-3 shrink-0 text-right">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 84 reads</span>
                    <span className="flex items-center gap-1"><ArrowDownToLine className="w-3.5 h-3.5" /> 32 DLs</span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold">
                      {pub.citationCount || 0} Citations
                    </span>
                  </div>
                  <Link to={`/publications/${pub._id}`}>
                    <button className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1">
                      Timeline & Versions <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default PublicationsDashboard;
