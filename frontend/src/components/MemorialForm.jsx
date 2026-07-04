import React, { useState, useCallback } from 'react';
import Api from '../api';
import { showFlash } from '../components/FlashMessage';

/**
 * MemorialForm — Şehitler Kategorisi Anıt Ekleme / Ziyaretçi Defteri Formu
 * 
 * Güvenlik Özellikleri:
 * - dangerouslySetInnerHTML ASLA kullanılmaz
 * - Tüm veriler güvenli {} süslü parantez ile render edilir
 * - maxLength sınırları: isim (50), açıklama (1500)
 * - Gerçek zamanlı karakter sayacı (son 50 karakterde uyarı rengi)
 * 
 * UI Tasarımı:
 * - 1440px viewport baz alınarak optimize edilmiştir
 * - Antigravity teması: yarı saydam koyu bg, beyaz yazılar, altın sarısı focus
 */

const STYLES = {
  /* ── Container: 1440px viewport baz alınarak optimize ── */
  wrapper: {
    maxWidth: '960px',
    width: '100%',
    margin: '60px auto',
    padding: '0 40px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  /* ── Kart: Karanlık, yarı saydam Antigravity teması ── */
  card: {
    background: 'linear-gradient(145deg, rgba(20, 20, 25, 0.95), rgba(30, 30, 38, 0.92))',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    padding: '48px',
    boxShadow: '0 32px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  },

  /* ── Başlık ── */
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '32px',
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },

  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: '40px',
    letterSpacing: '0.5px',
  },

  /* ── Ayırıcı çizgi ── */
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 0 40px 0',
    gap: '12px',
  },

  dividerLine: {
    width: '60px',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.6), transparent)',
  },

  dividerIcon: {
    color: '#D4AF37',
    fontSize: '16px',
  },

  /* ── Form alanı label ── */
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
  },

  /* ── Input: Antigravity teması ── */
  input: {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '15px',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    boxSizing: 'border-box',
  },

  /* ── Textarea: Antigravity teması ── */
  textarea: {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '15px',
    fontFamily: "'Inter', sans-serif",
    lineHeight: '1.7',
    resize: 'vertical',
    minHeight: '160px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    boxSizing: 'border-box',
  },

  /* ── Form grubu ── */
  formGroup: {
    marginBottom: '28px',
    position: 'relative',
  },

  /* ── İki kolonlu grid (1440px'e göre) ── */
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '28px',
  },

  /* ── Karakter sayacı container ── */
  charCounterWrapper: {
    position: 'relative',
  },

  /* ── Karakter sayacı (textarea sağ alt) ── */
  charCounter: (current, max) => ({
    position: 'absolute',
    bottom: '12px',
    right: '14px',
    fontSize: '12px',
    fontWeight: '500',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    color: current >= max - 50
      ? (current >= max - 20 ? '#FF6B6B' : '#D4AF37')
      : 'rgba(255, 255, 255, 0.3)',
    transition: 'color 0.3s ease',
    pointerEvents: 'none',
    userSelect: 'none',
    letterSpacing: '0.5px',
  }),

  /* ── Gönder butonu ── */
  submitBtn: {
    width: '100%',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
    border: 'none',
    borderRadius: '14px',
    color: '#1a1a1a',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    boxShadow: '0 8px 32px rgba(212, 175, 55, 0.25)',
    marginTop: '12px',
  },

  submitBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },

  /* ── Başarı mesajı ── */
  successMsg: {
    textAlign: 'center',
    padding: '40px 20px',
  },

  successIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    display: 'block',
  },

  successTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '24px',
    color: '#D4AF37',
    marginBottom: '12px',
  },

  successText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: '1.6',
  },

  /* ── Hata mesajı (inline) ── */
  fieldError: {
    fontSize: '12px',
    color: '#FF6B6B',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  /* ── Kategori badge ── */
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    borderRadius: '20px',
    color: '#D4AF37',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '32px',
    textAlign: 'center',
  },

  badgeCenter: {
    display: 'flex',
    justifyContent: 'center',
  },
};

// ── Focus stili: Altın sarısı çerçeve parlaması ──
const focusStyle = {
  borderColor: '#D4AF37',
  boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.15), 0 0 20px rgba(212, 175, 55, 0.08)',
};

