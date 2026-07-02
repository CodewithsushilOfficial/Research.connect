import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Upload, FileText, Eye, CheckCircle } from 'lucide-react';
import Button from '../../../../components/common/buttons/Button';
import publicationService from '../../../../services/publication.service';

const categories = [
  'Computer Science',
  'Biology',
  'Chemistry',
  'Physics',
  'Engineering',
  'Medicine',
  'Social Sciences',
  'Mathematics'
];

const publicationTypes = ['Research Paper', 'Review Paper', 'Case Study'];
const visibilityOptions = ['Public', 'Private'];

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || '';
      const [, base64] = result.toString().split(',');
      resolve(base64 || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const PublishResearchPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    author: '',
    category: categories[0],
    keywords: '',
    abstract: '',
    publicationType: publicationTypes[0],
    visibility: visibilityOptions[0]
  });
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      setFile(selected);
      setUploadProgress(0);
      setSubmitted(false);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          toast.success('File uploaded successfully');
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error('Upload the PDF file first before publishing');
      return;
    }

    if (!form.title.trim() || !form.author.trim() || !form.abstract.trim()) {
      toast.error('Please fill in the required fields');
      return;
    }

    const publication = {
      title: form.title,
      author: form.author,
      category: form.category,
      keywords: form.keywords,
      abstract: form.abstract,
      publicationType: form.publicationType,
      visibility: form.visibility,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileData: await fileToBase64(file),
      submittedAt: new Date().toISOString()
    };

    publicationService.savePublication(publication);
    setSubmitted(true);
    toast.success('Research submitted successfully');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-text-primary">Publish Research</h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          Upload your research paper, enter the details, and preview your submission before publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-border rounded-3xl p-6 shadow-sm">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-text-primary">Paper Upload</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-text-secondary">
                  <span className="mb-2 block font-semibold">Upload PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-text-primary file:mr-4 file:rounded-full file:border file:border-border file:bg-bg-card file:px-4 file:py-2 file:text-sm file:font-semibold file:text-text-primary hover:file:bg-bg-page"
                  />
                </label>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-text-primary">Selected File</p>
                  <p className="text-sm text-text-secondary min-h-[1.5rem]">
                    {file ? file.name : 'No file chosen yet'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button type="button" variant="primary" onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload PDF'}
                </Button>
                {uploadProgress > 0 && (
                  <div className="w-full rounded-full bg-bg-card overflow-hidden h-2">
                    <div className="h-2 bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-text-primary">Research Details</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">Research Title</span>
                  <input
                    value={form.title}
                    onChange={handleChange('title')}
                    placeholder="Enter research title"
                    className="w-full rounded-2xl border border-border bg-bg-card px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="space-y-2 text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">Author Name</span>
                  <input
                    value={form.author}
                    onChange={handleChange('author')}
                    placeholder="Enter author name"
                    className="w-full rounded-2xl border border-border bg-bg-card px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">Category / Field</span>
                  <select
                    value={form.category}
                    onChange={handleChange('category')}
                    className="w-full rounded-2xl border border-border bg-bg-card px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {categories.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">Keywords</span>
                  <input
                    value={form.keywords}
                    onChange={handleChange('keywords')}
                    placeholder="e.g. AI, machine learning, neuroscience"
                    className="w-full rounded-2xl border border-border bg-bg-card px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm text-text-secondary">
                <span className="font-semibold text-text-primary">Abstract</span>
                <textarea
                  value={form.abstract}
                  onChange={handleChange('abstract')}
                  rows={5}
                  placeholder="Enter a short abstract of your research..."
                  className="w-full rounded-2xl border border-border bg-bg-card px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-text-secondary">
                <span className="font-semibold text-text-primary">Publication Type</span>
                <select
                  value={form.publicationType}
                  onChange={handleChange('publicationType')}
                  className="w-full rounded-2xl border border-border bg-bg-card px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {publicationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-text-secondary">
                <span className="font-semibold text-text-primary">Visibility</span>
                <select
                  value={form.visibility}
                  onChange={handleChange('visibility')}
                  className="w-full rounded-2xl border border-border bg-bg-card px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {visibilityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </section>

            <div className="flex flex-col gap-4 pt-4 border-t border-border">
              <Button type="submit" variant="primary" className="w-full">
                Publish Research
              </Button>
              {submitted && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Research submitted successfully.
                  </div>
                  <Button type="button" variant="outline" onClick={() => navigate('/publication')}>
                    View Publications
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-text-primary">Preview</h3>
            </div>
            <div className="space-y-4 text-sm text-text-secondary">
              <div className="rounded-2xl border border-border bg-bg-card p-4">
                <p className="font-semibold text-text-primary">Paper</p>
                <p>{file ? file.name : 'No uploaded PDF yet'}</p>
              </div>
              <div className="rounded-2xl border border-border bg-bg-card p-4">
                <p className="font-semibold text-text-primary">Title</p>
                <p>{form.title || 'Research title will appear here'}</p>
              </div>
              <div className="rounded-2xl border border-border bg-bg-card p-4">
                <p className="font-semibold text-text-primary">Author</p>
                <p>{form.author || 'Author name will appear here'}</p>
              </div>
              <div className="rounded-2xl border border-border bg-bg-card p-4">
                <p className="font-semibold text-text-primary">Category</p>
                <p>{form.category}</p>
              </div>
              <div className="rounded-2xl border border-border bg-bg-card p-4">
                <p className="font-semibold text-text-primary">Abstract</p>
                <p className="whitespace-pre-line text-sm text-text-secondary">{form.abstract || 'Abstract preview will appear here.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishResearchPage;
