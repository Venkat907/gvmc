import React from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Calendar,
  Building,
  Eye,
  ArrowRight,
  HardDrive,
  FileText,
} from 'lucide-react';
import { FormatBadge, CategoryBadge } from '../common/Badge';
import { datasetsAPI } from '../../services/api';

export const DatasetCard = ({ dataset, viewMode = 'grid' }) => {
  const {
    _id,
    slug,
    title,
    description,
    category,
    department,
    fileFormat,
    fileSize,
    lastUpdated,
    downloadCount = 0,
    isDemoData = true,
  } = dataset;

  const datasetLink = `/datasets/${slug || _id}`;

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDirectDownload = (e) => {
    e.stopPropagation();
    window.location.href = datasetsAPI.downloadUrl(_id);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 hover:border-gov-400 p-5 shadow-xs hover:shadow-md transition-all group flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <FormatBadge format={fileFormat} />
            <CategoryBadge category={category} />
            {isDemoData && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Demo
              </span>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto md:ml-2">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Updated {formatDate(lastUpdated)}</span>
            </span>
          </div>

          <Link to={datasetLink} className="block group-hover:text-gov-700 transition-colors">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-gov-700 truncate">
              {title}
            </h3>
          </Link>

          <p className="text-xs text-slate-600 line-clamp-1 mt-1">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 truncate max-w-xs" title={department}>
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{department}</span>
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatFileSize(fileSize)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>{downloadCount} downloads</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <Link
            to={datasetLink}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Details & Preview</span>
          </Link>
          <button
            onClick={handleDirectDownload}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gov-600 hover:bg-gov-700 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-gov-400 p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between h-full">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <FormatBadge format={fileFormat} />
            <CategoryBadge category={category} />
          </div>
          {isDemoData && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Demo
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={datasetLink} className="block group-hover:text-gov-700 transition-colors">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-gov-700 line-clamp-2 leading-snug mb-2">
            {title}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
          {description}
        </p>

        {/* Department Info */}
        <div className="space-y-1.5 py-2.5 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-start gap-1.5 text-slate-600">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1 text-[11px] font-medium" title={department}>
              {department}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formatDate(lastUpdated)}</span>
            </span>
            <span>{formatFileSize(fileSize)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-2 gap-2">
        <Link
          to={datasetLink}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gov-700 hover:text-gov-900 group/link"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>

        <button
          onClick={handleDirectDownload}
          title={`Download ${fileFormat} dataset`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gov-600 hover:bg-gov-700 rounded-lg shadow-2xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};

export default DatasetCard;
