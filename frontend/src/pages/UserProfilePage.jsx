import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Api from '../api';
import { showFlash } from '../components/FlashMessage';
import { validatePhone, validateEmail } from '../utils/validation';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null); // Değişiklik tespiti için orijinal veriler
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Validasyon hata state'leri
  const [emailError, setEmailError] = useState(null);
  const [phoneError, setPhoneError] = useState(null);



  useEffect(() => {
    if (!Api.isLoggedIn()) {
      navigate('/login');
      return;
    }

    const currentUser = Api.getCurrentUser();
    setUser(currentUser);

    const loadData = async () => {
      try {
        const res = await Api.getMyMemorial();
        if (res && res.status === 200 && res.payload) {
          setMemorial(res.payload);
        }

        const settingsRes = await Api.getUserSettings();
        if (settingsRes && settingsRes.status === 200 && settingsRes.payload) {
          setUser(settingsRes.payload);
          setOriginalUser(settingsRes.payload);
        }
      } catch (e) {
        console.error('Error fetching profile data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const toggleAnniversaryMail = async () => {
    if (!user) return;
    const nextState = !user.anniversaryNotificationsEnabled;
    setUpdatingSettings(true);
    try {
      const res = await Api.updateUserSettings(nextState);
      if (res && res.status === 200 && res.payload) {
        setUser(res.payload);
        showFlash('Bildirim tercihiniz başarıyla güncellendi.', 'success');
      } else {
        showFlash(res?.errorMessage || 'Tercih güncellenirken bir hata oluştu.', 'error');
      }
    } catch (e) {
      showFlash('Bağlantı hatası: Tercih güncellenemedi.', 'error');
      console.error(e);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleDeleteMemorial = async () => {
    try {
      const res = await Api.deleteMyMemorial();
      if (res && res.status === 200) {
        showFlash('Anıt başarıyla silindi.', 'success');
        setMemorial(null);
      } else {
        showFlash(res?.errorMessage || 'Anıt silinemedi.', 'error');
      }
    } catch (e) {
      showFlash('Bağlantı hatası: Anıt silinemedi.', 'error');
      console.error(e);
    } finally {
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-light)' }}>Profil yükleniyor...</div>;
  }

  // Helper for status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span style={{ background: '#E2EFCB', color: '#556B2F', padding: '6px 12px', borderRadius: '15px', fontSize: '13px', fontWeight: '600' }}>Yayında (Onaylandı)</span>;
      case 'PENDING':
        return <span style={{ background: '#FFF3CD', color: '#856404', padding: '6px 12px', borderRadius: '15px', fontSize: '13px', fontWeight: '600' }}>Onay Bekliyor</span>;
      case 'REJECTED':
        return <span style={{ background: '#F8D7DA', color: '#721C24', padding: '6px 12px', borderRadius: '15px', fontSize: '13px', fontWeight: '600' }}>Reddedildi</span>;
      default:
        return <span style={{ background: '#E2E3E5', color: '#383D41', padding: '6px 12px', borderRadius: '15px', fontSize: '13px', fontWeight: '600' }}>Bilinmiyor</span>;
    }
  };

  // ── E-posta validasyonu ──
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setUser({ ...user, email: val });
    if (val.length > 0) {
      setEmailError(validateEmail(val));
    } else {
      setEmailError(null);
    }

  };

  const handleEmailBlur = () => {
    if (user?.email) {
      setEmailError(validateEmail(user.email));
    }
  };

  // ── Telefon validasyonu ──
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setUser({ ...user, phoneNumber: raw });
    if (raw.length > 0) {
      setPhoneError(validatePhone(raw));
    } else {
      setPhoneError(null);
    }

  };

  const handlePhoneBlur = () => {
    if (user?.phoneNumber && user.phoneNumber.length > 0) {
      setPhoneError(validatePhone(user.phoneNumber));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validasyon kontrolleri
    const eErr = user?.email ? validateEmail(user.email) : null;
    const pErr = user?.phoneNumber ? validatePhone(user.phoneNumber) : null;
    setEmailError(eErr);
    setPhoneError(pErr);

    if (eErr || pErr) {
      showFlash('Lütfen formdaki hataları düzeltin.', 'error');
      return;
    }

    setUpdatingSettings(true);
    try {
      const res = await Api.updateUserProfile(user.email, user.phoneNumber);
      if (res && res.status === 200 && res.payload) {
        setUser(res.payload);
        setOriginalUser(res.payload);
        showFlash('Kişisel bilgileriniz başarıyla güncellendi.', 'success');
      } else {
        const errMsg = res?.errorMessage || '';
        showFlash(errMsg || 'Güncellenirken bir hata oluştu.', 'error');
      }
    } catch (e) {
      showFlash('Bağlantı hatası.', 'error');
    } finally {
      setUpdatingSettings(false);
    }
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '40px auto',
      padding: '0 20px',
      fontFamily: "'Lora', serif",
      color: '#353834'
    }}>
      {/* Profil Başlığı */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid #DDE2DB',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(93, 112, 93, 0.05)',
        marginBottom: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        backgroundImage: 'linear-gradient(135deg, rgba(194, 182, 157, 0.05) 0%, transparent 100%)'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: '#5D705D',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif'
        }}>
          {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#5D705D' }}>
            Merhaba, {user?.username}
          </h2>
          <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '14px' }}>Hesap Sahibi</p>
        </div>
      </div>

      {/* Kişisel Bilgiler Paneli */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid #DDE2DB',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(93, 112, 93, 0.05)',
        marginBottom: '30px'
      }}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '22px',
          color: '#5D705D',
          marginTop: 0,
          marginBottom: '20px',
          borderBottom: '1px solid #DDE2DB',
          paddingBottom: '15px'
        }}>
          Kişisel Bilgiler
        </h3>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#5D705D' }}>E-Posta Adresi</label>
              <input
                type="email"
                value={user?.email || ''}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px',
                  border: emailError ? '1px solid #e74c3c' : '1px solid #DDE2DB',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                required
              />
              {emailError && <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>{emailError}</span>}
              {!emailError && user?.email && user.email.length > 0 && <span style={{ color: '#27ae60', fontSize: '12px', marginTop: '4px', display: 'block' }}>✓ Geçerli e-posta</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#5D705D' }}>Telefon Numarası</label>
              <input
                type="tel"
                value={user?.phoneNumber || ''}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                placeholder="5XX XXX XX XX"
                maxLength={10}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px',
                  border: phoneError ? '1px solid #e74c3c' : '1px solid #DDE2DB',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              {phoneError && <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>{phoneError}</span>}
              {!phoneError && user?.phoneNumber && user.phoneNumber.length === 10 && <span style={{ color: '#27ae60', fontSize: '12px', marginTop: '4px', display: 'block' }}>✓ Geçerli telefon numarası</span>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={updatingSettings}
              style={{
                background: '#5D705D', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '8px',
                fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s',
                opacity: updatingSettings ? 0.6 : 1
              }}
            >
              {updatingSettings ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>

      {/* E-Posta Bildirim Ayarları */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid #DDE2DB',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(93, 112, 93, 0.05)',
        marginBottom: '30px',
        backgroundImage: 'linear-gradient(135deg, rgba(93, 112, 93, 0.02) 0%, transparent 100%)'
      }}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '22px',
          color: '#5D705D',
          marginTop: 0,
          marginBottom: '15px',
          borderBottom: '1px solid #DDE2DB',
          paddingBottom: '15px'
        }}>
          E-Posta Bildirim Ayarları
        </h3>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: '600', fontSize: '16px', color: '#353834' }}>
              Yıl Dönümü Hatırlatma Maili
            </p>
            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.5' }}>
              Oluşturduğunuz anıtların vefat yıl dönümlerinden 1 gün önce e-posta adresinize ({user?.email || 'kayıtlı e-postanız'}) otomatik anma hatırlatma maili almak ister misiniz?
            </p>
          </div>
          <div>
            <button
              onClick={toggleAnniversaryMail}
              disabled={updatingSettings}
              style={{
                background: user?.anniversaryNotificationsEnabled ? '#5D705D' : 'transparent',
                color: user?.anniversaryNotificationsEnabled ? '#ffffff' : '#5D705D',
                border: '2px solid #5D705D',
                padding: '12px 24px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: user?.anniversaryNotificationsEnabled ? '0 4px 10px rgba(93, 112, 93, 0.2)' : 'none',
                outline: 'none'
              }}
            >
              {user?.anniversaryNotificationsEnabled ? '✓ Evet, mail almak istiyorum' : '○ Hayır, mail almak istemiyorum'}
            </button>
          </div>
        </div>
      </div>

      {/* Eklenen Anıtlar Bölümü */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid #DDE2DB',
        borderRadius: '16px',
        padding: '35px',
        boxShadow: '0 10px 30px rgba(93, 112, 93, 0.05)'
      }}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '22px',
          color: '#5D705D',
          marginTop: 0,
          marginBottom: '25px',
          borderBottom: '1px solid #DDE2DB',
          paddingBottom: '15px'
        }}>
          Eklediğim Anıtlar
        </h3>

        {memorial ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr auto',
              alignItems: 'center',
              gap: '20px',
              padding: '20px',
              background: '#F7F8F6',
              border: '1px solid #DDE2DB',
              borderRadius: '12px'
            }}>
              {/* Resim */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#ddd'
              }}>
                <img
                  src={
                    memorial.media?.find(m => m.fileType === 'image')?.filePath
                      ? `/uploads/${memorial.media.find(m => m.fileType === 'image').filePath}`
                      : 'https://images.unsplash.com/photo-1544813545-48272337f79c?w=150&q=80'
                  }
                  alt={memorial.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Bilgiler */}
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#353834' }}>
                  {memorial.name}
                </h4>
                <p style={{ margin: '0 0 8px 0', color: 'var(--text-light)', fontSize: '13.5px' }}>
                  {memorial.birthYear || '?'} - {memorial.deathYear || 'Hayatta'}
                </p>
                <div>{getStatusBadge(memorial.status)}</div>
              </div>

              {/* İşlemler */}
              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                {memorial.status === 'APPROVED' && (
                  <Link
                    to={`/profile?slug=${memorial.slug}`}
                    className="btn btn-outline"
                    style={{
                      textDecoration: 'none',
                      display: 'inline-block',
                      background: 'transparent',
                      color: '#5D705D',
                      border: '1px solid #5D705D',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}
                  >
                    Görüntüle
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className="btn"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-block',
                    background: '#6B705C',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'center'
                  }}
                >
                  Düzenle
                </Link>

                <button
                  className="btn btn-danger"
                  onClick={() => setDeleteModalOpen(true)}
                  style={{
                    padding: '10px 15px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Anıtı Sil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-light)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🕯️</div>
            <p style={{ margin: '0 0 20px 0', fontSize: '16px' }}>Henüz sistemde oluşturulmuş bir anıtınız bulunmuyor.</p>
            <Link
              to="/add-memorial"
              className="btn"
              style={{
                textDecoration: 'none',
                display: 'inline-block',
                background: '#5D705D',
                color: 'white',
                padding: '12px 25px',
                borderRadius: '8px',
                fontWeight: '600'
              }}
            >
              Hemen Anıt Oluştur
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
        }}>
          <div style={{
            background: '#fff', color: '#333',
            padding: '40px 50px', borderRadius: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            textAlign: 'center', maxWidth: '400px', width: '90%',
            border: '1px solid #e74c3c'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>⚠️</div>
            <h3 style={{ marginBottom: '15px', fontFamily: '"Playfair Display", serif', fontSize: '22px', color: '#e74c3c' }}>Anıtı Kaldırmak İstiyor Musunuz?</h3>
            <p style={{ marginBottom: '30px', fontSize: '15px', color: '#666', lineHeight: 1.6 }}>
              Bu işlem geri alınamaz. Anıtınız ve ilgili tüm veriler kalıcı olarak silinecektir. Silmek istediğinize emin misiniz?
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{ flex: 1, padding: '12px', fontSize: '16px', borderRadius: '8px', background: '#ccc', color: '#333', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Hayır, İptal
              </button>
              <button
                onClick={handleDeleteMemorial}
                style={{ flex: 1, padding: '12px', fontSize: '16px', borderRadius: '8px', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
