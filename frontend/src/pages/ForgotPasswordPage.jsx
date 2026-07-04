import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sanitizeInput } from '../utils/sanitize';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const handleReset = (e) => {
    e.preventDefault();
    alert('Şifre sıfırlama e-postası gönderildi (demo).');
    setEmail('');
  };

  return (
    <div className="form-container">
      <div className="auth-header"><h2>Şifremi Unuttum</h2></div>
      <div className="auth-body">
        <form onSubmit={handleReset}>
          <div className="form-group">
            <label htmlFor="email">E-posta Adresi</label>
            <input 
             type="email" 
             id="email" 
             placeholder="Kayıtlı e-posta adresiniz" 
             value={email}
             onChange={e => setEmail(sanitizeInput(e.target.value))}
             maxLength={100}
             required 
            />
            {email.length >= 100 && <span style={{ color: '#e74c3c', fontSize: '12px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Maksimum karakter sınırına (100) ulaştınız.</span>}
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>
            Sıfırlama Bağlantısı Gönder
          </button>
        </form>
        <p className="form-footer"><Link to="/login">Giriş Yap</Link> sayfasına dön</p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
