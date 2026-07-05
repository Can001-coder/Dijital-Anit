import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Api from '../api';
import { showFlash } from '../components/FlashMessage';
import { sanitizeInput } from '../utils/sanitize';
import CustomValidatedInput from '../components/CustomValidatedInput';

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

  const [usernameError, setUsernameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [codeError, setCodeError] = useState(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(180);
  const [isTimerActive, setIsTimerActive] = useState(false);

  React.useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    let hasError = false;

    if (!username || username.trim() === '') {
      setUsernameError('Lütfen bu alanı doldurun.');
      hasError = true;
    } else {
      setUsernameError(null);
    }

    if (!password || password.trim() === '') {
      setPasswordError('Lütfen bu alanı doldurun.');
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (hasError) return;

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
      setTimeLeft(180);
      setIsTimerActive(true);
      setStep(3);
    } else {
      showFlash(result.error || 'Kod gönderilemedi.', 'error');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.trim() === '') {
      setCodeError('Lütfen bu alanı doldurun.');
      return;
    } else if (verificationCode.length !== 6) {
      setCodeError('Geçersiz doğrulama kodu.');
      return;
    } else {
      setCodeError(null);
    }
    
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
          <form onSubmit={handleLogin} noValidate>
            <CustomValidatedInput
              label="Kullanıcı Adı"
              id="username"
              placeholder="Kullanıcı adınızı girin"
              value={username}
              onChange={(e) => {
                setUsername(sanitizeInput(e.target.value).replace(/\s/g, ''));
                if (e.target.value.trim() !== '') setUsernameError(null);
              }}
              maxLength={20}
              error={usernameError}
            />

            <CustomValidatedInput
              type="password"
              label="Şifre"
              id="password"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => {
                setPassword(sanitizeInput(e.target.value));
                if (e.target.value.trim() !== '') setPasswordError(null);
              }}
              maxLength={20}
              error={passwordError}
            />
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
          <form onSubmit={handleVerifyCode} noValidate>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#5D705D', fontSize: '15px' }}>
              Lütfen size gönderilen 6 haneli doğrulama kodunu girin.
            </p>

            <div style={{ textAlign: 'center', marginBottom: '15px', fontWeight: 'bold', color: timeLeft === 0 ? '#e74c3c' : '#5D705D', fontSize: '18px' }}>
              Kalan Süre: {formatTime(timeLeft)}
            </div>

            <CustomValidatedInput
              label="Doğrulama Kodu"
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="XXXXXX"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                if (e.target.value.trim() !== '') setCodeError(null);
              }}
              style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '5px' }}
              maxLength={6}
              autoComplete="one-time-code"
              error={codeError}
              successMessage={verificationCode.length === 6 && !codeError ? "✓ Geçerli doğrulama kodu" : null}
              hideMaxLengthAlert={true}
            />
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }} disabled={loading || timeLeft === 0}>
              {loading ? 'Doğrulanıyor...' : 'Doğrula ve Giriş Yap'}
            </button>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <p className="form-footer">
                Kodunuz ulaşmadı mı veya süresi mi doldu? <br/>
                <a href="#" onClick={(e) => { e.preventDefault(); handleSendCode(e); }} style={{ fontWeight: 'bold' }}>Tekrar Kod Gönder</a>
              </p>
              <p className="form-footer" style={{ marginTop: '10px' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setStep(2); setVerificationCode(''); setIsTimerActive(false); }}>Farklı bir yöntem seç</a>
              </p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default LoginPage;
