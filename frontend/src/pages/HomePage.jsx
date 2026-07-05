import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Api from '../api';
import TURKEY_LOCATIONS from '../data/locationData';
import { sanitizeInput } from '../utils/sanitize';

const HomePage = () => {
  const [memorials, setMemorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    firstName: '', lastName: '', city: '', district: '',
    occupation: '', gender: '', category: '', ageMin: '', ageMax: ''
  });
  const [liveResults, setLiveResults] = useState([]);
  const [showLiveSearch, setShowLiveSearch] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [districts, setDistricts] = useState([]);
  
  const searchTimeout = useRef(null);

  const fetchMemorials = useCallback(async (filters = {}) => {
    setLoading(true);
    const data = await Api.getMemorials(filters);
    if (data?.status === 200 && data.payload) {
      setMemorials(data.payload);
    } else {
      setMemorials([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMemorials();
  }, [fetchMemorials]);

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSearchParams(prev => ({ ...prev, city, district: '' }));
    setDistricts(city && TURKEY_LOCATIONS[city] ? TURKEY_LOCATIONS[city] : []);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMemorials(searchParams);
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
  };

  // Performance: Debounced live search
  const handleLiveSearch = (rawValue, field) => {
    const val = sanitizeInput(rawValue);
    setSearchParams(prev => ({ ...prev, [field]: val }));
    const q1 = field === 'firstName' ? val.trim() : searchParams.firstName.trim();
    const q2 = field === 'lastName' ? val.trim() : searchParams.lastName.trim();
    const query = `${q1} ${q2}`.trim();

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (query.length < 2) {
      setShowLiveSearch(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      const data = await Api.searchMemorials(query);
      if (data?.status === 200 && data.payload) {
        setLiveResults(data.payload);
      } else {
        setLiveResults([]);
      }
      setShowLiveSearch(true);
    }, 300);
  };

  // Close live search on clicks outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#search')) setShowLiveSearch(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filterByCategory = (cat) => {
    fetchMemorials({ category: cat });
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
  };

  // Added hasMemorial state
  const [hasMemorial, setHasMemorial] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (Api.isLoggedIn()) {
      Api.getMyMemorial().then(res => {
        if (res && res.status === 200 && res.payload) {
          setHasMemorial(true);
        }
      });
    }
  }, []);

  const handleQuickCreate = (e) => {
    e.preventDefault();

    if (Api.isLoggedIn()) {
      if (hasMemorial) {
        navigate('/dashboard');
      } else {
        navigate('/add-memorial');
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-forever">
        <div className="hero-forever-content">
          <div className="hero-text">
            <h1>Sevdiklerinizin Hikayesini Sonsuza Dek Yaşatın</h1>
            <p>Değerli anıları onurlandırmak, paylaşmak ve gelecek nesillere aktarmak için en güvenilir ve zarif dijital anıt platformu.</p>
            <div className="hero-cta-group">
              <a href="#how-it-works" className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.8)' }}>Nasıl Çalışır?</a>
            </div>
          </div>
          <div className="quick-create-card">
            <h2>Hemen Başlayın</h2>
            <form onSubmit={handleQuickCreate}>
              <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>Ücretsiz Anıt Oluştur</button>
            </form>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-light)', marginTop: '15px' }}>Kayıt olmak tamamen ücretsizdir.</p>
          </div>
        </div>
      </section>

      {/* SEARCH SECTION */}
      <section className="search-container-wrap" id="search">
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div className="search-bar-forever">
            <div className="search-field">
              <label>Ad</label>
              <input type="text" placeholder="Adı..." value={searchParams.firstName} onChange={(e) => handleLiveSearch(e.target.value, 'firstName')} autoComplete="off" maxLength={50} />
              {searchParams.firstName.length >= 50 && <span style={{ color: '#e74c3c', fontSize: '11px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Maksimum karakter sınırına ulaştınız.</span>}
              {/\d/.test(searchParams.firstName) && <span style={{ color: '#e74c3c', fontSize: '11px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Geçersiz ad</span>}
            </div>
            <div className="search-field">
              <label>Soyad</label>
              <input type="text" placeholder="Soyadı..." value={searchParams.lastName} onChange={(e) => handleLiveSearch(e.target.value, 'lastName')} autoComplete="off" maxLength={50} />
              {searchParams.lastName.length >= 50 && <span style={{ color: '#e74c3c', fontSize: '11px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Maksimum karakter sınırına ulaştınız.</span>}
              {/\d/.test(searchParams.lastName) && <span style={{ color: '#e74c3c', fontSize: '11px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Geçersiz soyad</span>}
            </div>
            <div className="search-field">
              <label>İl</label>
              <select value={searchParams.city} onChange={handleCityChange}>
                <option value="">Tüm Türkiye</option>
                {Object.keys(TURKEY_LOCATIONS).map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="search-field">
              <label>İlçe</label>
              <select value={searchParams.district} onChange={e => setSearchParams(prev => ({ ...prev, district: e.target.value }))}>
                <option value="">Tüm İlçeler</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="search-field" style={{ flex: 0.6, minWidth: '120px' }}>
              <button type="submit" className="btn" style={{ width: '100%', height: '50px', borderRadius: '10px', whiteSpace: 'nowrap' }}>Anıtı Bul</button>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowAdvanced(!showAdvanced); }} style={{ fontSize: '13px', color: 'var(--gold-accent)', textDecoration: 'none', fontWeight: 600 }}>▼ Detaylı Arama</a>
          </div>
          
          <div id="advanced-search-panel" style={{ display: showAdvanced ? 'block' : 'none', maxWidth: '1200px', margin: '20px auto', padding: '20px 40px', background: '#fdfdfd', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="search-field">
                <label>Meslek</label>
                <input type="text" placeholder="Örn: Mühendis" value={searchParams.occupation} onChange={e => setSearchParams(prev => ({...prev, occupation: sanitizeInput(e.target.value)}))} maxLength={80} />
                {searchParams.occupation.length >= 80 && <span style={{ color: '#e74c3c', fontSize: '11px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Maksimum karakter sınırına ulaştınız.</span>}
                {/\d/.test(searchParams.occupation) && <span style={{ color: '#e74c3c', fontSize: '11px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Geçersiz meslek</span>}
              </div>
              <div className="search-field"><label>Cinsiyet</label>
                <select value={searchParams.gender} onChange={e => setSearchParams(prev => ({...prev, gender: e.target.value}))}>
                  <option value="">Tümü</option><option value="male">Erkek</option><option value="female">Kadın</option>
                </select>
              </div>
              <div className="search-field"><label>Kategori</label>
                <select value={searchParams.category} onChange={e => setSearchParams(prev => ({...prev, category: e.target.value}))}>
                  <option value="">Tüm Kategoriler</option>
                  <option value="sehit">Şehitler</option><option value="kadin_cinayeti">Kadın Cinayetleri</option>
                  <option value="siyaset">Siyasiler</option><option value="hak_savunucusu">Hak Savunucuları</option>
                  <option value="egitim_sehitleri">Basın ve Eğitim Şehitleri</option><option value="kanser">Kanser Kurbanları</option>
                  <option value="salgin">Salgın Hastalıklar</option><option value="nadir_hastalik">Nadir Hastalıklar</option>
                  <option value="deprem">Deprem Kurbanları</option>
                </select>
              </div>
              <div className="search-field" style={{ minWidth: '280px' }}>
                <label>Yaş Aralığı (Min - Max)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '50%' }}>
                    <input type="number" placeholder="0" style={{ width: '100%' }} value={searchParams.ageMin} onChange={e => setSearchParams(prev => ({...prev, ageMin: e.target.value}))} maxLength={3} />
                    {searchParams.ageMin.length >= 3 && <span style={{ color: '#e74c3c', fontSize: '11px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Sınır aşıldı.</span>}
                  </div>
                  <div style={{ width: '50%' }}>
                    <input type="number" placeholder="100" style={{ width: '100%' }} value={searchParams.ageMax} onChange={e => setSearchParams(prev => ({...prev, ageMax: e.target.value}))} maxLength={3} />
                    {searchParams.ageMax.length >= 3 && <span style={{ color: '#e74c3c', fontSize: '11px', position: 'absolute', bottom: '-18px', left: '0', display: 'block' }}>Sınır aşıldı.</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LIVE SEARCH POPUP */}
          {showLiveSearch && (
            <div id="live-search-results" style={{ position: 'absolute', top: '90px', left: 0, width: '100%', background: 'white', borderRadius: '15px', boxShadow: '0 15px 40px rgba(0,0,0,0.15)', maxHeight: '400px', overflowY: 'auto', zIndex: 9999, padding: '15px', border: '1px solid #eee' }}>
              {liveResults.length === 0 ? (
                <div style={{ padding: '15px', textAlign: 'center', color: '#888' }}>Sonuç bulunamadı...</div>
              ) : (
                liveResults.map(item => (
                  <Link key={item.slug} to={`/profile?slug=${item.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', textDecoration: 'none', color: '#333', borderBottom: '1px solid #f0f0f0', borderRadius: '8px' }}>
                    <img src={item.image || 'https://images.unsplash.com/photo-1544813545-48272337f79c?w=400&q=80'} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                    <div><div style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.name}</div><div style={{ fontSize: '12px', color: '#888' }}>{item.dates}</div></div>
                  </Link>
                ))
              )}
            </div>
          )}
        </form>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-section" id="how-it-works">
        <div className="section-title"><h2>Adım Adım Dijital Miras</h2><p>Sevdikleriniz için anlamlı bir köprü kurmak sadece dakikalarınızı alır.</p></div>
        <div className="steps-grid">
          <div className="step-item"><div className="step-number">1</div><h3>Profil Oluşturun</h3><p>Hayat hikayesini, fotoğraflarını ve başarılarını içeren özel bir sayfa hazırlayın.</p></div>
          <div className="step-item"><div className="step-number">2</div><h3>Sevdiklerinizi Davet Edin</h3><p>Aileniz ve dostlarınızla paylaşın, onların da anılarını ve dualarını eklemelerine izin verin.</p></div>
          <div className="step-item"><div className="step-number">3</div><h3>Sonsuza Dek Yaşatın</h3><p>Bu dijital miras, güvenli sunucularımızda nesiller boyu korunur ve ulaşılabilir kalır.</p></div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="stats-bar">
        <div className="stats-grid">
          <div className="stat-item"><h4>120K+</h4><p>Aktif Aile</p></div>
          <div className="stat-item"><h4>450K+</h4><p>Oluşturulan Anıt</p></div>
          <div className="stat-item"><h4>2M+</h4><p>Aylık Ziyaretçi</p></div>
        </div>
      </section>

      {/* MEMORIAL RESULTS */}
      <section className="home-section" id="results">
        <div className="section-title"><h2 id="results-title">Sizden Öncekiler</h2></div>
        <div className="card-grid">
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-light)', fontStyle: 'italic', padding: '50px 0' }}>Yükleniyor...</div>
          ) : memorials.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-light)', fontStyle: 'italic', padding: '50px 0' }}>Henüz eşleşen bir anıt bulunamadı.</div>
          ) : (
            memorials.map(m => {
              let imgUrl = 'https://images.unsplash.com/photo-1544813545-48272337f79c?w=400&q=80';
              if (m.media && m.media.length > 0) {
                const img = m.media.find(x => x.fileType === 'image' && x.isApproved);
                if (img) imgUrl = '/uploads/' + img.filePath;
              }
              const bio = m.bio ? (m.bio.length > 80 ? m.bio.substring(0, 80) + '...' : m.bio) : '';
              const dates = (m.birthYear || '?') + ' - ' + (m.deathYear || 'Hayatta');
              
              return (
                <Link key={m.slug} to={`/profile?slug=${m.slug}`} className="arch-card">
                  <div className="arch-frame"><div className="arch-inner">
                    <img src={imgUrl} alt={m.name} className="arch-img" />
                  </div></div>
                  <h3>{m.name}</h3>
                  <div className="arch-dates">{dates}</div>
                  <p>{bio}</p>
                  <div className="btn btn-outline" style={{ padding: '8px 24px', borderRadius: '10px' }}>Ziyaret Et</div>
                </Link>
              );
            })
          )}
        </div>
      </section>

    </>
  );
};

export default HomePage;
