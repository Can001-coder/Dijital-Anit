import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Api from '../api';

const ProtectedRoute = ({ requireAdmin = false }) => {
  const isLoggedIn = Api.isLoggedIn();
  
  if (!isLoggedIn) {
    // Giriş yapmamışsa login sayfasına yönlendir
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    const user = Api.getCurrentUser();
    let isAdmin = false;
    if (user?.role === 'ADMIN') {
      isAdmin = true;
    } else {
      // Token'dan kontrol
      try {
        const token = Api.getToken();
        if (token) {
          const payloadB64 = token.split('.')[1];
          const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          const decoded = JSON.parse(jsonPayload);
          isAdmin = decoded.role === 'ADMIN';
        }
      } catch (e) {
        console.error("Token decode error:", e);
      }
    }

    if (!isAdmin) {
      // Admin değilse ana sayfaya yönlendir
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
