import React, { useState } from 'react';

const PasswordStrengthInput = ({
  label = "Şifre",
  id = "password",
  value,
  onChange,
  onBlur,
  placeholder = "Güçlü bir şifre oluşturun",
  required,
  maxLength = 20,
  error,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Kriterler
  const hasMinLength = value && value.length >= 8;
  const hasUpperCase = /[A-Z]/.test(value || '');
  const hasSpecialChar = /[.,?!@#$%^&*()_+=\-[\]{};':"\\|<>/]/.test(value || '');

  const isAllValid = hasMinLength && hasUpperCase && hasSpecialChar;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div className="form-group" style={{ position: 'relative', marginBottom: '25px' }}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        type="password"
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        style={{
          borderColor: error ? '#e74c3c' : (isAllValid ? '#27ae60' : 'var(--border-color)'),
          ...style
        }}
        {...props}
      />
      
      {/* Hata Durumu (Error State) */}
      {error && (
        <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}
      
      {/* Şifre Kriterleri Checklist */}
      <div style={{ marginTop: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ color: hasMinLength ? '#27ae60' : '#95a5a6', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.3s' }}>
          <span>{hasMinLength ? '✓' : '○'}</span>
          <span>En az 8 karakter</span>
        </div>
        <div style={{ color: hasUpperCase ? '#27ae60' : '#95a5a6', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.3s' }}>
          <span>{hasUpperCase ? '✓' : '○'}</span>
          <span>En az 1 büyük harf</span>
        </div>
        <div style={{ color: hasSpecialChar ? '#27ae60' : '#95a5a6', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.3s' }}>
          <span>{hasSpecialChar ? '✓' : '○'}</span>
          <span>En az 1 özel karakter (., ?, !, vb.)</span>
        </div>
      </div>

      {maxLength && value && value.length >= maxLength && (
        <span style={{ color: '#e74c3c', fontSize: '12px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>
          Maksimum karakter sınırına ({maxLength}) ulaştınız.
        </span>
      )}
    </div>
  );
};

export default PasswordStrengthInput;
