import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Api from '../api';

const Header = React.memo(() => {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = Api.isLoggedIn();
    setIsAuth(loggedIn);
    if (loggedIn) {
      const currentUser = Api.getCurrentUser();
      let localIsAdmin = false;
      if (currentUser?.role) {
        localIsAdmin = currentUser.role === 'ADMIN';
      } else {
        // Fallback: decode directly from token
        try {
          const token = Api.getToken();
          if (token) {
            const payloadB64 = token.split('.')[1];
            const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            const decoded = JSON.parse(jsonPayload);
            localIsAdmin = decoded.role === 'ADMIN';
          }
        } catch (e) {
          console.error("Header token decode error:", e);
        }
      }
      setIsAdmin(localIsAdmin);

      // Verify dynamically with backend
      Api.getAdminDashboard().then(res => {
        if (res && res.status === 200) {
          setIsAdmin(true);
          const current = Api.getCurrentUser() || { username: '' };
          current.role = 'ADMIN';
          Api.setCurrentUser(current);
        } else {
          setIsAdmin(false);
          const current = Api.getCurrentUser();
          if (current) {
            current.role = 'USER';
            Api.setCurrentUser(current);
          }
        }
      }).catch(() => {
        setIsAdmin(false);
      });
    } else {
      setIsAdmin(false);
    }
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    Api.logout();
    setIsAuth(false);
    setIsAdmin(false);
    navigate('/login');
  };

  return (
    <header className="site-header">
      <nav>
        <div className="logo">
          <Link to="/">Dijital Anıt</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Ana Sayfa</Link></li>
          {isAuth ? (
            <>
              <li><Link to="/add-memorial">Anıt Ekle</Link></li>
              <li><Link to="/my-profile">Profilim</Link></li>
              {isAdmin && <li><Link to="/admin">Admin</Link></li>}
              <li><a href="#" onClick={handleLogout}>Çıkış Yap</a></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Giriş Yap</Link></li>
              <li><Link to="/register">Kayıt Ol</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
});

export default Header;
