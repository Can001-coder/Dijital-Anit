import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Api from '../api';
import { showFlash } from '../components/FlashMessage';
import { sanitizeInput } from '../utils/sanitize';

const LoginPage = () => {
  const [step, setStep] = useState(1); // 1: Credentials, 2: Method Selection, 3: Enter Code
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await Api.login(username, password);
    setLoading(false);

    if (result.success) {
      if (result.requiresTwoFactor) {
        setTwoFactorToken(result.twoFactorToken);
        setMaskedEmail(result.maskedEmail);
        setMaskedPhone(result.maskedPhone);
        setStep(2);
      } else {
        navigate('/dashboard', { replace: true });
        window.location.reload(); 
      }
    } else {
      showFlash(result.error || 'Giriş Başarısız', 'error');
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!selectedMethod) {
      showFlash('Lütfen bir doğrulama yöntemi seçin.', 'error');
      return;
    }
    setLoading(true);
    const result = await Api.sendTwoFactorCode(twoFactorToken, selectedMethod);
    setLoading(false);

    if (result.success) {
      showFlash('Doğrulama kodu gönderildi.', 'success');
      setStep(3);
    } else {
      showFlash(result.error || 'Kod gönderilemedi.', 'error');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode) return;
    
    setLoading(true);
    const result = await Api.verifyTwoFactorCode(twoFactorToken, verificationCode);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
      window.location.reload();
    } else {
      showFlash(result.error || 'Geçersiz kod.', 'error');
    }
  };

  return (
    <div className="form-container">
      <div className="auth-header"><h2>Giriş Yap</h2></div>
      <div className="auth-body">
        
        {step === 1 && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Kullanıcı Adı</label>
              <input 
                type="text" 
                id="username" 
                placeholder="Kullanıcı adınızı girin" 
                value={username} 
                onChange={(e) => setUsername(sanitizeInput(e.target.value))} 
                maxLength={20}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Şifre</label>
              <input 
               type="password" 
               id="password" 
               placeholder="Şifrenizi girin" 
               value={password}
               onChange={(e) => setPassword(sanitizeInput(e.target.value))}
               maxLength={20}
               required 
              />
            </div>
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <p className="form-footer"><Link to="/forgot-password">Şifremi Unuttum</Link></p>
              <p className="form-footer">Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link></p>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSendCode}>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#5D705D', fontSize: '15px' }}>
              Güvenliğiniz için doğrulama kodunu nereye göndereceğimizi seçin:
            </p>
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {maskedEmail && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #DDE2DB', borderRadius: '8px', cursor: 'pointer', background: selectedMethod === 'EMAIL' ? '#F0F4EC' : '#fff' }}>
                  <input 
                    type="radio" 
                    name="method" 
                    value="EMAIL" 
                    checked={selectedMethod === 'EMAIL'} 
                    onChange={() => setSelectedMethod('EMAIL')} 
                  />
                  <span>E-Posta: <strong>{maskedEmail}</strong></span>
                </label>
              )}

              {maskedPhone && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #DDE2DB', borderRadius: '8px', cursor: 'pointer', background: selectedMethod === 'SMS' ? '#F0F4EC' : '#fff' }}>
                  <input 
                    type="radio" 
                    name="method" 
                    value="SMS" 
                    checked={selectedMethod === 'SMS'} 
                    onChange={() => setSelectedMethod('SMS')} 
                  />
                  <span>SMS: <strong>{maskedPhone}</strong></span>
                </label>
              )}
            </div>
            
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'Kodu Gönder'}
            </button>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <p className="form-footer"><a href="#" onClick={(e) => { e.preventDefault(); setStep(1); }}>Geri Dön</a></p>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleVerifyCode}>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#5D705D', fontSize: '15px' }}>
              Lütfen size gönderilen 6 haneli doğrulama kodunu girin.
            </p>
            <div className="form-group">
              <label htmlFor="code" style={{ textAlign: 'center', display: 'block' }}>Doğrulama Kodu</label>
              <input 
                type="text" 
                id="code" 
                placeholder="XXXXXX" 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(sanitizeInput(e.target.value).replace(/\D/g, '').slice(0, 6))}
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '5px' }}
                required 
              />
            </div>
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }} disabled={loading || verificationCode.length !== 6}>
              {loading ? 'Doğrulanıyor...' : 'Doğrula ve Giriş Yap'}
            </button>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <p className="form-footer"><a href="#" onClick={(e) => { e.preventDefault(); setStep(2); setVerificationCode(''); }}>Farklı bir yöntem seç</a></p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default LoginPage;
