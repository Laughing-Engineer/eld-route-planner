import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import PlannerPage from './pages/PlannerPage';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import ELDLogsPage from './pages/ELDLogsPage';
import TripHistoryPage from './pages/TripHistoryPage';
import DocumentationPage from './pages/DocumentationPage';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/dashboard/:tripId" element={<DashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/planner" replace />} />
            <Route path="/schedule/:tripId" element={<SchedulePage />} />
            <Route path="/logs/:tripId" element={<ELDLogsPage />} />
            <Route path="/history" element={<TripHistoryPage />} />
            <Route path="/docs" element={<DocumentationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
