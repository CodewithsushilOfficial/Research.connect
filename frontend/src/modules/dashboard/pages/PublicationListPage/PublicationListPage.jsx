import React, { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import publicationService from '../../../../services/publication.service';
import Button from '../../../../components/common/buttons/Button';

const base64ToBlob = (base64Data, type = 'application/pdf') => {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type });
};

const PublicationListPage = () => {
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    setPublications(publicationService.getPublications());
  }, []);

  const handleDownload = (publication) => {
    if (!publication.fileData) return;
    const blob = base64ToBlob(publication.fileData, publication.fileType || 'application/pdf');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = publication.fileName || 'research-paper.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-text-primary">Publications</h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          View your uploaded research papers and download them as needed.
        </p>
      </div>

      {publications.length === 0 ? (
        <div className="rounded-3xl border border-border bg-white p-8 text-center text-text-secondary shadow-sm">
          <FileText className="mx-auto mb-4 h-10 w-10 text-primary" />
          <p className="text-lg font-semibold text-text-primary">No publications yet</p>
          <p className="mt-2 text-sm">Upload a research paper using the Publish Research page to see it here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {publications.map((publication, index) => (
            <div key={index} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <FileText className="w-4 h-4" />
                    <span>{publication.publicationType}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-text-primary mt-2">{publication.title}</h2>
                  <p className="text-sm text-text-secondary mt-1">{publication.author}</p>
                  <p className="text-sm text-text-secondary mt-2">{publication.category} • {publication.visibility}</p>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  <Button type="button" variant="outline" onClick={() => handleDownload(publication)}>
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <div className="text-xs text-text-secondary">{publication.fileName}</div>
                  <div className="text-xs text-text-secondary">{publication.submittedAt ? new Date(publication.submittedAt).toLocaleDateString() : ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicationListPage;