const MemorialForm = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const MAX_NAME = 50;
  const MAX_BIO = 1500;
  const MIN_BIO = 10;

  // ── Güvenli değişiklik yöneticisi (maxLength ile sınırlandırılmış) ──
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // ── Frontend doğrulaması ──
  const validate = () => {
    const newErrors = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = 'Ad alanı zorunludur';
    } else if (form.firstName.trim().length > MAX_NAME) {
      newErrors.firstName = `Ad en fazla ${MAX_NAME} karakter olabilir`;
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Soyad alanı zorunludur';
    } else if (form.lastName.trim().length > MAX_NAME) {
      newErrors.lastName = `Soyad en fazla ${MAX_NAME} karakter olabilir`;
    }

    if (!form.bio.trim()) {
      newErrors.bio = 'Açıklama alanı zorunludur';
    } else if (form.bio.trim().length < MIN_BIO) {
      newErrors.bio = `Açıklama en az ${MIN_BIO} karakter olmalıdır`;
    } else if (form.bio.trim().length > MAX_BIO) {
      newErrors.bio = `Açıklama en fazla ${MAX_BIO} karakter olabilir`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Form gönderimi ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        bio: form.bio.trim(),
        category: 'sehit', // Şehitler kategorisi sabit
      };

      const res = await Api.saveMemorial(payload);
      if (res?.status === 200) {
        setSubmitted(true);
        showFlash('Anıt başarıyla kaydedildi!', 'success');
      } else {
        const errorMsg = res?.errorMessage || 'Kayıt sırasında bir hata oluştu.';
        showFlash(errorMsg, 'error');
      }
    } catch (err) {
      showFlash('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Input stili helper (focus kontrolü dahil) ──
  const getInputStyle = (fieldName, isTextarea = false) => {
    const base = isTextarea ? { ...STYLES.textarea } : { ...STYLES.input };
    if (focusedField === fieldName) {
      Object.assign(base, focusStyle);
    }
    if (errors[fieldName]) {
      base.borderColor = '#FF6B6B';
      base.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)';
    }
    return base;
  };

  // ── Başarı ekranı ──
  if (submitted) {
    return (
      <div style={STYLES.wrapper}>
        <div style={STYLES.card}>
          <div style={STYLES.successMsg}>
            <span style={STYLES.successIcon}>🕊️</span>
            <h2 style={STYLES.successTitle}>Anıt Başarıyla Kaydedildi</h2>
            <p style={STYLES.successText}>
              Şehidimizin hatırası dijital dünyada yaşamaya devam edecek.
              <br />
              Anıtınız admin onayından sonra yayına alınacaktır.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={STYLES.wrapper} id="memorial-form-wrapper">
      <div style={STYLES.card}>

        {/* ── Başlık ── */}
        <h1 style={STYLES.title}>Şehit Anıtı Oluştur</h1>
        <p style={STYLES.subtitle}>
          Kahraman şehidimizin hatırasını dijital dünyada ölümsüzleştirin
        </p>

        {/* ── Altın çizgi ayırıcı ── */}
        <div style={STYLES.divider}>
          <div style={STYLES.dividerLine} />
          <span style={STYLES.dividerIcon}>✦</span>
          <div style={STYLES.dividerLine} />
        </div>

        {/* ── Kategori Badge ── */}
        <div style={STYLES.badgeCenter}>
          <span style={STYLES.categoryBadge}>
            🎖️ Şehitler Kategorisi
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Ad & Soyad (iki kolonlu grid) ── */}
          <div style={STYLES.grid2}>
            {/* Ad */}
            <div style={STYLES.formGroup}>
              <label style={STYLES.label} htmlFor="memorial-firstName">
                Ad *
              </label>
              <input
                id="memorial-firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
                maxLength={MAX_NAME}
                placeholder="Şehidin adı"
                style={getInputStyle('firstName')}
                autoComplete="off"
                required
              />
              {errors.firstName && (
                <div style={STYLES.fieldError}>⚠ {errors.firstName}</div>
              )}
            </div>

            {/* Soyad */}
            <div style={STYLES.formGroup}>
              <label style={STYLES.label} htmlFor="memorial-lastName">
                Soyad *
              </label>
              <input
                id="memorial-lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
                maxLength={MAX_NAME}
                placeholder="Şehidin soyadı"
                style={getInputStyle('lastName')}
                autoComplete="off"
                required
              />
              {errors.lastName && (
                <div style={STYLES.fieldError}>⚠ {errors.lastName}</div>
              )}
            </div>
          </div>

          {/* ── Açıklama / Biyografi ── */}
          <div style={STYLES.formGroup}>
            <label style={STYLES.label} htmlFor="memorial-bio">
              Açıklama / Hayat Hikayesi *
            </label>
            <div style={STYLES.charCounterWrapper}>
              <textarea
                id="memorial-bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                onFocus={() => setFocusedField('bio')}
                onBlur={() => setFocusedField(null)}
                maxLength={MAX_BIO}
                placeholder="Şehidimizin hayat hikayesi, kahramanlığı ve bıraktığı iz..."
                style={{
                  ...getInputStyle('bio', true),
                  paddingBottom: '36px',
                }}
                required
              />
              {/* ── Gerçek zamanlı karakter sayacı ── */}
              <span style={STYLES.charCounter(form.bio.length, MAX_BIO)}>
                {form.bio.length}/{MAX_BIO}
              </span>
            </div>
            {errors.bio && (
              <div style={STYLES.fieldError}>⚠ {errors.bio}</div>
            )}
          </div>

          {/* ── Gönder Butonu ── */}
          <button
            type="submit"
            id="memorial-submit-btn"
            disabled={submitting}
            style={{
              ...STYLES.submitBtn,
              ...(submitting ? STYLES.submitBtnDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 40px rgba(212, 175, 55, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(212, 175, 55, 0.25)';
            }}
          >
            {submitting ? '⏳ Kaydediliyor...' : '🕊️ Anıtı Oluştur ve Onaya Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MemorialForm;
