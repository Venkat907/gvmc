import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Database,
  Layers,
  FileSpreadsheet,
  Download,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Droplets,
  Trash2,
  HardHat,
  Activity,
  Bus,
  Receipt,
  Trees,
  Building2,
  Cpu,
  GraduationCap,
  Rocket,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { statsAPI, datasetsAPI, categoriesAPI } from '../services/api';
import DatasetCard from '../components/dataset/DatasetCard';
import DemoBanner from '../components/common/DemoBanner';
import { LoadingSpinner, CardSkeleton } from '../components/common/LoadingSpinner';

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [featuredDatasets, setFeaturedDatasets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [statsRes, featuredRes, catRes] = await Promise.all([
          statsAPI.getStats(),
          datasetsAPI.getFeatured(),
          categoriesAPI.getAll(),
        ]);

        if (statsRes.success) setStats(statsRes.stats);
        if (featuredRes.success) setFeaturedDatasets(featuredRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);
      } catch (err) {
        console.error('Failed to load home page dynamic data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/datasets?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/datasets');
    }
  };

  const getCategoryIcon = (iconName) => {
    const icons = {
      Droplets: <Droplets className="w-5 h-5 text-blue-600" />,
      Trash2: <Trash2 className="w-5 h-5 text-emerald-600" />,
      HardHat: <HardHat className="w-5 h-5 text-amber-600" />,
      Activity: <Activity className="w-5 h-5 text-rose-600" />,
      Bus: <Bus className="w-5 h-5 text-indigo-600" />,
      Receipt: <Receipt className="w-5 h-5 text-teal-600" />,
      Trees: <Trees className="w-5 h-5 text-green-600" />,
      Building2: <Building2 className="w-5 h-5 text-purple-600" />,
    };
    return icons[iconName] || <Layers className="w-5 h-5 text-gov-600" />;
  };

  const chartColors = ['#0c87eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gov-900 via-gov-800 to-slate-900 text-white py-16 lg:py-24">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Civic Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium text-blue-200 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-civic-gold" />
            <span>Official Civic Open Data Prototype (SW61)</span>
          </div>

          {/* Heading required by prompt */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Discover Open Data.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200">
              Build Better Solutions.
            </span>
          </h1>

          {/* Supporting Description */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Centralized civic gateway for researchers, startups, students, and urban developers to explore, preview, and download authenticated municipal datasets across Visakhapatnam.
          </p>

          {/* Prominent Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center p-2 rounded-2xl bg-white shadow-2xl border border-white/20"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <input
                type="text"
                placeholder="Search by keywords, e.g. 'water supply', 'solid waste', 'air quality'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-3 text-sm text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-semibold text-sm transition-colors shadow-sm shrink-0"
              >
                Search Data
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
              <span className="text-slate-400">Popular searches:</span>
              {['Reservoirs', 'Solid Waste', 'UPHC Health', 'Bus Routes', 'AQI'].map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => navigate(`/datasets?search=${encodeURIComponent(keyword)}`)}
                  className="hover:text-white underline decoration-dotted underline-offset-4"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/datasets"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gov-900 font-bold text-sm hover:bg-slate-100 transition-all shadow-md shadow-white/5"
            >
              <span>Explore Datasets</span>
              <ArrowRight className="w-4 h-4 text-gov-700" />
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-sm border border-slate-700 transition-all"
            >
              <Layers className="w-4 h-4 text-blue-300" />
              <span>Browse Categories</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC STATISTICS CARDS SECTION */}
      <section className="relative -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between text-gov-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Datasets
              </span>
              <Database className="w-5 h-5 text-gov-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats ? stats.totalDatasets : '8+'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Available for open research</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Civic Categories
              </span>
              <Layers className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats ? stats.totalCategories : '8'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Key city administration sectors</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between text-indigo-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Open Formats
              </span>
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              CSV, JSON, XLSX
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Machine-readable standards</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Downloads
              </span>
              <Download className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats ? stats.totalDownloads.toLocaleString() : '2,600+'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Community dataset accesses</p>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        <DemoBanner />

        {/* 3. FEATURED DATASETS SECTION */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-gov-700 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated Records</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Featured Municipal Datasets
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                High-demand datasets frequently analyzed by researchers and urban planners.
              </p>
            </div>
            <Link
              to="/datasets"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gov-700 hover:text-gov-900 group"
            >
              <span>View all datasets</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <CardSkeleton key={n} />
              ))}
            </div>
          ) : featuredDatasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDatasets.slice(0, 6).map((dataset) => (
                <DatasetCard key={dataset._id} dataset={dataset} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Database className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 font-medium text-sm">No featured datasets available.</p>
            </div>
          )}
        </section>

        {/* 4. DATASET CATEGORIES SECTION */}
        <section className="bg-slate-100/70 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 rounded-3xl border border-slate-200/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-gov-700 bg-gov-50 px-2.5 py-1 rounded-full border border-gov-200/60">
                Civic Sectors
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3 tracking-tight">
                Browse Datasets by Category
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Discover specialized data streams across municipal administration domains.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/datasets?category=${encodeURIComponent(cat.name)}`}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 hover:border-gov-400 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-gov-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-gov-700 font-semibold">
                    <span>{cat.datasetCount || 0} Datasets</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 5. VISUAL DATA INSIGHTS SECTION (RECHARTS) */}
        {stats && stats.departmentDistribution && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gov-700">
                  Analytics & Coverage
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Dataset Distribution by Department
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Overview of published datasets provided across various municipal administrative divisions.
                </p>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
                Real-time DB metrics
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.departmentDistribution}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(str) => (str.length > 18 ? `${str.slice(0, 18)}...` : str)}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Published Datasets" radius={[6, 6, 0, 0]}>
                    {stats.departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* 6. HOW THE PORTAL HELPS RESEARCHERS AND STARTUPS */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gov-700 bg-gov-50 px-3 py-1 rounded-full border border-gov-200/60">
              Value Proposition
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3 tracking-tight">
              How the Portal Helps Researchers & Startups
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Transforming raw municipal observations into fuel for scientific papers, thesis research, and smart city innovations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-gov-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                For Academic Researchers & Scholars
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eliminate tedious manual Right-to-Information (RTI) delays. Download structured historical series for water security modeling, epidemiological studies, and urban microclimate analysis with standardized citations.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Clean CSV & JSON formatted tables</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verified data dictionary & schemas</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-gov-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                For Civic Tech Startups & Founders
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prototype solutions for Visakhapatnam with actual local context. Build mobility route optimizers, commercial property valuation engines, or waste collection routing algorithms using open APIs.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Direct REST API endpoints</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Commercial use open license conditions</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-gov-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                For Developers & Data Scientists
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access immediate in-browser tabular previews without downloading heavy files. Integrate programmatic data feeds directly into Python notebooks, Pandas dataframes, or React dashboards.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real in-browser file preview table</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant cURL and Python code snippets</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
