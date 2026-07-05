import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sanitizeInput } from '../utils/sanitize';
import { validateEmail } from '../utils/validation';
import { showFlash } from '../components/FlashMessage';
import CustomValidatedInput from '../components/CustomValidatedInput';
import PasswordStrengthInput from '../components/PasswordStrengthInput';
import Api from '../api';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  
  // Step 2 & 3 states
  const [selectedMethod, setSelectedMethod] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState(null);
  
  // Backend states
  const [resetToken, setResetToken] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  
  // Step 4 states
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(180);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!email || email.trim() === '') {
      setEmailError('Lütfen bu alanı doldurun.');
      return;
    }
    const eErr = validateEmail(email);
    if (eErr) {
      setEmailError(eErr);
      return;
    }
    
    setLoading(true);
    const result = await Api.forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setResetToken(result.payload.resetToken);
      setMaskedEmail(result.payload.maskedEmail || '');
      setMaskedPhone(result.payload.maskedPhone || '');
      setStep(2);
    } else {
      showFlash(result.error || 'İşlem gerçekleştirilemedi.', 'error');
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!selectedMethod) {
      showFlash('Lütfen bir doğrulama yöntemi seçin.', 'error');
      return;
    }

    setLoading(true);
    const result = await Api.sendResetCode(resetToken, selectedMethod);
    setLoading(false);

    if (result.success) {
      showFlash(selectedMethod === 'SMS' ? 'Doğrulama kodu SMS olarak gönderildi.' : 'Doğrulama kodu e-posta adresinize gönderildi.', 'success');
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
    const result = await Api.verifyResetCode(resetToken, verificationCode);
    setLoading(false);

    if (result.success) {
      setStep(4);
    } else {
      setCodeError(result.error || 'Girdiğiniz doğrulama kodu hatalı.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const isPasswordValid = newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[.,?!@#$%^&*()_+=\-[\]{};':"\\|<>/]/.test(newPassword);
    
    if (!newPassword || newPassword.trim() === '') {
      setPasswordError('Lütfen bu alanı doldurun.');
      return;
    } else if (!isPasswordValid) {
      setPasswordError('Lütfen şifre kurallarına uyunuz.');
      return;
    } else {
      setPasswordError(null);
    }

    setLoading(true);
    const result = await Api.resetPassword(resetToken, newPassword);
    setLoading(false);

    if (result.success) {
      showFlash('Şifreniz başarıyla güncellendi.', 'success');
      navigate('/login');
    } else {
      showFlash(result.error || 'Şifre güncellenemedi.', 'error');
    }
  };

  return (
    <div className="form-container">
      <div className="auth-header"><h2>Şifremi Unuttum</h2></div>
      <div className="auth-body">
        
        {step === 1 && (
          <form onSubmit={handleStep1Submit} noValidate>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#5D705D', fontSize: '15px' }}>
              Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin.
            </p>
            <CustomValidatedInput
              type="email"
              label="E-posta Adresi"
              id="email"
              placeholder="Kayıtlı e-posta adresiniz"
              value={email}
              onChange={e => {
                const val = sanitizeInput(e.target.value);
                setEmail(val);
                if (val.trim() !== '') setEmailError(null);
              }}
              onBlur={() => {
                if (email.length > 0) setEmailError(validateEmail(email));
              }}
              maxLength={100}
              error={emailError}
              successMessage={!emailError && email.length > 0 ? "✓ Geçerli e-posta adresi" : null}
            />
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Sorgulanıyor...' : 'Devam Et'}
            </button>
            <p className="form-footer" style={{ marginTop: '15px' }}>
              <Link to="/login">Giriş Yap</Link> sayfasına dön
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSendCode}>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#5D705D', fontSize: '15px' }}>
              Şifre sıfırlama kodunu nereye gönderelim?
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
              Lütfen size gönderilen 6 haneli şifre sıfırlama kodunu girin.
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
              {loading ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
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

        {step === 4 && (
          <form onSubmit={handleResetPassword} noValidate>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#5D705D', fontSize: '15px' }}>
              Doğrulama başarılı! Lütfen yeni şifrenizi belirleyin.
            </p>
            <PasswordStrengthInput
              label="Yeni Şifre"
              id="newPassword"
              placeholder="Güçlü bir şifre oluşturun"
              value={newPassword}
              onChange={e => {
                setNewPassword(sanitizeInput(e.target.value));
                if (e.target.value.trim() !== '') setPasswordError(null);
              }}
              maxLength={20}
              error={passwordError}
            />
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
