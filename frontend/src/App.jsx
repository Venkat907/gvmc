import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import DatasetCatalogue from './pages/DatasetCatalogue';
import DatasetDetails from './pages/DatasetDetails';
import Categories from './pages/Categories';
import About from './pages/About';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Helper component to auto-scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/datasets" element={<DatasetCatalogue />} />
          <Route path="/datasets/:id" element={<DatasetDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="*"
            element={
              <div className="max-w-2xl mx-auto py-20 px-4 text-center">
                <h2 className="text-4xl font-extrabold text-slate-900">404</h2>
                <p className="text-sm text-slate-600 mt-2">
                  The page you are looking for does not exist on the GVMC Open Data Portal.
                </p>
                <a
                  href="/"
                  className="mt-6 inline-block px-5 py-2.5 bg-gov-600 text-white font-semibold text-xs rounded-xl"
                >
                  Return to Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
