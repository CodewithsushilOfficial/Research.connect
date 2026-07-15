import React, { useState, useRef, useEffect } from 'react';
import { 
  Maximize2, Minimize2, Download, 
  Copy, Bookmark, Check, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PDFReader = ({ title, pdfUrl, authors, journal, year, doi, onDownload }) => {
  const containerRef = useRef(null);

  // States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Fullscreen Toggler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        toast.error('Fullscreen mode failed.');
        console.error(err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Listen to escape key or exit-fullscreen events to sync state
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // APA Citation generator
  const copyCitation = () => {
    const authorNames = authors || 'Researcher';
    const pubYear = year || new Date().getFullYear();
    const venue = journal || 'Research Connect Database';
    const doiSuffix = doi ? `. https://doi.org/${doi}` : '';
    
    const citation = `${authorNames}. (${pubYear}). ${title}. ${venue}${doiSuffix}`;
    
    navigator.clipboard.writeText(citation);
    setCopySuccess(true);
    toast.success('APA Citation copied to clipboard!');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-slate-900 flex flex-col rounded-2xl sm:rounded-3xl border border-slate-800 overflow-hidden shadow-xl transition-all ${
        isFullscreen ? 'w-screen h-[100dvh] rounded-none' : 'w-full min-h-[500px] h-[70dvh] sm:h-[75vh]'
      }`}
    >
      
      {/* 1. Header Toolbar */}
      <div className="bg-slate-950 border-b border-slate-800/80 z-10 shrink-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">

          {/* Left: Title */}
          <div className="flex items-center gap-2 min-w-0 shrink">
            <span className="text-[11px] sm:text-xs font-bold text-slate-300 truncate">{title}</span>
          </div>

          {/* Right Actions (Citation, Bookmark, Download, Fullscreen) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={copyCitation}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
              title="Copy APA Citation"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Cite</span>
            </button>

            <button
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                toast.success(isBookmarked ? 'Bookmark removed.' : 'Page bookmarked successfully.');
              }}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors border ${
                isBookmarked 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/10' 
                  : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Bookmark publication"
            >
              <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={onDownload}
              className="p-1.5 sm:p-2 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Document Canvas Area */}
      <div className="flex-1 min-h-0 relative bg-slate-900/60">
        {!iframeLoaded && pdfUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/60 z-10">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading document…</p>
          </div>
        )}
        {pdfUrl ? (
          <iframe 
            src={pdfUrl}
            title={title}
            onLoad={() => setIframeLoaded(true)}
            className={`w-full h-full border-0 bg-white transition-opacity duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ touchAction: 'pan-y' }}
            allow="fullscreen"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading PDF Canvas...</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default PDFReader;
