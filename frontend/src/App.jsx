import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import FlashMessage from './components/FlashMessage';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loading for performance optimization
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const AddMemorialPage = lazy(() => import('./pages/AddMemorialPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));

function App() {
  return (
    <Router>
      <Header />
      <main>
        <FlashMessage />
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-light)' }}>Yükleniyor...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/stats" element={<StatsPage />} />

            {/* Protected Routes - Yalnızca giriş yapmış kullanıcılar */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/my-profile" element={<UserProfilePage />} />
              <Route path="/add-memorial" element={<AddMemorialPage />} />
            </Route>

            {/* Admin Routes - Yalnızca Admin yetkisi olanlar */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
