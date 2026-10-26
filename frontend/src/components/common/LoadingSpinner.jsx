import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading dataset records...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-gov-600 animate-spin mb-3`} />
      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse">
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-5 bg-slate-200 rounded w-14"></div>
      </div>
      <div className="h-6 bg-slate-200 rounded w-4/5 mb-3"></div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-100 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <div className="h-3 bg-slate-200 rounded w-20"></div>
        <div className="h-8 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
