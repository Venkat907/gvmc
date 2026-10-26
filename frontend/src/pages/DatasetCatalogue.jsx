import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Database,
  RefreshCw,
  SlidersHorizontal,
  Calendar,
} from 'lucide-react';
import { datasetsAPI, categoriesAPI } from '../services/api';
import DatasetCard from '../components/dataset/DatasetCard';
import { LoadingSpinner, CardSkeleton } from '../components/common/LoadingSpinner';
import DemoBanner from '../components/common/DemoBanner';

export const DatasetCatalogue = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || 'All');
  const [selectedFormat, setSelectedFormat] = useState(searchParams.get('format') || 'All');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || 'All');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Data states
  const [datasets, setDatasets] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL query params change (e.g. from navbar search or footer link)
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) setSearchTerm(urlSearch);

    const urlCat = searchParams.get('category');
    if (urlCat !== null) setSelectedCategory(urlCat);

    const urlDept = searchParams.get('department');
    if (urlDept !== null) setSelectedDepartment(urlDept);

    const urlFormat = searchParams.get('format');
    if (urlFormat !== null) setSelectedFormat(urlFormat);
  }, [searchParams]);

  // Fetch filter metadata (categories & departments)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, deptRes] = await Promise.all([
          categoriesAPI.getAll(),
          categoriesAPI.getDepartments(),
        ]);
        if (catRes.success) setCategoriesList(catRes.data || []);
        if (deptRes.success) setDepartmentsList(deptRes.data || []);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch datasets with current filters
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const params = {
          search: searchTerm || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          department: selectedDepartment !== 'All' ? selectedDepartment : undefined,
          format: selectedFormat !== 'All' ? selectedFormat : undefined,
          year: selectedYear !== 'All' ? selectedYear : undefined,
          sort: sortOption,
          page: currentPage,
          limit: viewMode === 'list' ? 10 : 9,
        };

        const res = await datasetsAPI.getAll(params);
        if (res.success) {
          setDatasets(res.data || []);
          setTotalPages(res.totalPages || 1);
          setTotalCount(res.total || 0);
        }
      } catch (err) {
        console.error('Error fetching datasets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, [
    searchTerm,
    selectedCategory,
    selectedDepartment,
    selectedFormat,
    selectedYear,
    sortOption,
    currentPage,
    viewMode,
  ]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedDepartment('All');
    setSelectedFormat('All');
    setSelectedYear('All');
    setSortOption('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'All' ||
    selectedDepartment !== 'All' ||
    selectedFormat !== 'All' ||
    selectedYear !== 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Title */}
      <div className="mb-6">
        <DemoBanner />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Dataset Catalogue
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Explore and filter {totalCount} open datasets published across municipal departments in Visakhapatnam.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">View:</span>
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gov-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gov-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List layout"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR FILTERS (DESKTOP) */}
        <aside
          className={`lg:block ${
            mobileFilterOpen ? 'block' : 'hidden'
          } lg:col-span-1 space-y-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Filter className="w-4 h-4 text-gov-600" />
              <span>Filter Datasets</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search by name or keyword */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Keyword Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500 font-medium text-slate-700"
            >
              <option value="All">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.datasetCount || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500 font-medium text-slate-700"
            >
              <option value="All">All Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept.name} value={dept.name}>
                  {dept.name} ({dept.datasetCount || 0})
                </option>
              ))}
            </select>
          </div>

          {/* File Format Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              File Format
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['All', 'CSV', 'JSON', 'XLSX'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => {
                    setSelectedFormat(fmt);
                    setCurrentPage(1);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    selectedFormat === fmt
                      ? 'bg-gov-600 text-white border-gov-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Publication Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500 font-medium text-slate-700"
            >
              <option value="All">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </aside>

        {/* MAIN DATASETS CONTENT (3 COLS) */}
        <main className="lg:col-span-3 space-y-6">
          {/* Controls Bar: Results count & Sorting */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="text-xs text-slate-500">
              Showing <strong className="text-slate-800">{datasets.length}</strong> of{' '}
              <strong className="text-slate-800">{totalCount}</strong> datasets
              {selectedCategory !== 'All' && <span> in "{selectedCategory}"</span>}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium shrink-0">Sort By:</label>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500 font-semibold text-slate-700"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A - Z)</option>
                <option value="downloads">Most Downloaded</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>
          </div>

          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs border border-blue-200 font-medium">
                  Keyword: {searchTerm}
                  <button onClick={() => setSearchTerm('')}>
                    <X className="w-3 h-3 text-blue-500 hover:text-blue-700" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs border border-blue-200 font-medium">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')}>
                    <X className="w-3 h-3 text-blue-500 hover:text-blue-700" />
                  </button>
                </span>
              )}
              {selectedDepartment !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs border border-blue-200 font-medium">
                  Dept: {selectedDepartment}
                  <button onClick={() => setSelectedDepartment('All')}>
                    <X className="w-3 h-3 text-blue-500 hover:text-blue-700" />
                  </button>
                </span>
              )}
              {selectedFormat !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs border border-blue-200 font-medium">
                  Format: {selectedFormat}
                  <button onClick={() => setSelectedFormat('All')}>
                    <X className="w-3 h-3 text-blue-500 hover:text-blue-700" />
                  </button>
                </span>
              )}
              {selectedYear !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs border border-blue-200 font-medium">
                  Year: {selectedYear}
                  <button onClick={() => setSelectedYear('All')}>
                    <X className="w-3 h-3 text-blue-500 hover:text-blue-700" />
                  </button>
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-xs text-rose-600 hover:text-rose-800 underline font-semibold ml-1"
              >
                Reset All
              </button>
            </div>
          )}

          {/* DATASETS LISTING */}
          {loading ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                  : 'space-y-4'
              }
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : datasets.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                  : 'space-y-4'
              }
            >
              {datasets.map((dataset) => (
                <DatasetCard key={dataset._id} dataset={dataset} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No matching datasets found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                We couldn't find any datasets matching your search criteria. Try modifying your search keywords or resetting filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-gov-600 hover:bg-gov-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs font-medium text-slate-500">
                Page <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
                <span className="font-bold text-slate-900">{totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DatasetCatalogue;
