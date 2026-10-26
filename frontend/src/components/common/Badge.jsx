import React from 'react';

export const FormatBadge = ({ format, className = '' }) => {
  const normalized = (format || '').toUpperCase();

  const styles = {
    CSV: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    JSON: 'bg-amber-50 text-amber-700 border-amber-200',
    XLSX: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const style = styles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold tracking-wider border uppercase ${style} ${className}`}
    >
      {normalized}
    </span>
  );
};

export const CategoryBadge = ({ category, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gov-50 text-gov-700 border border-gov-200/60 ${className}`}
    >
      {category}
    </span>
  );
};

export const StatusBadge = ({ status, className = '' }) => {
  const isPublished = status === 'published';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
        isPublished
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-slate-200 text-slate-700'
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          isPublished ? 'bg-emerald-500' : 'bg-slate-500'
        }`}
      />
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
};
