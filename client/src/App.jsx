import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

import Sidebar from './components/Sidebar';
import Icons from './components/Icons';
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const Footer = lazy(() => import('./components/Footer'));
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Booking = lazy(() => import('./pages/Booking'));
const Team = lazy(() => import('./pages/Team'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const MyAppointments = lazy(() => import('./pages/MyAppointments'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const SetupAdmin = lazy(() => import('./pages/admin/SetupAdmin'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminSchedule = lazy(() => import('./pages/admin/Schedule'));
const AdminClients = lazy(() => import('./pages/admin/Clients'));
const AdminBarbers = lazy(() => import('./pages/admin/Barbers'));
const AdminServices = lazy(() => import('./pages/admin/Services'));
const AdminMedia = lazy(() => import('./pages/admin/Media'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminBlockouts = lazy(() => import('./pages/admin/Blockouts'));
const AdminPromotions = lazy(() => import('./pages/admin/Promotions'));
const AdminPartners = lazy(() => import('./pages/admin/Partners'));
const AdminLoyalty = lazy(() => import('./pages/admin/Loyalty'));
const Promotions = lazy(() => import('./pages/Promotions'));
const Partners = lazy(() => import('./pages/Partners'));
const Loyalty = lazy(() => import('./pages/Loyalty'));

function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useSettings();

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <header className="h-12 bg-[#111] border-b border-[#2a2a2a] flex items-center px-4 md:hidden sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-[#a0a0a0] hover:text-white">
            <Icons.Menu size={22} />
          </button>
          <div className="flex-1 flex justify-center">
            <span className="font-display font-bold text-sm text-white tracking-widest">{settings.site_name?.split(' ')[0] || 'PIRESQK'}</span>
          </div>
          <div className="w-8" />
        </header>
        <main className="flex-1"><Outlet /></main>
        <Footer />
      </div>
    </div>
  );
}

function RouteLoading() {
  return <div className="min-h-screen bg-[var(--bg-main)]" />;
}

function AppRoutes() {
  const { modules } = useSettings();
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/setup" element={<SetupAdmin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="schedule" element={modules.booking ? <AdminSchedule /> : <Navigate to="/admin" replace />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="barbers" element={modules.team ? <AdminBarbers /> : <Navigate to="/admin" replace />} />
        <Route path="services" element={modules.services ? <AdminServices /> : <Navigate to="/admin" replace />} />
        <Route path="media" element={modules.gallery ? <AdminMedia /> : <Navigate to="/admin" replace />} />
        <Route path="reports" element={(modules.reviews || modules.services) ? <AdminReports /> : <Navigate to="/admin" replace />} />
        <Route path="blockouts" element={modules.booking ? <AdminBlockouts /> : <Navigate to="/admin" replace />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="partners" element={<AdminPartners />} />
        <Route path="loyalty" element={<AdminLoyalty />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
      <Route path="/" element={<ClientLayout />}>
        <Route index element={<Home />} />
        <Route path="services" element={modules.services ? <Services /> : <Navigate to="/" replace />} />
        <Route path="booking" element={modules.booking ? <Booking /> : <Navigate to="/" replace />} />
        <Route path="team" element={modules.team ? <Team /> : <Navigate to="/" replace />} />
        <Route path="gallery" element={modules.gallery ? <Gallery /> : <Navigate to="/" replace />} />
        <Route path="contact" element={modules.contact ? <Contact /> : <Navigate to="/" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<Profile />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="partners" element={<Partners />} />
        <Route path="loyalty" element={<Loyalty />} />
        <Route path="my-appointments" element={<MyAppointments />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SettingsProvider>
          <Suspense fallback={<RouteLoading />}>
            <AppRoutes />
          </Suspense>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
