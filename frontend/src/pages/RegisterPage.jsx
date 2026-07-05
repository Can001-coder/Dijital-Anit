import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Api from '../api';
import { showFlash } from '../components/FlashMessage';
import { sanitizeInput } from '../utils/sanitize';
import { validatePhone, validateEmail } from '../utils/validation';
import CustomValidatedInput from '../components/CustomValidatedInput';
import PasswordStrengthInput from '../components/PasswordStrengthInput';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validation error states
  const [usernameError, setUsernameError] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const handlePhoneChange = (e) => {
    let raw = sanitizeInput(e.target.value).replace(/\D/g, '').slice(0, 10);
    if (raw.startsWith('0')) {
      raw = raw.substring(1); // İlk hane '0' ise at
    }
    setPhoneNumber(raw);
    if (raw.trim() !== '') setPhoneError(null);
  };

  const handlePhoneBlur = () => {
    if (phoneNumber.length > 0) {
      setPhoneError(validatePhone(phoneNumber));
    }
  };

  const handleEmailChange = (e) => {
    const val = sanitizeInput(e.target.value);
    setEmail(val);
    if (val.trim() !== '') setEmailError(null);
  };

  const handleEmailBlur = () => {
    if (email.length > 0) {
      setEmailError(validateEmail(email));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    let hasError = false;

    if (!username || username.trim() === '') {
      setUsernameError('Lütfen bu alanı doldurun.');
      hasError = true;
    } else if (/\d/.test(username)) {
      setUsernameError('Geçersiz kullanıcı adı');
      hasError = true;
    } else {
      setUsernameError(null);
    }

    if (!email || email.trim() === '') {
      setEmailError('Lütfen bu alanı doldurun.');
      hasError = true;
    } else {
      const eErr = validateEmail(email);
      setEmailError(eErr);
      if (eErr) hasError = true;
    }

    if (!phoneNumber || phoneNumber.trim() === '') {
      setPhoneError('Lütfen bu alanı doldurun.');
      hasError = true;
    } else {
      const pErr = validatePhone(phoneNumber);
      setPhoneError(pErr);
      if (pErr) hasError = true;
    }

    const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password) && /[.,?!@#$%^&*()_+=\-[\]{};':"\\|<>/]/.test(password);

    if (!password || password.trim() === '') {
      setPasswordError('Lütfen bu alanı doldurun.');
      hasError = true;
    } else if (!isPasswordValid) {
      setPasswordError('Lütfen şifre kurallarına uyunuz.');
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (hasError) {
      return;
    }

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
          <CustomValidatedInput
            label="Kullanıcı Adı"
            id="username"
            placeholder="Seçmek istediğiniz kullanıcı adı"
            value={username}
            onChange={e => {
              const val = sanitizeInput(e.target.value).replace(/\s/g, '');
              setUsername(val);
              if (/\d/.test(val)) {
                setUsernameError('Geçersiz kullanıcı adı');
              } else if (val.trim() !== '') {
                setUsernameError(null);
              }
            }}
            maxLength={20}
            error={usernameError}
            successMessage={username.length > 0 && !usernameError ? "✓ Geçerli kullanıcı adı" : null}
          />

          <CustomValidatedInput
            type="email"
            label="E-posta Adresi"
            id="email"
            placeholder="Doğrulama bağlantısı için gerekli"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            maxLength={100}
            error={emailError}
            successMessage={!emailError && email.length > 0 ? "✓ Geçerli e-posta adresi" : null}
          />

          <CustomValidatedInput
            type="tel"
            label="Telefon Numarası"
            id="phoneNumber"
            placeholder="5XX XXX XX XX"
            value={phoneNumber}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            maxLength={10}
            error={phoneError}
            successMessage={!phoneError && phoneNumber.length === 10 ? "✓ Geçerli telefon numarası" : null}
            hideMaxLengthAlert={true}
          />

          <PasswordStrengthInput
            label="Şifre"
            id="password"
            placeholder="Güçlü bir şifre oluşturun"
            value={password}
            onChange={e => {
              setPassword(sanitizeInput(e.target.value));
              if (e.target.value.trim() !== '') setPasswordError(null);
            }}
            maxLength={20}
            error={passwordError}
          />
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
