/**
 * Dijital Anıt — Frontend Validasyon Kuralları
 * 
 * Bu modül, React formlarında kullanılacak validasyon fonksiyonlarını içerir.
 * Backend'deki regex kurallarıyla birebir uyumludur (Dual-Layer Validation).
 * 
 * Telefon: Başında 0 olmadan 10 haneli (5XXXXXXXXX)
 * Email: RFC uyumlu format
 * OTP: 6 haneli rakam
 */

// ── TELEFON NUMARASI ──
// Regex: ^[1-9][0-9]{9}$ — İlk hane 0 olamaz, toplam 10 hane
const PHONE_REGEX = /^[1-9][0-9]{9}$/;

export const validatePhone = (value) => {
  if (!value || value.trim() === '') return null; // Opsiyonel alan ise null dön
  
  // Başında 0 ile başlıyorsa özel hata mesajı
  if (value.startsWith('0')) {
    return 'Telefon numarasını başında 0 olmadan giriniz (Örn: 5551234567)';
  }
  
  if (!/^\d+$/.test(value)) {
    return 'Telefon numarası sadece rakamlardan oluşmalıdır';
  }
  
  if (value.length !== 10) {
    return 'Geçersiz telefon numarası';
  }
  
  if (!PHONE_REGEX.test(value)) {
    return 'Geçersiz telefon numarası';
  }
  
  return null; // Geçerli
};

// ── E-POSTA ──
// Sadece @gmail.com uzantılı e-posta adreslerine izin verilir
const GMAIL_REGEX = /^[a-zA-Z0-9.]+@gmail\.com$/;

export const validateEmail = (value) => {
  if (!value || value.trim() === '') return 'E-posta adresi zorunludur';
  
  if (!GMAIL_REGEX.test(value)) {
    return 'Geçerli bir e-posta adresi giriniz';
  }
  
  return null; // Geçerli
};

// ── OTP KODU ──
const OTP_REGEX = /^[0-9]{6}$/;

export const validateOtpCode = (value) => {
  if (!value || value.trim() === '') return 'Doğrulama kodu zorunludur';
  
  if (!OTP_REGEX.test(value)) {
    return 'Doğrulama kodu 6 haneli rakamdan oluşmalıdır';
  }
  
  return null; // Geçerli
};

// ── TELEFON MASKELEME ──
// Ham format (5551234567) → Görüntüleme formatı (555 123 45 67)
export const formatPhoneDisplay = (raw) => {
  if (!raw || raw.length !== 10) return raw;
  return `${raw.slice(0,3)} ${raw.slice(3,6)} ${raw.slice(6,8)} ${raw.slice(8,10)}`;
};

// Maskelemiş formattan ham formata (555 123 45 67 → 5551234567)
export const stripPhoneMask = (masked) => {
  if (!masked) return '';
  return masked.replace(/\D/g, '').slice(0, 10);
};
