import React from 'react';

const CustomValidatedInput = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  maxLength,
  error,
  successMessage,
  hideMaxLengthAlert = false,
  style,
  as = 'input',
  children,
  ...props
}) => {
  const hasError = !!error;
  const isSuccess = !hasError && !!successMessage && value && value.length > 0;

  return (
    <div className="form-group" style={{ position: 'relative', marginBottom: '25px' }}>
      {label && <label htmlFor={id}>{label}</label>}
      {as === 'input' && (
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          style={{
            borderColor: hasError ? '#e74c3c' : isSuccess ? '#27ae60' : 'var(--border-color)',
            ...style
          }}
          {...props}
        />
      )}

      {as === 'textarea' && (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          style={{
            borderColor: hasError ? '#e74c3c' : isSuccess ? '#27ae60' : 'var(--border-color)',
            ...style
          }}
          {...props}
        />
      )}

      {as === 'select' && (
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          style={{
            borderColor: hasError ? '#e74c3c' : isSuccess ? '#27ae60' : 'var(--border-color)',
            ...style
          }}
          {...props}
        >
          {children}
        </select>
      )}
      
      {/* Hata Durumu (Error State) */}
      {hasError && (
        <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}

      {/* Başarı Durumu (Success State) */}
      {isSuccess && (
        <span style={{ color: '#27ae60', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          {successMessage}
        </span>
      )}

      {/* Karakter Sınırı Uyarısı */}
      {!hasError && !hideMaxLengthAlert && maxLength && value && value.length >= maxLength && (
        <span style={{ color: '#e74c3c', fontSize: '12px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>
          Maksimum karakter sınırına ulaşıldı.
        </span>
      )}
    </div>
  );
};

export default CustomValidatedInput;
