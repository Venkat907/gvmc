import React from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  ShieldAlert,
  Code2,
  FileText,
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Identity & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gov-600 flex items-center justify-center text-white">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">
                  GVMC Open Data Portal
                </h3>
                <span className="text-xs text-slate-400">Researchers & Startups (SW61)</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A centralized civic data gateway designed to democratize municipal datasets for data scientists, academic researchers, and urban tech startups in Visakhapatnam.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <span className="inline-block px-2.5 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono text-[11px]">
                API v1.0.0 • REST / JSON
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 border-l-2 border-gov-500 pl-2">
              Civic Datasets
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/datasets?category=Water+Supply" className="hover:text-white transition-colors">
                  Water Supply & Reservoirs
                </Link>
              </li>
              <li>
                <Link to="/datasets?category=Waste+Management" className="hover:text-white transition-colors">
                  Municipal Waste & Recycling
                </Link>
              </li>
              <li>
                <Link to="/datasets?category=Roads+and+Infrastructure" className="hover:text-white transition-colors">
                  Road Maintenance & Potholes
                </Link>
              </li>
              <li>
                <Link to="/datasets?category=Public+Health" className="hover:text-white transition-colors">
                  UPHC Health Centers & Footfalls
                </Link>
              </li>
              <li>
                <Link to="/datasets?category=Transportation" className="hover:text-white transition-colors">
                  Bus Routes & BRTS Corridors
                </Link>
              </li>
              <li>
                <Link to="/datasets?category=Environment" className="hover:text-white transition-colors">
                  Air Quality (AQI) & Telemetry
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 border-l-2 border-gov-500 pl-2">
              Resources & About
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About the Portal & Methodology
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  All 8 Thematic Categories
                </Link>
              </li>
              <li>
                <Link to="/datasets" className="hover:text-white transition-colors">
                  Full Dataset Catalogue
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors">
                  Municipal Administrator Login
                </Link>
              </li>
              <li>
                <a
                  href="https://data.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  <span>Open Government Data India</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Civic Office Reference */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 border-l-2 border-gov-500 pl-2">
              Municipal Reference
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gov-400 shrink-0 mt-0.5" />
                <span>
                  Greater Visakhapatnam Municipal Corporation (GVMC) Head Office, Tenneti Bhavan, Asilmetta, Visakhapatnam, Andhra Pradesh 530002
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gov-400 shrink-0" />
                <span>GVMC Civic Helpline: 1800-425-00009</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gov-400 shrink-0" />
                <span>support.opendata@gvmc-research.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-400">
          <div className="bg-slate-800/80 rounded-lg p-3.5 border border-slate-700 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-200">Disclaimer & Prototype Notice:</strong> This web portal is an independent academic software engineering project prototype developed under Project SW61. All records provided within this platform are <strong>DEMO DATA — NOT VERIFIED OFFICIAL GVMC DATA</strong>. It does not represent an officially endorsed municipal service of the Greater Visakhapatnam Municipal Corporation unless formal authorization is granted.
            </p>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} GVMC Open Data Portal (SW61). Open Access for Research.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400">React + Vite + Express + MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
