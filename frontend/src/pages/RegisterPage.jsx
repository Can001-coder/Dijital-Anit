import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Api from '../api';
import { showFlash } from '../components/FlashMessage';
import { sanitizeInput } from '../utils/sanitize';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await Api.register(username, email, password, phoneNumber);
    if (result.success) {
      showFlash('Kayıt başarılı! Giriş yapabilirsiniz.', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      showFlash(result.error || 'Kayıt başarısız', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="auth-header"><h2>Kayıt Ol</h2></div>
      <div className="auth-body">
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="username">Kullanıcı Adı</label>
            <input 
             type="text" 
             id="username" 
             placeholder="Seçmek istediğiniz kullanıcı adı" 
             value={username} onChange={e => setUsername(sanitizeInput(e.target.value))} 
             maxLength={20}
             required 
            />
            {username.length >= 20 && <span style={{ color: '#e74c3c', fontSize: '12px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Maksimum karakter sınırına (20) ulaştınız.</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email">E-posta Adresi</label>
            <input 
             type="email" 
             id="email" 
             placeholder="Doğrulama bağlantısı için gerekli" 
             value={email} onChange={e => setEmail(sanitizeInput(e.target.value))} 
             maxLength={100}
             required 
            />
            {email.length >= 100 && <span style={{ color: '#e74c3c', fontSize: '12px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Maksimum karakter sınırına (100) ulaştınız.</span>}
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Telefon Numarası</label>
            <input 
             type="tel" 
             id="phoneNumber" 
             placeholder="5XX XXX XX XX" 
             value={phoneNumber} onChange={e => setPhoneNumber(sanitizeInput(e.target.value).replace(/\D/g, '').slice(0, 10))} 
             maxLength={10}
             required 
            />
            {phoneNumber.length >= 10 && <span style={{ color: '#e74c3c', fontSize: '12px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Maksimum karakter sınırına (10) ulaştınız.</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input 
             type="password" 
             id="password" 
             placeholder="Güçlü bir şifre oluşturun" 
             value={password} onChange={e => setPassword(sanitizeInput(e.target.value))} 
             maxLength={20}
             required 
            />
            {password.length >= 20 && <span style={{ color: '#e74c3c', fontSize: '12px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Maksimum karakter sınırına (20) ulaştınız.</span>}
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>
        <p className="form-footer">Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
