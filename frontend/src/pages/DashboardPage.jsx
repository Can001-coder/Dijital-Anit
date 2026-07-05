import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import Api from '../api';
import { showFlash } from '../components/FlashMessage';
import citiesData from '../data/cities.json';
import { sanitizeInput } from '../utils/sanitize';
import CustomValidatedInput from '../components/CustomValidatedInput';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const total = 6;
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });
  const [timelineYear, setTimelineYear] = useState('');
  const [timelineEvent, setTimelineEvent] = useState('');
  const [workYear, setWorkYear] = useState('');
  const [workName, setWorkName] = useState('');
  const [physicalType, setPhysicalType] = useState('Saç Rengi');
  const [physicalValue, setPhysicalValue] = useState('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');

  const physicalOptions = {
    'Saç Rengi': ['Siyah', 'Kahverengi', 'Kumral', 'Sarı', 'Kızıl', 'Beyaz', 'Gri', 'Kel'],
    'Göz Rengi': ['Kahverengi', 'Ela', 'Yeşil', 'Mavi', 'Siyah', 'Kehribar'],
    'Ten Rengi': ['Açık', 'Buğday', 'Esmer', 'Siyahi'],
    'Kan Grubu': ['A RH+', 'A RH-', 'B RH+', 'B RH-', 'AB RH+', 'AB RH-', '0 RH+', '0 RH-'],
    'Vücut Yapısı': ['Zayıf', 'Normal', 'Balık Etli', 'İri Yarı', 'Kaslı'],
    'Yüz Şekli': ['Yuvarlak', 'Oval', 'Kare', 'Kalp', 'Uzun'],
    'Giyim Tarzı': ['Klasik', 'Spor', 'Rahat', 'Vintage', 'Şık', 'Sade', 'Resmi'],
    'Boy': [],
    'Kilo': [],
    'Diğer': []
  };

  const [formErrors, setFormErrors] = useState({});

  const validateStep = (currentStep) => {
    let isValid = true;
    const errors = {};

    if (currentStep === 1) {
      if (!form.firstName?.trim()) { errors.firstName = 'Lütfen bu alanı doldurun.'; isValid = false; }
      if (!form.lastName?.trim()) { errors.lastName = 'Lütfen bu alanı doldurun.'; isValid = false; }
      if (!form.bio?.trim()) { errors.bio = 'Lütfen bu alanı doldurun.'; isValid = false; }
      if (!form.birthDate) { errors.birthDate = 'Lütfen bu alanı doldurun.'; isValid = false; }
      else if (new Date(form.birthDate) > new Date()) { errors.birthDate = 'Geçersiz tarih'; isValid = false; }
      if (!form.deathDate) { errors.deathDate = 'Lütfen bu alanı doldurun.'; isValid = false; }
      else if (new Date(form.deathDate) > new Date()) { errors.deathDate = 'Geçersiz tarih'; isValid = false; }
    }
    if (currentStep === 2) {
      if (!form.traits?.trim()) { errors.traits = 'Lütfen bu alanı doldurun.'; isValid = false; }
      if (!form.langAna?.trim()) { errors.langAna = 'Lütfen bu alanı doldurun.'; isValid = false; }
    }
    if (currentStep === 4) {
      if (!form.city?.trim()) { errors.city = 'Lütfen bu alanı doldurun.'; isValid = false; }
      if (!form.district?.trim()) { errors.district = 'Lütfen bu alanı doldurun.'; isValid = false; }
      if (!form.occupation?.trim()) { errors.occupation = 'Lütfen bu alanı doldurun.'; isValid = false; }
      if (!form.gender?.trim()) { errors.gender = 'Lütfen bu alanı doldurun.'; isValid = false; }
      if (!form.deathCause?.trim()) { errors.deathCause = 'Lütfen bu alanı doldurun.'; isValid = false; }
      if (!form.graveLocation?.trim()) { errors.graveLocation = 'Lütfen bu alanı doldurun.'; isValid = false; }
    }

    setFormErrors(errors);
    return isValid;
  };

  // Form State Definitions
  const [form, setForm] = useState({
    firstName: '', lastName: '', subtitle: '', bio: '', quote: '',
    birthDate: '', deathDate: '', traits: '', langAna: '', langUzmanlik: '',
    makesLaugh: '', makesCry: '', physical: '', happiestMemory: '', biggestFear: '', will: '',
    aiVoiceActive: false, arEnabled: false, autoAnniversarySms: false,
    category: '', city: '', district: '', occupation: '', gender: '', deathCause: '',
    graveLocation: '', graveWill: '', works: '', timeline: '', flower: '', scent: '',
    food: '', sports: '', movies: '', museums: '', lat: null, lng: null
  });

  const [mediaStatus, setMediaStatus] = useState({ profile: '', gallery: '' });

  useEffect(() => {
    if (!Api.isLoggedIn()) {
      navigate('/login');
      return;
    }

    const loadExisting = async () => {
      const d = await Api.getMyMemorial();
      if (!d || d.status !== 200 || !d.payload) return;
      const m = d.payload;
      let ex = {};
      try { ex = JSON.parse(m.extraData || '{}'); } catch (e) { }

      setForm(prev => ({
        ...prev,
        ...m,
        ...ex,
        birthDate: m.birthDate || '',
        deathDate: m.deathDate || '',
        langAna: ex.languages?.ana || '',
        langUzmanlik: ex.languages?.uzmanlik || '',
        biggestFear: ex.biggest_fear || '',
        makesCry: ex.makes_cry || '',
        happiestMemory: ex.happiest_memory || '',
        makesLaugh: ex.makes_laugh || '',
        graveLocation: ex.grave_location || '',
        graveWill: ex.grave_will || '',
        aiVoiceActive: !!ex.ai_voice_active,
        arEnabled: !!ex.ar_enabled,
        autoAnniversarySms: !!ex.auto_anniversary_sms,
        lat: m.lat || null,
        lng: m.lng || null
      }));
    };
    loadExisting();
  }, [navigate]);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (step === 4 && mapRef.current) {
      if (!mapInstanceRef.current) {
        const tLat = form.lat || 39.9251;
        const tLng = form.lng || 32.8369;

        const map = L.map(mapRef.current).setView([tLat, tLng], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        if (form.lat && form.lng) {
          markerRef.current = L.marker([form.lat, form.lng]).addTo(map);
        }

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          setForm(prev => ({ ...prev, lat, lng }));
          if (markerRef.current) {
            markerRef.current.setLatLng(e.latlng);
          } else {
            markerRef.current = L.marker(e.latlng).addTo(map);
          }
        });

        mapInstanceRef.current = map;
      } else {
        setTimeout(() => mapInstanceRef.current.invalidateSize(), 100);
      }
    }
  }, [step, form.lat, form.lng]);

  const handleMapSearch = async () => {
    if (!mapSearchQuery.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 14);
          setForm(prev => ({ ...prev, lat: newLat, lng: newLng }));
          if (markerRef.current) {
            markerRef.current.setLatLng([newLat, newLng]);
          } else {
            markerRef.current = L.marker([newLat, newLng]).addTo(mapInstanceRef.current);
          }
        }
      } else {
        showFlash('Aradığınız adres bulunamadı.', 'error');
      }
    } catch (e) {
      showFlash('Adres aranırken bir hata oluştu.', 'error');
    }
  };

  const handleClearMap = () => {
    setMapSearchQuery('');
    setForm(prev => ({ ...prev, lat: null, lng: null }));
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([39.9251, 32.8369], 6);
    }
  };

  const handleChange = (e) => {
    const { id, value, type, checked, maxLength } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    if (typeof finalValue === 'string') {
      finalValue = sanitizeInput(finalValue);
    }

    const noNumberFields = ['firstName', 'lastName', 'city', 'district', 'occupation', 'langAna', 'langUzmanlik', 'makesLaugh', 'makesCry', 'deathCause', 'graveLocation', 'graveWill', 'traits', 'flower', 'food', 'sports', 'museums'];
    let errorMsg = null;

    if ((id === 'birthDate' || id === 'deathDate') && finalValue) {
      const selectedDate = new Date(finalValue);
      const today = new Date();
      if (selectedDate > today) {
        errorMsg = 'Geçersiz tarih';
      }
    } else if (noNumberFields.includes(id) && /\d/.test(finalValue)) {
      if (id === 'firstName') errorMsg = 'Geçersiz ad';
      else if (id === 'lastName') errorMsg = 'Geçersiz soyad';
      else if (id === 'city') errorMsg = 'Geçersiz il';
      else if (id === 'district') errorMsg = 'Geçersiz ilçe';
      else if (id === 'occupation') errorMsg = 'Geçersiz meslek';
      else if (id === 'langAna' || id === 'langUzmanlik') errorMsg = 'Geçersiz dil';
      else if (id === 'deathCause') errorMsg = 'Geçersiz ölüm nedeni';
      else if (id === 'graveLocation') errorMsg = 'Geçersiz mevki';
      else if (id === 'graveWill') errorMsg = 'Geçersiz vasiyet';
      else if (id === 'traits') errorMsg = 'Geçersiz özellik';
      else if (id === 'flower') errorMsg = 'Geçersiz çiçek';
      else if (id === 'food') errorMsg = 'Geçersiz yemek';
      else if (id === 'sports') errorMsg = 'Geçersiz spor';
      else if (id === 'museums') errorMsg = 'Geçersiz müze';
      else errorMsg = 'Geçersiz girdi';
    }

    setFormErrors(prev => ({ ...prev, [id]: errorMsg }));
    setForm(prev => ({ ...prev, [id]: finalValue }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(4)) {
      return;
    }
    setSaving(true);
    const res = await Api.saveMemorial(form);
    if (res?.status === 200) {
      setSaveMessage({ text: 'Anıtınız başarıyla kaydedildi ve onaya gönderildi!', type: 'success' });
    } else {
      setSaveMessage({ text: res?.errorMessage || 'Kayıt başarısız', type: 'error' });
    }
    setSaving(false);
  };


  const uploadProfile = async () => {
    const input = document.getElementById('profileImage');
    if (!input.files[0]) { setMediaStatus(p => ({ ...p, profile: 'Dosya seçin' })); return; }
    setMediaStatus(p => ({ ...p, profile: 'Yükleniyor...' }));
    const res = await Api.uploadProfileImage(input.files[0]);
    if (res?.status === 200) setMediaStatus(p => ({ ...p, profile: 'Yüklendi (yeşil)' }));
    else setMediaStatus(p => ({ ...p, profile: 'Hata: ' + (res?.errorMessage || 'Yüklenemedi') }));
  };

  const uploadGallery = async () => {
    const input = document.getElementById('galleryImages');
    if (!input.files.length) { setMediaStatus(p => ({ ...p, gallery: 'Dosya seçin' })); return; }
    setMediaStatus(p => ({ ...p, gallery: 'Yükleniyor...' }));
    const res = await Api.uploadGallery(input.files);
    if (res?.status === 200) setMediaStatus(p => ({ ...p, gallery: 'Yüklendi (yeşil)' }));
    else setMediaStatus(p => ({ ...p, gallery: 'Hata: ' + (res?.errorMessage || 'Yüklenemedi') }));
  };

  const uploadAudio = async (inputId, type) => {
    const input = document.getElementById(inputId);
    if (!input.files[0]) { alert('Dosya seçin'); return; }
    const res = await Api.uploadAudio(input.files[0], type);
    if (res?.status === 200) alert('Ses dosyası yüklendi!');
    else alert('Hata: ' + (res?.errorMessage || 'Yüklenemedi'));
  };

  const handleAddTimeline = () => {
    if (!timelineYear || !timelineEvent) {
      setInfoModal({ isOpen: true, text: 'Lütfen yıl ve olay açıklaması girin.' });
      return;
    }
    const newEntry = `${timelineYear}: ${timelineEvent}`;
    let currentEntries = form.timeline ? form.timeline.split('\n').filter(Boolean) : [];
    currentEntries.push(newEntry);

    currentEntries.sort((a, b) => {
      const yearA = parseInt(a.split(':')[0].trim()) || 0;
      const yearB = parseInt(b.split(':')[0].trim()) || 0;
      return yearA - yearB;
    });

    setForm(prev => ({ ...prev, timeline: currentEntries.join('\n') }));
    setTimelineYear('');
    setTimelineEvent('');
  };

  const handleEditTimeline = (idx) => {
    let currentEntries = form.timeline ? form.timeline.split('\n').filter(Boolean) : [];
    const entry = currentEntries[idx];
    const parts = entry.split(':');
    const year = parts[0].trim();
    const event = parts.slice(1).join(':').trim();
    setTimelineYear(year);
    setTimelineEvent(event);
    currentEntries.splice(idx, 1);
    setForm(prev => ({ ...prev, timeline: currentEntries.join('\n') }));
  };

  const handleDeleteTimeline = (idx) => {
    let currentEntries = form.timeline ? form.timeline.split('\n').filter(Boolean) : [];
    currentEntries.splice(idx, 1);
    setForm(prev => ({ ...prev, timeline: currentEntries.join('\n') }));
  };

  const handleAddWork = () => {
    if (!workYear || !workName) {
      setInfoModal({ isOpen: true, text: 'Lütfen yıl ve eser adı girin.' });
      return;
    }
    const newEntry = `${workYear}: ${workName}`;
    let currentEntries = form.works ? form.works.split('\n').filter(Boolean) : [];
    currentEntries.push(newEntry);

    currentEntries.sort((a, b) => {
      const yearA = parseInt(a.split(':')[0].trim()) || 0;
      const yearB = parseInt(b.split(':')[0].trim()) || 0;
      return yearA - yearB;
    });

    setForm(prev => ({ ...prev, works: currentEntries.join('\n') }));
    setWorkYear('');
    setWorkName('');
  };

  const handleEditWork = (idx) => {
    let currentEntries = form.works ? form.works.split('\n').filter(Boolean) : [];
    const entry = currentEntries[idx];
    const parts = entry.split(':');
    const year = parts[0].trim();
    const event = parts.slice(1).join(':').trim();
    setWorkYear(year);
    setWorkName(event);
    currentEntries.splice(idx, 1);
    setForm(prev => ({ ...prev, works: currentEntries.join('\n') }));
  };

  const handleDeleteWork = (idx) => {
    let currentEntries = form.works ? form.works.split('\n').filter(Boolean) : [];
    currentEntries.splice(idx, 1);
    setForm(prev => ({ ...prev, works: currentEntries.join('\n') }));
  };

  const handleAddPhysical = () => {
    if (!physicalType || !physicalValue) {
      setInfoModal({ isOpen: true, text: 'Lütfen özellik türü ve değerini girin.' });
      return;
    }

    let currentEntries = form.physical ? form.physical.split('\n').filter(Boolean) : [];

    const typeExists = currentEntries.some(entry => entry.split(':')[0].trim() === physicalType);
    if (typeExists) {
      setInfoModal({ isOpen: true, text: `"${physicalType}" özelliği zaten eklenmiş. Lütfen mevcut olanı düzenleyin veya silin.` });
      return;
    }

    const newEntry = `${physicalType}: ${physicalValue}`;
    currentEntries.push(newEntry);
    setForm(prev => ({ ...prev, physical: currentEntries.join('\n') }));
    setPhysicalValue('');
  };

  const handleEditPhysical = (idx) => {
    let currentEntries = form.physical ? form.physical.split('\n').filter(Boolean) : [];
    const entry = currentEntries[idx];
    const parts = entry.split(':');
    setPhysicalType(parts[0].trim());
    setPhysicalValue(parts.slice(1).join(':').trim());
    currentEntries.splice(idx, 1);
    setForm(prev => ({ ...prev, physical: currentEntries.join('\n') }));
  };

  const handleDeletePhysical = (idx) => {
    let currentEntries = form.physical ? form.physical.split('\n').filter(Boolean) : [];
    currentEntries.splice(idx, 1);
    setForm(prev => ({ ...prev, physical: currentEntries.join('\n') }));
  };

  const selectedCityData = citiesData.find(c => c.name === form.city);
  const districtOptions = selectedCityData ? selectedCityData.districts : [];

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px' }}>
      <div className="admin-header-v2" style={{ marginTop: '40px' }}>
        <h2>🚀 Gelişmiş Anıt Düzenleyici</h2>
        <p>Bilgileri adım adım doldurun.</p>
      </div>

      <div className="dashboard-tabs" style={{ marginBottom: '30px' }}>
        {['👤 Kimlik', '🌍 Kişilik', '🧠 Vasiyet', '📍 Kategori', '📚 Kariyer', '💾 Kaydet'].map((label, i) => (
          <button key={i} className={`tab-btn ${step === i + 1 ? 'active' : ''}`} onClick={() => { if (validateStep(step)) { setStep(i + 1); window.scrollTo({ top: 200, behavior: 'smooth' }); } }}>
            {label}
          </button>
        ))}
      </div>

      <form id="mform" onSubmit={handleSave}>
        {/* Step 1 */}
        <div className="wizard-step-panel" style={{ display: step === 1 ? 'block' : 'none' }}>
          <h3>1. Temel Kimlik & Biyografi</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <CustomValidatedInput label={<>Ad</>} id="firstName" value={form.firstName} onChange={handleChange} placeholder="Ad" maxLength={50} error={formErrors.firstName} successMessage={form.firstName ? 'Geçerli Ad' : null} />
            <CustomValidatedInput label={<>Soyad</>} id="lastName" value={form.lastName} onChange={handleChange} placeholder="Soyad" maxLength={50} error={formErrors.lastName} successMessage={form.lastName ? 'Geçerli Soyad' : null} />
          </div>
          <CustomValidatedInput label="Alt Başlık" id="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Örn: Yaşayan Kütüphane" maxLength={80} error={formErrors.subtitle} successMessage={form.subtitle ? 'Geçerli alt başlık' : null} />
          <CustomValidatedInput as="textarea" rows={6} label={<>Biyografi</>} id="bio" value={form.bio} onChange={handleChange} placeholder="Hayat hikayesi..." maxLength={1000} error={formErrors.bio} successMessage={form.bio ? 'Geçerli Biyografi' : null} />
          <CustomValidatedInput label="Alıntı Söz" id="quote" value={form.quote} onChange={handleChange} placeholder="Meşhur sözü..." maxLength={150} error={formErrors.quote} successMessage={form.quote ? 'Geçerli alıntı' : null} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <CustomValidatedInput type="date" label={<>Doğum Tarihi</>} id="birthDate" value={form.birthDate} onChange={handleChange} error={formErrors.birthDate} successMessage={form.birthDate ? 'Geçerli Tarih' : null} />
            <CustomValidatedInput type="date" label={<>Ölüm Tarihi</>} id="deathDate" value={form.deathDate} onChange={handleChange} error={formErrors.deathDate} successMessage={form.deathDate ? 'Geçerli Tarih' : null} />
          </div>
        </div>

        {/* Step 2 */}
        <div className="wizard-step-panel" style={{ display: step === 2 ? 'block' : 'none' }}>
          <h3>2. Kişilik & Dil Haritası</h3>
          <CustomValidatedInput label={<>Kişilik Özellikleri</>} id="traits" value={form.traits} onChange={handleChange} placeholder="Nesnel, Çok Dilli..." maxLength={100} error={formErrors.traits} successMessage={form.traits ? 'Geçerli özellik' : null} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <CustomValidatedInput label={<>Konuştuğu Diller</>} id="langAna" value={form.langAna} onChange={handleChange} placeholder="Türkçe, Almanca..." maxLength={100} error={formErrors.langAna} successMessage={form.langAna ? 'Geçerli dil' : null} />
            <CustomValidatedInput label="Uzmanlık Dilleri" id="langUzmanlik" value={form.langUzmanlik} onChange={handleChange} placeholder="Osmanlıca, Farsça..." maxLength={100} error={formErrors.langUzmanlik} successMessage={form.langUzmanlik ? 'Geçerli dil' : null} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <CustomValidatedInput label="Onu Güldüren" id="makesLaugh" value={form.makesLaugh} onChange={handleChange} maxLength={100} error={formErrors.makesLaugh} successMessage={form.makesLaugh ? 'Geçerli girdi' : null} />
            <CustomValidatedInput label="Onu Ağlatan" id="makesCry" value={form.makesCry} onChange={handleChange} maxLength={100} error={formErrors.makesCry} successMessage={form.makesCry ? 'Geçerli girdi' : null} />
          </div>
        </div>

        {/* Step 3 */}
        <div className="wizard-step-panel" style={{ display: step === 3 ? 'block' : 'none' }}>
          <h3>3. Analiz & Vasiyet</h3>
          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ fontSize: '15px', fontWeight: 'bold' }}>Fiziksel Özellikler</label>
            <textarea id="physical" value={form.physical} onChange={handleChange} style={{ display: 'none' }}></textarea>

            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr auto', gap: '10px', marginTop: '5px', marginBottom: '15px', alignItems: 'center' }}>
              <select value={physicalType} onChange={e => { setPhysicalType(e.target.value); setPhysicalValue(''); }} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                {Object.keys(physicalOptions).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>

              {physicalOptions[physicalType] && physicalOptions[physicalType].length > 0 ? (
                <select value={physicalValue} onChange={e => setPhysicalValue(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <option value="">Seçiniz</option>
                  {physicalOptions[physicalType].map(val => <option key={val} value={val}>{val}</option>)}
                </select>
              ) : (
                <input type="text" placeholder={physicalType === 'Boy' ? 'Örn: 175 cm' : physicalType === 'Kilo' ? 'Örn: 70 kg' : 'Değer giriniz'} value={physicalValue} onChange={e => setPhysicalValue(e.target.value)} maxLength={100} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              )}

              <button type="button" onClick={handleAddPhysical} className="btn" style={{ padding: '8px 15px', fontSize: '14px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Ekle
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(form.physical ? form.physical.split('\n').filter(Boolean) : []).map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <div style={{ fontSize: '14px' }}><strong>{entry.split(':')[0]}</strong>: {entry.split(':').slice(1).join(':')}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleEditPhysical(idx)} style={{ background: '#f5b041', color: '#fff', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'} title="Düzenle">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button type="button" onClick={() => handleDeletePhysical(idx)} style={{ background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'} title="Sil">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            <CustomValidatedInput label="En Mutlu Anı" id="happiestMemory" value={form.happiestMemory} onChange={handleChange} maxLength={300} error={formErrors.happiestMemory} successMessage={form.happiestMemory ? 'Geçerli anı' : null} />
          </div>
          <CustomValidatedInput label="En Büyük Korkusu" id="biggestFear" value={form.biggestFear} onChange={handleChange} maxLength={100} error={formErrors.biggestFear} successMessage={form.biggestFear ? 'Geçerli korku' : null} />
          <CustomValidatedInput as="textarea" rows="3" label="Manevi Vasiyet" id="will" placeholder="Vasiyet..." value={form.will} onChange={handleChange} maxLength={300} error={formErrors.will} successMessage={form.will ? 'Geçerli vasiyet' : null} />
          <div style={{ marginTop: '15px' }}>
            <label><input type="checkbox" id="aiVoiceActive" checked={form.aiVoiceActive} onChange={handleChange} /> Yapay Zeka Ses Arşivi Aktif</label><br />
            <label><input type="checkbox" id="arEnabled" checked={form.arEnabled} onChange={handleChange} /> AR Teknolojisi Aktif</label><br />
            <label><input type="checkbox" id="autoAnniversarySms" checked={form.autoAnniversarySms} onChange={handleChange} /> Yıldönümü Otomasyonu Aktif</label>
          </div>
        </div>

        {/* Step 4 */}
        <div className="wizard-step-panel" style={{ display: step === 4 ? 'block' : 'none' }}>
          <h3>4. Kategori & Konum</h3>
          <CustomValidatedInput as="select" label="Kategori" id="category" value={form.category} onChange={handleChange} error={formErrors.category} successMessage={form.category ? 'Geçerli kategori' : null}>
            <option value="">Seçiniz</option>
            <option value="siyaset">Siyasiler</option>
            <option value="hak_savunucusu">Hak Savunucuları</option>
            <option value="sanat">Sanatçılar</option>
            <option value="sehit">Şehitler</option>
            <option value="kadin_cinayeti">Kadın Cinayetleri</option>
          </CustomValidatedInput>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <CustomValidatedInput as="select" label={<>Şehir</>} id="city" value={form.city} onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, district: '' })); }} error={formErrors.city} successMessage={form.city ? 'Geçerli Şehir' : null}>
              <option value="">İl Seçiniz</option>
              {citiesData.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </CustomValidatedInput>
            <CustomValidatedInput as="select" label={<>İlçe</>} id="district" value={form.district} onChange={handleChange} disabled={!form.city} error={formErrors.district} successMessage={form.district ? 'Geçerli İlçe' : null}>
              <option value="">İlçe Seçiniz</option>
              {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
            </CustomValidatedInput>
          </div>
          <CustomValidatedInput label={<>Meslek</>} id="occupation" value={form.occupation} onChange={handleChange} placeholder="Örn: Avukat, Doktor, Müzisyen..." maxLength={80} error={formErrors.occupation} successMessage={form.occupation ? 'Geçerli meslek' : null} />
          <CustomValidatedInput as="select" label={<>Cinsiyet</>} id="gender" value={form.gender} onChange={handleChange} error={formErrors.gender} successMessage={form.gender ? 'Geçerli cinsiyet' : null}>
            <option value="">Seçiniz</option><option value="male">Erkek</option><option value="female">Kadın</option>
          </CustomValidatedInput>
          <CustomValidatedInput label={<>Ölüm Nedeni</>} id="deathCause" value={form.deathCause} onChange={handleChange} maxLength={80} error={formErrors.deathCause} successMessage={form.deathCause ? 'Geçerli neden' : null} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <CustomValidatedInput label={<>Mezarlık Mevkisi</>} id="graveLocation" value={form.graveLocation} onChange={handleChange} maxLength={150} error={formErrors.graveLocation} successMessage={form.graveLocation ? 'Geçerli mevki' : null} />
            <CustomValidatedInput label="Mezar Vasiyeti" id="graveWill" value={form.graveWill} onChange={handleChange} maxLength={200} error={formErrors.graveWill} successMessage={form.graveWill ? 'Geçerli vasiyet' : null} />
          </div>
          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ fontSize: '15px', fontWeight: 'bold' }}>Mezarlık Konumu</label>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '10px' }}>Konumu belirlemek için haritada mezarlığın bulunduğu yere tıklayın.</p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Şehir, ilçe, mezarlık adı arayın..."
                value={mapSearchQuery}
                onChange={e => setMapSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleMapSearch())}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
              />
              <button
                type="button"
                onClick={handleMapSearch}
                style={{ background: 'var(--gold-accent)', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Ara
              </button>
              <button
                type="button"
                onClick={handleClearMap}
                style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Temizle
              </button>
            </div>

            <div ref={mapRef} style={{ height: '300px', width: '100%', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}></div>
            {form.lat && form.lng && <p style={{ fontSize: '12px', color: 'var(--accent-color)', marginTop: '8px' }}>Seçilen Koordinat: {form.lat.toFixed(4)}, {form.lng.toFixed(4)}</p>}
          </div>
        </div>

        {/* Step 5 */}
        <div className="wizard-step-panel" style={{ display: step === 5 ? 'block' : 'none' }}>
          <h3>5. Kariyer & Yaşam Tarzı</h3>
          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ fontSize: '15px', fontWeight: 'bold' }}>Eserleri</label>
            <textarea id="works" value={form.works} onChange={handleChange} style={{ display: 'none' }}></textarea>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '10px', marginTop: '5px', marginBottom: '15px', alignItems: 'center' }}>
              <input type="number" placeholder="Yıl" value={workYear} onChange={e => setWorkYear(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              <input type="text" placeholder="Eser Adı" value={workName} onChange={e => setWorkName(e.target.value)} maxLength={100} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              <button type="button" onClick={handleAddWork} className="btn" style={{ padding: '8px 15px', fontSize: '14px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Ekle
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(form.works ? form.works.split('\n').filter(Boolean) : []).map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <div style={{ fontSize: '14px' }}><strong>{entry.split(':')[0]}</strong>: {entry.split(':').slice(1).join(':')}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleEditWork(idx)} style={{ background: '#f5b041', color: '#fff', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'} title="Düzenle">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button type="button" onClick={() => handleDeleteWork(idx)} style={{ background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'} title="Sil">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ fontSize: '15px', fontWeight: 'bold' }}>Kronolojik Olaylar</label>
            <textarea id="timeline" value={form.timeline} onChange={handleChange} style={{ display: 'none' }}></textarea>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '10px', marginTop: '5px', marginBottom: '15px', alignItems: 'center' }}>
              <input type="number" placeholder="Yıl" value={timelineYear} onChange={e => setTimelineYear(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              <input type="text" placeholder="Olay Açıklaması" value={timelineEvent} onChange={e => setTimelineEvent(e.target.value)} maxLength={100} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              <button type="button" onClick={handleAddTimeline} className="btn" style={{ padding: '8px 15px', fontSize: '14px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Ekle
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(form.timeline ? form.timeline.split('\n').filter(Boolean) : []).map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <div style={{ fontSize: '14px' }}><strong>{entry.split(':')[0]}</strong>: {entry.split(':').slice(1).join(':')}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleEditTimeline(idx)} style={{ background: '#f5b041', color: '#fff', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'} title="Düzenle">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button type="button" onClick={() => handleDeleteTimeline(idx)} style={{ background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'} title="Sil">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <CustomValidatedInput label="Sevdiği Çiçek" id="flower" value={form.flower} onChange={handleChange} maxLength={50} error={formErrors.flower} successMessage={form.flower ? 'Geçerli çiçek' : null} />
            <CustomValidatedInput label="İmza Kokusu" id="scent" value={form.scent} onChange={handleChange} maxLength={50} error={formErrors.scent} successMessage={form.scent ? 'Geçerli koku' : null} />
            <CustomValidatedInput label="Favori Yemek" id="food" value={form.food} onChange={handleChange} maxLength={50} error={formErrors.food} successMessage={form.food ? 'Geçerli yemek' : null} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <CustomValidatedInput label="Spor/Takım" id="sports" value={form.sports} onChange={handleChange} maxLength={100} error={formErrors.sports} successMessage={form.sports ? 'Geçerli spor' : null} />
            <CustomValidatedInput label="Filmler" id="movies" value={form.movies} onChange={handleChange} maxLength={100} error={formErrors.movies} successMessage={form.movies ? 'Geçerli film' : null} />
          </div>
          <CustomValidatedInput label="Müzeler" id="museums" value={form.museums} onChange={handleChange} maxLength={100} error={formErrors.museums} successMessage={form.museums ? 'Geçerli müze' : null} />
        </div>

        {/* Step 6 */}
        <div className="wizard-step-panel" style={{ display: step === 6 ? 'block' : 'none' }}>
          <h3>6. Medya Yükle & Kaydet</h3>

          <div className="form-group" style={{ background: '#f9f9f8', padding: '20px', borderRadius: '12px', border: '1px dashed var(--border-color)', marginBottom: '20px' }}>
            <label style={{ fontSize: '15px', fontWeight: '700' }}>📸 Profil Fotoğrafı</label>
            <input type="file" id="profileImage" accept="image/*" style={{ marginTop: '8px' }} />
            <button type="button" className="btn btn-outline" style={{ marginTop: '10px' }} onClick={uploadProfile}>Profil Fotoğrafını Yükle</button>
            <span style={{ marginLeft: '10px', fontSize: '13px', color: mediaStatus.profile.includes('Hata') ? 'red' : 'green' }}>{mediaStatus.profile}</span>
          </div>

          <div className="form-group" style={{ background: '#f9f9f8', padding: '20px', borderRadius: '12px', border: '1px dashed var(--border-color)', marginBottom: '20px' }}>
            <label style={{ fontSize: '15px', fontWeight: '700' }}>🖼️ Galeri Fotoğrafları (Çoklu Seçim)</label>
            <input type="file" id="galleryImages" accept="image/*" multiple style={{ marginTop: '8px' }} />
            <button type="button" className="btn btn-outline" style={{ marginTop: '10px' }} onClick={uploadGallery}>Galeriye Yükle</button>
            <span style={{ marginLeft: '10px', fontSize: '13px', color: mediaStatus.gallery.includes('Hata') ? 'red' : 'green' }}>{mediaStatus.gallery}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div className="form-group" style={{ background: '#f9f9f8', padding: '15px', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <label>📖 Yasin Suresi (Ses)</label>
              <input type="file" id="audioYasin" accept="audio/*" style={{ marginTop: '8px' }} />
              <button type="button" className="btn btn-outline" style={{ marginTop: '8px', width: '100%', fontSize: '12px' }} onClick={() => uploadAudio('audioYasin', 'audio_yasin')}>Yükle</button>
            </div>
            <div className="form-group" style={{ background: '#f9f9f8', padding: '15px', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <label>📖 Fatiha Suresi (Ses)</label>
              <input type="file" id="audioFatiha" accept="audio/*" style={{ marginTop: '8px' }} />
              <button type="button" className="btn btn-outline" style={{ marginTop: '8px', width: '100%', fontSize: '12px' }} onClick={() => uploadAudio('audioFatiha', 'audio_fatiha')}>Yükle</button>
            </div>
            <div className="form-group" style={{ background: '#f9f9f8', padding: '15px', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <label>🎙️ Merhum Ses Kaydı</label>
              <input type="file" id="audioVoice" accept="audio/*" style={{ marginTop: '8px' }} />
              <button type="button" className="btn btn-outline" style={{ marginTop: '8px', width: '100%', fontSize: '12px' }} onClick={() => uploadAudio('audioVoice', 'audio_voice')}>Yükle</button>
            </div>
            <div className="form-group" style={{ background: '#f9f9f8', padding: '15px', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <label>🎶 Favori Müziği</label>
              <input type="file" id="audioMusic" accept="audio/*" style={{ marginTop: '8px' }} />
              <button type="button" className="btn btn-outline" style={{ marginTop: '8px', width: '100%', fontSize: '12px' }} onClick={() => uploadAudio('audioMusic', 'audio_music')}>Yükle</button>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '30px 0' }} />
          <p style={{ color: 'var(--text-light)' }}>Tüm bilgileri kontrol ettikten sonra kaydedin. Anıtınız admin onayından sonra yayına alınacaktır.</p>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button type="submit" className="btn" disabled={saving} style={{ background: '#6B705C', fontSize: '16px', padding: '15px 40px', color: 'white' }}>
              {saving ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET VE ONAYA GÖNDER'}
            </button>
            {saveMessage.text && (
              <div style={{ marginTop: '15px', color: saveMessage.type === 'success' ? '#27ae60' : '#e74c3c', fontWeight: 'bold', fontSize: '15px' }}>
                {saveMessage.text}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <button type="button" className="btn btn-outline" onClick={() => { if (step > 1) { setStep(s => s - 1); window.scrollTo({ top: 200, behavior: 'smooth' }); } }} disabled={step === 1}>Geri</button>
          <button type="button" className="btn" onClick={() => { if (step < total) { setStep(s => s + 1); window.scrollTo({ top: 200, behavior: 'smooth' }); } }} style={{ display: step === total ? 'none' : 'block' }}>Sonraki Adım</button>
        </div>


      </form>
    </div>
  );
};

export default DashboardPage;
