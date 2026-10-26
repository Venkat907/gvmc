import React, { useState } from 'react';
import {
  Database,
  Building,
  GraduationCap,
  Rocket,
  ShieldAlert,
  AlertTriangle,
  Mail,
  Send,
  CheckCircle2,
  Workflow,
  Cpu,
  FileSpreadsheet,
} from 'lucide-react';
import DemoBanner from '../components/common/DemoBanner';

export const About = () => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [reportForm, setReportForm] = useState({
    name: '',
    email: '',
    datasetTitle: '',
    issueType: 'outdated',
    description: '',
  });

  const handleReportSubmit = (e) => {
    e.preventDefault();
    // Simulate report recording
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setReportForm({
        name: '',
        email: '',
        datasetTitle: '',
        issueType: 'outdated',
        description: '',
      });
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <DemoBanner />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-gov-700 bg-gov-50 px-3 py-1 rounded-full border border-gov-200/60">
          About Project SW61
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
          About the GVMC Open Data Portal
        </h1>
        <p className="text-base text-slate-600 mt-3 leading-relaxed">
          An initiative to provide an open, standardized, machine-readable civic data gateway for academic scholars, students, data journalists, and civic technology startups across Visakhapatnam.
        </p>
      </div>

      {/* Purpose & Problem Statement */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-gov-600" />
          <span>The Purpose & Problem Solved</span>
        </h2>
        <div className="text-sm text-slate-600 leading-relaxed space-y-3">
          <p>
            In rapidly growing metropolitan centers like Visakhapatnam, urban researchers, thesis scholars, and civic founders routinely encounter severe friction when attempting to access basic public datasets. Information concerning water storage levels, municipal waste generation, road maintenance logs, healthcare footfalls, and transit routes is frequently dispersed across fragmented department reports, physical files, or non-machine-readable formats.
          </p>
          <p>
            The <strong>GVMC Open Data Portal (SW61)</strong> bridges this gap by offering a single, centralized discovery hub. Here, anyone can search across municipal departments, preview raw tables directly within their browser, download verified CSV/JSON/XLSX extracts, and connect programmatically via open REST APIs without administrative bottlenecks.
          </p>
        </div>
      </section>

      {/* Benefits for Researchers & Startups */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">For University Researchers & Students</h3>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Standardized machine-readable formats ready for Python, R, Pandas, and GIS packages.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Documented schemas, inferred data types, and transparent update frequencies.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Enables reproducible urban geography, epidemiological, and hydrological research.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Rocket className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">For Civic Startups & Innovators</h3>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Rapid prototyping of AI algorithms for waste routing, traffic prediction, and property valuation.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Free REST API endpoints for seamless integration into web and mobile civic applications.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Permissive Open Government Data licenses allowing commercial exploration.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Dataset Discovery & Ingestion Pipeline */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-gov-600" />
          <span>How Datasets are Discovered & Published</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="font-bold text-gov-700 text-sm mb-1">1. Discovery</div>
            <p className="text-slate-600 leading-relaxed">
              Periodic aggregation of public registers, environmental monitors, and municipal bulletins.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="font-bold text-gov-700 text-sm mb-1">2. Standardization</div>
            <p className="text-slate-600 leading-relaxed">
              Conversion of raw reports into normalized UTF-8 CSV, JSON schemas, or XLSX matrices.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="font-bold text-gov-700 text-sm mb-1">3. Automated Preview</div>
            <p className="text-slate-600 leading-relaxed">
              Server-side extraction of column headers, data types, and initial sample preview records.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="font-bold text-gov-700 text-sm mb-1">4. Open Publishing</div>
            <p className="text-slate-600 leading-relaxed">
              Indexing with keywords and making available for instantaneous preview and one-click download.
            </p>
          </div>
        </div>
      </section>

      {/* Data Accuracy & Update Limitations Disclaimer */}
      <section className="bg-amber-50/80 rounded-2xl border border-amber-300/80 p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
          <ShieldAlert className="w-6 h-6 text-amber-600" />
          <span>Independent Prototype Status & Data Limitations</span>
        </div>
        <div className="text-xs text-amber-900 leading-relaxed space-y-2">
          <p>
            <strong>Project Prototype Notice:</strong> This web application is an <strong>independent engineering and UI/UX design prototype</strong> developed under Project SW61. It is not an officially commissioned or legally authorized service of the Greater Visakhapatnam Municipal Corporation (GVMC) unless official approval is obtained.
          </p>
          <p>
            <strong>Accuracy Limitations:</strong> Datasets included in this demonstration portal are modeled as sample demonstration files (marked as DEMO DATA). While based on realistic Visakhapatnam geography, ward boundaries, and municipal divisions, they must not be relied upon for critical structural engineering, financial transactions, legal disputes, or municipal regulatory compliance.
          </p>
        </div>
      </section>

      {/* Report Outdated / Inaccurate Data Form */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-gov-600" />
            <span>Report Outdated or Inaccurate Information</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Encountered an outdated record or format discrepancy? Submit your report below to alert the dataset maintainers.
          </p>
        </div>

        {feedbackSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-900">Feedback Submitted Successfully</h4>
            <p className="text-xs text-emerald-700">
              Thank you for helping maintain data hygiene. The maintenance log has received your report.
            </p>
            <button
              onClick={() => setFeedbackSubmitted(false)}
              className="mt-3 px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K. Rao / Scholar"
                  value={reportForm.name}
                  onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@university.edu.in"
                  value={reportForm.email}
                  onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dataset Concerned</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water Supply Levels 2024"
                  value={reportForm.datasetTitle}
                  onChange={(e) => setReportForm({ ...reportForm, datasetTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Type</label>
                <select
                  value={reportForm.issueType}
                  onChange={(e) => setReportForm({ ...reportForm, issueType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500 font-medium"
                >
                  <option value="outdated">Outdated / Stale Records</option>
                  <option value="inaccurate">Inaccurate Column or Unit Value</option>
                  <option value="missing">Missing Wards / Zones Coverage</option>
                  <option value="broken">File Download / Parse Issue</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Explanation</label>
              <textarea
                rows={4}
                required
                placeholder="Please describe the discrepancy, suggest verified source documentation if available..."
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-gov-500"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gov-600 hover:bg-gov-700 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Report to Portal Maintainers</span>
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default About;
