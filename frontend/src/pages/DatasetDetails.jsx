import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  Calendar,
  Building,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  Table,
  Code2,
  Share2,
  Check,
  AlertCircle,
  ChevronRight,
  Info,
  Layers,
  ArrowLeft,
  Search,
  Sparkles,
} from 'lucide-react';
import { datasetsAPI } from '../services/api';
import { FormatBadge, CategoryBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import DemoBanner from '../components/common/DemoBanner';
import DatasetCard from '../components/dataset/DatasetCard';

export const DatasetDetails = () => {
  const { id } = useParams();

  const [dataset, setDataset] = useState(null);
  const [related, setRelated] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'schema' | 'api'
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [previewPage, setPreviewPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await datasetsAPI.getById(id);
        if (res.success && res.data) {
          setDataset(res.data);
          setRelated(res.related || []);
        } else {
          setError('Dataset not found.');
        }
      } catch (err) {
        console.error('Error fetching dataset details:', err);
        setError(err.response?.data?.message || 'Failed to load dataset.');
      } finally {
        setLoading(false);
      }
    };

    fetchDataset();
  }, [id]);

  // Fetch real file preview
  useEffect(() => {
    if (!dataset?._id) return;

    const fetchPreview = async () => {
      try {
        setPreviewLoading(true);
        setPreviewError(null);
        const res = await datasetsAPI.getPreview(dataset._id);
        if (res.success) {
          setPreviewData(res);
        } else {
          setPreviewError('Preview data is currently unavailable for this dataset.');
        }
      } catch (err) {
        console.warn('Preview error:', err);
        setPreviewError(
          err.response?.data?.message || 'Data preview is unavailable for this file format or storage reference.'
        );
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [dataset?._id]);

  const handleDownload = () => {
    if (dataset?._id) {
      window.location.href = datasetsAPI.downloadUrl(dataset._id);
      // Optimistically increment downloadCount in local UI state
      setDataset((prev) => (prev ? { ...prev, downloadCount: (prev.downloadCount || 0) + 1 } : prev));
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading dataset details and metadata..." />;
  }

  if (error || !dataset) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Dataset Not Found</h2>
        <p className="text-sm text-slate-600 mt-2 mb-6">{error || 'The requested dataset could not be located.'}</p>
        <Link
          to="/datasets"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gov-600 text-white rounded-lg text-sm font-semibold hover:bg-gov-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dataset Catalogue</span>
        </Link>
      </div>
    );
  }

  // Filter preview rows
  const previewRows = previewData?.rows || dataset.sampleRows || [];
  const previewColumns = previewData?.columns || dataset.columns || [];

  const filteredPreviewRows = previewRows.filter((row) => {
    if (!tableSearch.trim()) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(tableSearch.toLowerCase())
    );
  });

  const totalPreviewPages = Math.ceil(filteredPreviewRows.length / rowsPerPage) || 1;
  const paginatedRows = filteredPreviewRows.slice(
    (previewPage - 1) * rowsPerPage,
    previewPage * rowsPerPage
  );

  const apiSnippet = `// Direct Fetch API snippet for GVMC Open Data (SW61)
const response = await fetch('${window.location.origin}/api/datasets/${dataset._id}/preview');
const data = await response.json();
console.log('Columns:', data.columns);
console.log('Sample Records:', data.rows);`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-gov-700">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/datasets" className="hover:text-gov-700">
          Datasets
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-medium truncate max-w-xs">{dataset.title}</span>
      </nav>

      <DemoBanner />

      {/* Dataset Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <FormatBadge format={dataset.fileFormat} />
              <CategoryBadge category={dataset.category} />
              {dataset.isDemoData && (
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  DEMO DATASET
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {dataset.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Building className="w-4 h-4 text-gov-600" />
                <span>{dataset.department}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Published: {formatDate(dataset.publicationDate)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Updated: {formatDate(dataset.lastUpdated)}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row md:flex-col items-center gap-3 shrink-0">
            <button
              onClick={handleDownload}
              className="w-full md:w-48 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="w-full md:w-48 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Share Dataset</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Description & Scope
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {dataset.description}
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-medium">File Format</span>
            <p className="font-bold text-slate-900 mt-0.5">{dataset.fileFormat}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">File Size</span>
            <p className="font-bold text-slate-900 mt-0.5">{formatFileSize(dataset.fileSize)}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Downloads</span>
            <p className="font-bold text-slate-900 mt-0.5">
              {(dataset.downloadCount || 0).toLocaleString()} times
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Official Source</span>
            <p className="mt-0.5 truncate">
              <a
                href={dataset.sourceUrl || 'https://gvmc.gov.in'}
                target="_blank"
                rel="noreferrer"
                className="text-gov-700 hover:underline inline-flex items-center gap-1 font-semibold truncate"
              >
                <span>GVMC Portal</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </p>
          </div>
        </div>

        {/* License & Keywords */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>License:</strong> {dataset.license || 'Open Government Data License - India (GODL)'}
            </span>
          </div>

          {dataset.keywords && dataset.keywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400">Tags:</span>
              {dataset.keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TABS CONTAINER: PREVIEW / SCHEMA / API */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'border-gov-600 text-gov-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Data Preview ({previewRows.length} rows)</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-gov-600 text-gov-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Columns & Schema ({previewColumns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'api'
                ? 'border-gov-600 text-gov-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>API Access for Researchers</span>
          </button>
        </div>

        {/* Tab 1: DATA PREVIEW TABLE */}
        {activeTab === 'preview' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Displaying actual tabular rows parsed directly from the uploaded{' '}
                <strong className="text-slate-800">{dataset.fileFormat}</strong> file.
              </div>

              {/* Table search filter */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Filter preview rows..."
                  value={tableSearch}
                  onChange={(e) => {
                    setTableSearch(e.target.value);
                    setPreviewPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {previewLoading ? (
              <LoadingSpinner message="Parsing uploaded file for interactive preview..." />
            ) : previewError ? (
              <div className="py-10 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-700">Preview Data Unavailable</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{previewError}</p>
                <button
                  onClick={handleDownload}
                  className="mt-4 px-4 py-2 bg-gov-600 text-white rounded-lg text-xs font-semibold hover:bg-gov-700"
                >
                  Download Complete File Instead
                </button>
              </div>
            ) : paginatedRows.length > 0 ? (
              <>
                <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs max-h-[500px]">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 shadow-2xs z-10">
                      <tr>
                        <th className="py-2.5 px-3 border-b border-r border-slate-200 w-12 text-center text-slate-500 bg-slate-100">
                          #
                        </th>
                        {previewColumns.map((col) => (
                          <th
                            key={col}
                            className="py-2.5 px-3 border-b border-r border-slate-200 whitespace-nowrap bg-slate-100"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {paginatedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                          <td className="py-2 px-3 border-r border-slate-200 text-center text-slate-400 font-sans">
                            {(previewPage - 1) * rowsPerPage + idx + 1}
                          </td>
                          {previewColumns.map((col) => {
                            const val = row[col];
                            return (
                              <td
                                key={col}
                                className="py-2 px-3 border-r border-slate-100 whitespace-nowrap max-w-xs truncate"
                                title={typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              >
                                {typeof val === 'object'
                                  ? JSON.stringify(val)
                                  : val !== undefined && val !== null
                                  ? String(val)
                                  : '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Preview Table Pagination */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <span>
                    Showing {(previewPage - 1) * rowsPerPage + 1} to{' '}
                    {Math.min(previewPage * rowsPerPage, filteredPreviewRows.length)} of{' '}
                    {filteredPreviewRows.length} sample rows
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewPage((p) => Math.max(p - 1, 1))}
                      disabled={previewPage === 1}
                      className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                    >
                      Prev
                    </button>
                    <span className="font-semibold text-slate-700">
                      {previewPage} / {totalPreviewPages}
                    </span>
                    <button
                      onClick={() => setPreviewPage((p) => Math.min(p + 1, totalPreviewPages))}
                      disabled={previewPage === totalPreviewPages}
                      className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No preview rows match the search query "{tableSearch}".
              </div>
            )}
          </div>
        )}

        {/* Tab 2: SCHEMA & COLUMNS DICTIONARY */}
        {activeTab === 'schema' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Dataset Column Definitions & Types</h3>
            <p className="text-xs text-slate-500">
              Identified fields present in the dataset structure.
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Column Header</th>
                    <th className="py-2.5 px-4">Inferred Type</th>
                    <th className="py-2.5 px-4">Sample Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {previewColumns.map((col) => {
                    const sampleVal = previewRows[0] ? previewRows[0][col] : 'N/A';
                    let inferredType = 'String';
                    if (!isNaN(Number(sampleVal)) && sampleVal !== '') inferredType = 'Number';
                    if (sampleVal === 'true' || sampleVal === 'false' || typeof sampleVal === 'boolean')
                      inferredType = 'Boolean';
                    if (typeof sampleVal === 'object') inferredType = 'Object / Array';

                    return (
                      <tr key={col} className="hover:bg-slate-50">
                        <td className="py-2 px-4 font-bold text-gov-700">{col}</td>
                        <td className="py-2 px-4 text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {inferredType}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-slate-500 truncate max-w-sm">
                          {typeof sampleVal === 'object' ? JSON.stringify(sampleVal) : String(sampleVal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: PROGRAMMATIC API ACCESS */}
        {activeTab === 'api' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Direct Programmatic Access (REST)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consume this dataset endpoint directly in your frontend application or data pipeline.
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiSnippet);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 border border-slate-200"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code2 className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied Snippet' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-blue-200 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">
              <code>{apiSnippet}</code>
            </pre>

            <div className="text-xs text-slate-500 space-y-1">
              <p>
                <strong>Download File URL:</strong>{' '}
                <code className="text-gov-700 bg-slate-100 px-1 py-0.5 rounded">
                  {window.location.origin}/api/datasets/{dataset._id}/download
                </code>
              </p>
              <p>
                <strong>Preview JSON Endpoint:</strong>{' '}
                <code className="text-gov-700 bg-slate-100 px-1 py-0.5 rounded">
                  {window.location.origin}/api/datasets/{dataset._id}/preview
                </code>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RELATED DATASETS */}
      {related.length > 0 && (
        <section className="pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-gov-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Related Datasets in {dataset.category}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {related.map((rel) => (
              <DatasetCard key={rel._id} dataset={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DatasetDetails;
