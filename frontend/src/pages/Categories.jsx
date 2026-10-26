import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  Trash2,
  HardHat,
  Activity,
  Bus,
  Receipt,
  Trees,
  Building2,
  Layers,
  ArrowRight,
  Database,
  Info,
} from 'lucide-react';
import { categoriesAPI } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import DemoBanner from '../components/common/DemoBanner';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await categoriesAPI.getAll();
        if (res.success) {
          setCategories(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryIcon = (iconName) => {
    const icons = {
      Droplets: <Droplets className="w-6 h-6 text-blue-600" />,
      Trash2: <Trash2 className="w-6 h-6 text-emerald-600" />,
      HardHat: <HardHat className="w-6 h-6 text-amber-600" />,
      Activity: <Activity className="w-6 h-6 text-rose-600" />,
      Bus: <Bus className="w-6 h-6 text-indigo-600" />,
      Receipt: <Receipt className="w-6 h-6 text-teal-600" />,
      Trees: <Trees className="w-6 h-6 text-green-600" />,
      Building2: <Building2 className="w-6 h-6 text-purple-600" />,
    };
    return icons[iconName] || <Layers className="w-6 h-6 text-gov-600" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <DemoBanner />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-gov-700 bg-gov-50 px-3 py-1 rounded-full border border-gov-200/60">
          Thematic Taxonomy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
          Explore Municipal Data Categories
        </h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Datasets are systematically classified into eight primary civic domains representing Visakhapatnam's core urban infrastructure, public amenities, and environmental administration.
        </p>
      </div>

      {/* Disclaimer on Initial Categories */}
      <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-gov-600 shrink-0 mt-0.5" />
        <p>
          <strong>Notice on Category Taxonomy:</strong> These eight civic domains serve as the standardized foundational categories for this open data research prototype, and do not represent a claim that GVMC has published official open datasets in every single category yet.
        </p>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <LoadingSpinner message="Loading municipal categories and dataset aggregations..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/datasets?category=${encodeURIComponent(cat.name)}`}
              className="bg-white rounded-2xl border border-slate-200 hover:border-gov-400 p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {getCategoryIcon(cat.icon)}
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-gov-700 transition-colors">
                  {cat.name}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-gov-700">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-gov-500" />
                  <span>{cat.datasetCount || 0} Published Datasets</span>
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
