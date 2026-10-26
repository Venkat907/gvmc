import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Download,
  Eye,
  LogOut,
  Database,
  FileSpreadsheet,
  Layers,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  Upload,
  RefreshCw,
  HardDrive,
  Activity,
  History,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { datasetsAPI, statsAPI, activityAPI, categoriesAPI } from '../services/api';
import { FormatBadge, StatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import DemoBanner from '../components/common/DemoBanner';

const OFFICIAL_CATEGORIES = [
  'Water Supply',
  'Waste Management',
  'Roads and Infrastructure',
  'Public Health',
  'Transportation',
  'Revenue and Taxation',
  'Environment',
  'Urban Planning',
];

export const AdminDashboard = () => {
  const { admin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Dashboard Data State
  const [stats, setStats] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & Table State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);

  // Form State (Add / Edit)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Water Supply',
    department: '',
    keywords: '',
    sourceUrl: 'https://gvmc.gov.in',
    fileFormat: 'CSV',
    license: 'Government Open Data License - India (GODL) / CC-BY-4.0',
    status: 'published',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // Initial Load
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, logsRes] = await Promise.all([
        statsAPI.getStats(),
        activityAPI.getLogs(15),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (logsRes.success) setActivityLogs(logsRes.data || []);
    } catch (err) {
      console.error('Error fetching admin stats/logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  // Fetch Datasets on table filter change
  const fetchTableDatasets = async () => {
    try {
      const res = await datasetsAPI.getAll({
        search: searchTerm || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        status: statusFilter, // 'all', 'published', 'draft'
        page,
        limit: 10,
        sort: 'newest',
      });

      if (res.success) {
        setDatasets(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Error fetching dataset table records:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTableDatasets();
    }
  }, [isAuthenticated, searchTerm, statusFilter, categoryFilter, page]);

  // Open Edit Modal
  const handleOpenEdit = (dataset) => {
    setSelectedDataset(dataset);
    setFormData({
      title: dataset.title || '',
      description: dataset.description || '',
      category: dataset.category || 'Water Supply',
      department: dataset.department || '',
      keywords: Array.isArray(dataset.keywords) ? dataset.keywords.join(', ') : '',
      sourceUrl: dataset.sourceUrl || 'https://gvmc.gov.in',
      fileFormat: dataset.fileFormat || 'CSV',
      license: dataset.license || 'Government Open Data License - India (GODL) / CC-BY-4.0',
      status: dataset.status || 'published',
    });
    setSelectedFile(null);
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (dataset) => {
    setSelectedDataset(dataset);
    setIsDeleteModalOpen(true);
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.description || !formData.category || !formData.department) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (!selectedFile) {
      setFormError('Please choose a dataset file (.csv, .json, or .xlsx).');
      return;
    }

    setFormSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('department', formData.department);
      data.append('keywords', formData.keywords);
      data.append('sourceUrl', formData.sourceUrl);
      data.append('fileFormat', formData.fileFormat);
      data.append('license', formData.license);
      data.append('status', formData.status);
      data.append('file', selectedFile);

      const res = await datasetsAPI.create(data);
      if (res.success) {
        setIsAddModalOpen(false);
        setSuccessNotice(`Dataset "${formData.title}" created successfully!`);
        setTimeout(() => setSuccessNotice(''), 4000);
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: 'Water Supply',
          department: '',
          keywords: '',
          sourceUrl: 'https://gvmc.gov.in',
          fileFormat: 'CSV',
          license: 'Government Open Data License - India (GODL) / CC-BY-4.0',
          status: 'published',
        });
        setSelectedFile(null);
        fetchTableDatasets();
        fetchDashboardData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create dataset.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.description || !formData.category || !formData.department) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('department', formData.department);
      data.append('keywords', formData.keywords);
      data.append('sourceUrl', formData.sourceUrl);
      data.append('fileFormat', formData.fileFormat);
      data.append('license', formData.license);
      data.append('status', formData.status);
      if (selectedFile) {
        data.append('file', selectedFile);
      }

      const res = await datasetsAPI.update(selectedDataset._id, data);
      if (res.success) {
        setIsEditModalOpen(false);
        setSuccessNotice(`Dataset "${formData.title}" updated successfully!`);
        setTimeout(() => setSuccessNotice(''), 4000);
        setSelectedFile(null);
        fetchTableDatasets();
        fetchDashboardData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update dataset.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!selectedDataset) return;
    try {
      const res = await datasetsAPI.delete(selectedDataset._id);
      if (res.success) {
        setIsDeleteModalOpen(false);
        setSuccessNotice(`Dataset "${selectedDataset.title}" deleted.`);
        setTimeout(() => setSuccessNotice(''), 4000);
        setSelectedDataset(null);
        fetchTableDatasets();
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete dataset.');
    }
  };

  const chartColors = ['#0c87eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-gov-100 text-gov-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Administrative Control Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{admin?.email}</strong> ({admin?.role || 'admin'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                category: 'Water Supply',
                department: '',
                keywords: '',
                sourceUrl: 'https://gvmc.gov.in',
                fileFormat: 'CSV',
                license: 'Government Open Data License - India (GODL) / CC-BY-4.0',
                status: 'published',
              });
              setSelectedFile(null);
              setFormError('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dataset</span>
          </button>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <DemoBanner />

      {/* Success Banner */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-xs text-emerald-800 flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* KPI OVERVIEW METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-1">
            <span>Total Records</span>
            <Database className="w-4 h-4 text-gov-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats ? stats.totalDatasets : datasets.length}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-semibold">{stats?.publishedDatasets || 0} published</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{stats?.draftDatasets || 0} drafts</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-1">
            <span>Categories</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats ? stats.totalCategories : 8}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Municipal divisions</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-1">
            <span>Total Downloads</span>
            <Download className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats ? stats.totalDownloads.toLocaleString() : 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Dataset transfers</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-1">
            <span>Formats In Use</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats ? `${stats.formats.CSV} CSV • ${stats.formats.JSON} JSON` : 'CSV / JSON'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Machine-readable</p>
        </div>
      </div>

      {/* DATASET MANAGEMENT TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Municipal Datasets Registry</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage dataset publications, metadata revisions, and file attachments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-gov-500 w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none font-semibold text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 max-w-[140px] truncate"
            >
              <option value="All">All Categories</option>
              {OFFICIAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Datasets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-slate-800 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Dataset Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-2 text-center">Format</th>
                <th className="py-3 px-2 text-center">Status</th>
                <th className="py-3 px-2 text-center">Downloads</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datasets.length > 0 ? (
                datasets.map((dataset) => (
                  <tr key={dataset._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 max-w-xs font-semibold text-slate-900">
                      <div className="truncate" title={dataset.title}>
                        {dataset.title}
                      </div>
                      <div className="text-[11px] font-normal text-slate-400">
                        {new Date(dataset.lastUpdated || dataset.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      {dataset.category}
                    </td>
                    <td className="py-3 px-3 max-w-[180px] truncate text-slate-500" title={dataset.department}>
                      {dataset.department}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <FormatBadge format={dataset.fileFormat} />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <StatusBadge status={dataset.status} />
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-slate-800">
                      {dataset.downloadCount || 0}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => window.open(`/datasets/${dataset.slug || dataset._id}`, '_blank')}
                          title="View Live Page"
                          className="p-1.5 text-slate-400 hover:text-gov-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(dataset)}
                          title="Edit Dataset"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(dataset)}
                          title="Delete Dataset"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No datasets match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} items)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RECENT ADMINISTRATIVE ACTIVITY LOG FEED */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gov-600" />
            <h3 className="text-sm font-bold text-slate-900">Recent Administrative Activity</h3>
          </div>
          <span className="text-[11px] text-slate-400">Live Audit Trail</span>
        </div>

        <div className="space-y-3">
          {activityLogs.length > 0 ? (
            activityLogs.slice(0, 8).map((log) => (
              <div
                key={log._id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      log.action === 'CREATE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.action === 'UPDATE'
                        ? 'bg-amber-100 text-amber-800'
                        : log.action === 'DELETE'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {log.action}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{log.details}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      By {log.adminEmail} • IP: {log.ipAddress || '127.0.0.1'}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No activity recorded yet.</p>
          )}
        </div>
      </div>

      {/* MODAL: ADD DATASET */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add New Municipal Dataset</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dataset Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward-wise Drinking Water Quality Index 2024"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Comprehensive description of the dataset, collection method, and key fields..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                  >
                    {OFFICIAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Water Supply Engineering Wing"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">File Format *</label>
                  <select
                    value={formData.fileFormat}
                    onChange={(e) => setFormData({ ...formData, fileFormat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                  >
                    <option value="CSV">CSV</option>
                    <option value="JSON">JSON</option>
                    <option value="XLSX">XLSX</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source URL</label>
                  <input
                    type="text"
                    placeholder="https://gvmc.gov.in"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keywords (Comma separated)</label>
                <input
                  type="text"
                  placeholder="water, quality, chlorination, pipeline"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                />
              </div>

              {/* Real File Upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Upload File (.csv, .json, .xlsx) *</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50/70">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                    <div className="flex text-xs text-slate-600 justify-center">
                      <label className="relative cursor-pointer rounded-md font-bold text-gov-600 hover:text-gov-500 focus-within:outline-none">
                        <span>Select a file from device</span>
                        <input
                          type="file"
                          accept=".csv,.json,.xlsx"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    {selectedFile ? (
                      <p className="text-xs font-semibold text-emerald-600">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">CSV, JSON or XLSX up to 50MB</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-gov-600 hover:bg-gov-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  {formSubmitting ? 'Uploading & Ingesting...' : 'Publish Dataset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DATASET */}
      {isEditModalOpen && selectedDataset && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Edit Dataset: {selectedDataset.title}</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dataset Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                  >
                    {OFFICIAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">File Format *</label>
                  <select
                    value={formData.fileFormat}
                    onChange={(e) => setFormData({ ...formData, fileFormat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                  >
                    <option value="CSV">CSV</option>
                    <option value="JSON">JSON</option>
                    <option value="XLSX">XLSX</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source URL</label>
                  <input
                    type="text"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keywords</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                />
              </div>

              {/* Optional Replacement File */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Replace File (Optional)
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="truncate">
                    <span className="text-[11px] text-slate-500">Current file: </span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedDataset.originalFileName}
                    </span>
                  </div>
                  <label className="cursor-pointer px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-gov-700 font-semibold shrink-0">
                    <span>{selectedFile ? 'Change File' : 'Replace'}</span>
                    <input
                      type="file"
                      accept=".csv,.json,.xlsx"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="sr-only"
                    />
                  </label>
                </div>
                {selectedFile && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    New file staged: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-gov-600 hover:bg-gov-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  {formSubmitting ? 'Saving Changes...' : 'Save Revisions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {isDeleteModalOpen && selectedDataset && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Confirm Dataset Deletion</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-800">"{selectedDataset.title}"</strong>?
                This action will delete the database record and remove the associated file from disk storage.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Yes, Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
