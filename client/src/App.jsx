import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

import Sidebar from './components/Sidebar';
import AdminLayout from './components/AdminLayout';
import { Icons } from './components/Icons';

import Home from './pages/Home';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Team from './pages/Team';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyAppointments from './pages/MyAppointments';

import AdminLogin from './pages/admin/AdminLogin';
import SetupAdmin from './pages/admin/SetupAdmin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminSchedule from './pages/admin/Schedule';
import AdminClients from './pages/admin/Clients';
import AdminBarbers from './pages/admin/Barbers';
import AdminServices from './pages/admin/Services';
import AdminMedia from './pages/admin/Media';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-12 bg-[#111] border-b border-[#2a2a2a] flex items-center px-4 md:hidden sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-[#a0a0a0] hover:text-white">
            <Icons.Menu size={22} />
          </button>
          <div className="flex-1 flex justify-center">
            <span className="font-display font-bold text-sm text-white tracking-widest">PIRESQK</span>
          </div>
          <div className="w-8" />
        </header>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/team" element={<Team />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="schedule" element={<AdminSchedule />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="barbers" element={<AdminBarbers />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="/*" element={<ClientLayout />} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
