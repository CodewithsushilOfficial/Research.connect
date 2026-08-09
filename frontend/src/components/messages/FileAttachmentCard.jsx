import React, { useState } from 'react';
import { Download, FileText, TableProperties, FileArchive, File, Share2, Check } from 'lucide-react';
import { formatFileSize } from '../../data/mockData';

const FILE_CONFIG = {
  'application/pdf': {
    bg: '#FEE2E2',
    Icon: FileText,
    iconColor: '#EF4444',
    label: 'PDF Document',
  },
  default_sheet: {
    bg: '#DBEAFE',
    Icon: TableProperties,
    iconColor: '#2563EB',
    label: 'Dataset',
  },
  'application/zip': {
    bg: '#EDE9FE',
    Icon: FileArchive,
    iconColor: '#4F46E5',
    label: 'Archive',
  },
};

function getConfig(fileType) {
  if (fileType === 'application/pdf') return FILE_CONFIG['application/pdf'];
  if (fileType?.includes('spreadsheet') || fileType?.includes('excel') || fileType?.includes('csv'))
    return FILE_CONFIG['default_sheet'];
  if (fileType === 'application/zip' || fileType?.includes('compressed'))
    return FILE_CONFIG['application/zip'];
  return { bg: '#F1F5F9', Icon: File, iconColor: '#475569', label: 'File' };
}

export default function FileAttachmentCard({ attachment }) {
  if (!attachment) return null;

  const { fileName = 'File', fileSizeBytes = 0, fileType = '', cdnUrl } = attachment;
  const { bg, Icon, iconColor, label } = getConfig(fileType);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!cdnUrl || cdnUrl === '#') return;

    try {
      setIsDownloading(true);
      // Fetching blob resolves CORS restrictions on the download attribute
      const response = await fetch(cdnUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(blobUrl);
    } catch {
      // Direct anchor fallback if cross-origin fetch is blocked
      window.open(cdnUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (!cdnUrl || cdnUrl === '#') return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(cdnUrl);
      } else {
        // Fallback for non-HTTPS or legacy browsers
        const textarea = document.createElement('textarea');
        textarea.value = cdnUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div
      onClick={handleDownload}
      className="attach-card hover-3d-lift flex items-center gap-3 p-3 bg-white border border-[#E2E8F0]
        rounded-xl cursor-pointer group select-none"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
        style={{ background: bg }}
      >
        <Icon size={20} color={iconColor} />
      </div>

      <div className="attach-content flex-1 overflow-hidden">
        <p className="text-sm font-semibold text-[#0F172A] truncate" title={fileName}>
          {fileName}
        </p>
        <p className="text-xs text-[#475569]">
          {formatFileSize(fileSizeBytes)} • {label}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="p-1.5 hover:bg-[#F1F5F9] rounded-md transition-colors text-[#94A3B8] hover:text-[#475569]"
          title="Copy link to clipboard"
          aria-label="Copy link to clipboard"
        >
          {copied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="p-1.5 hover:bg-[#F1F5F9] rounded-md transition-colors text-[#94A3B8] group-hover:text-[#2563EB] disabled:opacity-50"
          title="Download file"
          aria-label="Download file"
        >
          <Download size={18} className="flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}
