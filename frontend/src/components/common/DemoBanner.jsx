import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const DemoBanner = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-800 flex items-center justify-center gap-2">
        <span className="font-semibold uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded text-[10px] text-amber-900">
          Academic Prototype
        </span>
        <span>
          DEMO DATA — NOT VERIFIED OFFICIAL GVMC DATA. Built for civic researchers & startups.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide">
            Notice: Independent Research Prototype (SW61)
          </h3>
          <div className="mt-1 text-sm text-amber-800 leading-relaxed">
            <p>
              This portal is an independent academic and startup demonstration prototype developed to showcase open data discovery. All datasets, API responses, and statistics are <strong>DEMO DATA — NOT VERIFIED OFFICIAL GVMC DATA</strong>. This portal does not claim official endorsement or connection with the Greater Visakhapatnam Municipal Corporation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
