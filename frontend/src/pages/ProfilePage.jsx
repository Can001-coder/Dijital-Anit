import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Api from '../api';
import L from 'leaflet';
import { sanitizeInput } from '../utils/sanitize';
import tbmmBg from '../assets/tbmm_bg.jpg';
import sanatciBg from '../assets/sanatci_bg.jpg';
import hakSavunucusuBg from '../assets/hak_savunucusu_bg.jpg';
import kadinCinayetiBg from '../assets/kadin_cinayeti_bg.jpg';

const sehitSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800' width='1200' height='800'%3E%3Cdefs%3E%3ClinearGradient id='shaft1' x1='0%25' y1='100%25' x2='0%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23ffffff' stop-opacity='0'/%3E%3Cstop offset='70%25' stop-color='%23ffffff' stop-opacity='0.03'/%3E%3Cstop offset='100%25' stop-color='%23ffffff' stop-opacity='0.08'/%3E%3C/linearGradient%3E%3ClinearGradient id='shaft2' x1='0%25' y1='100%25' x2='0%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23ffffff' stop-opacity='0'/%3E%3Cstop offset='50%25' stop-color='%23ffffff' stop-opacity='0.02'/%3E%3Cstop offset='100%25' stop-color='%23ffffff' stop-opacity='0.06'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg transform='translate(600, 350) scale(1.8)' opacity='0.06' fill='%23ffffff'%3E%3Cmask id='crescentMask'%3E%3Crect x='-300' y='-300' width='600' height='600' fill='%23ffffff'/%3E%3Ccircle cx='30' cy='0' r='80' fill='%23000000'/%3E%3C/mask%3E%3Ccircle cx='0' cy='0' r='100' fill='%23ffffff' mask='url(%23crescentMask)'/%3E%3Cpolygon points='100,0 127,-9 128,-38 145,-15 172,-24 156,0 172,24 145,15 128,38 127,9'/%3E%3C/g%3E%3Cpolygon points='100,800 200,800 250,0 150,0' fill='url(%23shaft1)'/%3E%3Cpolygon points='350,800 500,800 480,0 380,0' fill='url(%23shaft2)'/%3E%3Cpolygon points='600,800 700,800 800,0 720,0' fill='url(%23shaft1)'/%3E%3Cpolygon points='850,800 1000,800 950,0 820,0' fill='url(%23shaft2)'/%3E%3Cpolygon points='50,800 150,800 100,0 20,0' fill='url(%23shaft2)' opacity='0.5'/%3E%3Cpolygon points='1050,800 1180,800 1150,0 1020,0' fill='url(%23shaft1)'/%3E%3C/svg%3E`;

const THEMES = {
  hukukcu: {
    bgColor: '#F4F5F7',
    cardBg: 'rgba(255, 255, 255, 0.90)',
    textDark: '#1E272C',
    accentColor: '#2C3E50',
    accentHover: '#1A252F',
    goldAccent: '#C5A059',
    borderColor: '#D2D7DF',
    cardShadow: '0 10px 30px rgba(44, 62, 80, 0.06)',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M10 20 h20 v2 h-20 z M20 10 v10 M12 25 a8 8 0 0 0 16 0 M50 20 h20 v2 h-20 z M60 10 v10 M52 25 a8 8 0 0 0 16 0' fill='%23C5A059' fill-opacity='0.1'/%3E%3Cpath d='M40 10 v50 M25 60 h30 v3 h-30 z' fill='none' stroke='%23C5A059' stroke-width='1.5' stroke-opacity='0.08'/%3E%3C/svg%3E")`
  },
  doktor: {
    bgColor: '#F2F9F9',
    cardBg: 'rgba(255, 255, 255, 0.90)',
    textDark: '#1F2D2D',
    accentColor: '#008080',
    accentHover: '#006666',
    goldAccent: '#83C5BE',
    borderColor: '#CCE3E3',
    cardShadow: '0 10px 30px rgba(0, 128, 128, 0.05)',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40'%3E%3Cpath d='M0 20 h30 l5 -10 l5 20 l5 -15 l5 5 h45' fill='none' stroke='%23008080' stroke-width='1.5' stroke-opacity='0.08'/%3E%3C/svg%3E")`
  },
  ogretmen: {
    bgColor: '#FDFBF7',
    cardBg: 'rgba(255, 255, 255, 0.90)',
    textDark: '#3A2E2B',
    accentColor: '#8C6239',
    accentHover: '#704E2D',
    goldAccent: '#E0A96D',
    borderColor: '#EFE7DC',
    cardShadow: '0 10px 30px rgba(140, 98, 57, 0.05)',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M10 20 h15 v20 h-15 z M35 20 h15 v20 h-15 z M10 40 q15 -5 30 0' fill='none' stroke='%23E0A96D' stroke-width='1' stroke-opacity='0.15'/%3E%3C/svg%3E")`
  },
  muhendis: {
    bgColor: '#F0F4F8',
    cardBg: 'rgba(255, 255, 255, 0.90)',
    textDark: '#1A2332',
    accentColor: '#20639B',
    accentHover: '#174A75',
    goldAccent: '#3CAEA3',
    borderColor: '#D3E0EA',
    cardShadow: '0 10px 30px rgba(32, 99, 155, 0.05)',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 0 h40 v40 h-40 z' fill='none' stroke='%2320639B' stroke-width='0.5' stroke-opacity='0.06'/%3E%3Cpath d='M0 20 h40 M20 0 v40' fill='none' stroke='%2320639B' stroke-width='0.75' stroke-opacity='0.1'/%3E%3C/svg%3E")`
  },
  sanatci: {
    bgColor: '#1A1020',
    cardBg: 'rgba(18, 12, 28, 0.70)',
    textDark: '#F2EDF8',
    accentColor: '#E8956D',
    accentHover: '#D4734A',
    goldAccent: '#F8B195',
    borderColor: 'rgba(248, 177, 149, 0.22)',
    cardShadow: '0 16px 50px rgba(0, 0, 0, 0.50)',
    backgroundImage: `linear-gradient(to bottom, rgba(20,10,35,0.60) 0%, rgba(20,10,35,0.35) 50%, rgba(20,10,35,0.65) 100%), url("${kadinCinayetiBg}")`,
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Inter', sans-serif",
    headingColor: '#F8D7C4',
    cardBackdropFilter: 'blur(18px)',
    imageGlow: '0 0 28px rgba(248, 177, 149, 0.40)',
    inputBackground: 'rgba(0, 0, 0, 0.35)',
    themeId: 'sanatci_antigravity',
    cardRadius: '20px',
    inputRadius: '10px',
    btnRadius: '20px',
    textShadow: '0 1px 8px rgba(0,0,0,0.6)',
    lineHeight: '1.9',
    letterSpacing: '0.15px'
  },
  sehit: {
    bgColor: 'linear-gradient(180deg, #5A0000 0%, #1A0000 100%)',
    cardBg: 'rgba(22, 3, 3, 0.58)', // Softer glassmorphic background
    textDark: '#E5E5E7', // Soft silver-gray text
    accentColor: '#FFFFFF', // White accent instead of gold
    accentHover: '#F5F5F7',
    goldAccent: '#FFFFFF', // White instead of gold
    borderColor: 'rgba(255, 255, 255, 0.15)', // Soft white border instead of gold
    cardShadow: '0 20px 45px rgba(0, 0, 0, 0.45)', // Softer, more diffused shadow
    backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.03) 25%, rgba(0,0,0,0.08) 50%, rgba(255,255,255,0.03) 75%, rgba(255,255,255,0) 100%), url("${sehitSvg}"), linear-gradient(180deg, #5A0000 0%, #1A0000 100%)`,
    cardBackdropFilter: 'blur(24px)', // High blur for soft glassmorphism
    imageGlow: '0 0 20px rgba(255, 255, 255, 0.25)', // White glow instead of gold
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Inter', sans-serif",
    headingColor: '#FFFFFF', // Pure white
    bannerBackground: '#FFFFFF', // Pure white owner banner
    bannerText: '#1A0000',
    footerBackground: '#0F0000',
    inputBackground: 'rgba(0, 0, 0, 0.3)',
    themeId: 'sehitler_antigravity',
    cardRadius: '24px',
    inputRadius: '12px',
    btnRadius: '24px', // Rounded buttons
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
    lineHeight: '2.0',
    letterSpacing: '0.2px'
  },
  siyasi: {
    bgColor: '#1C2235',
    cardBg: 'rgba(20, 25, 40, 0.72)',
    textDark: '#F0EDE6',
    accentColor: '#C9A84C',
    accentHover: '#A8893A',
    goldAccent: '#C9A84C',
    borderColor: 'rgba(201, 168, 76, 0.25)',
    cardShadow: '0 16px 50px rgba(0, 0, 0, 0.45)',
    backgroundImage: `linear-gradient(to bottom, rgba(15,20,35,0.55) 0%, rgba(15,20,35,0.40) 60%, rgba(15,20,35,0.70) 100%), url("${tbmmBg}")`,
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Inter', sans-serif",
    headingColor: '#F5E9C8',
    cardBackdropFilter: 'blur(18px)',
    imageGlow: '0 0 28px rgba(201, 168, 76, 0.35)',
    inputBackground: 'rgba(0, 0, 0, 0.35)',
    themeId: 'siyasi_antigravity',
    cardRadius: '20px',
    inputRadius: '10px',
    btnRadius: '10px',
    textShadow: '0 1px 6px rgba(0,0,0,0.5)',
    lineHeight: '1.85',
    letterSpacing: '0.1px'
  },
  hak_savunucusu: {
    bgColor: '#F4F6F8',
    cardBg: 'rgba(255, 255, 255, 0.82)',
    textDark: '#2C3A47',
    accentColor: '#3B4B59',
    accentHover: '#222F3E',
    goldAccent: '#C8A97E',
    borderColor: 'rgba(255, 255, 255, 0.6)',
    cardShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
    backgroundImage: `linear-gradient(to bottom, rgba(244,246,248,0.15) 0%, rgba(244,246,248,0.55) 60%, rgba(244,246,248,0.98) 100%), url("${hakSavunucusuBg}")`,
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Inter', sans-serif",
    headingColor: '#1E272E',
    cardBackdropFilter: 'blur(16px)',
    imageGlow: '0 0 30px rgba(255, 255, 255, 0.6)',
    inputBackground: 'rgba(255, 255, 255, 0.65)',
    themeId: 'hak_savunucusu_antigravity',
    cardRadius: '20px',
    inputRadius: '10px',
    btnRadius: '10px',
    textShadow: 'none',
    lineHeight: '1.85',
    letterSpacing: '0.1px'
  },
  kadin_cinayeti: {
    bgColor: '#1A1410',
    cardBg: 'rgba(18, 14, 10, 0.72)',
    textDark: '#F0EAE2',
    accentColor: '#C8A882',
    accentHover: '#A88B6A',
    goldAccent: '#D4B896',
    borderColor: 'rgba(212, 184, 150, 0.20)',
    cardShadow: '0 16px 50px rgba(0, 0, 0, 0.50)',
    backgroundImage: `linear-gradient(to bottom, rgba(26,20,16,0.55) 0%, rgba(26,20,16,0.35) 50%, rgba(26,20,16,0.70) 100%), url("${sanatciBg}")`,
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Inter', sans-serif",
    headingColor: '#F5E6D4',
    cardBackdropFilter: 'blur(18px)',
    imageGlow: '0 0 28px rgba(212, 184, 150, 0.35)',
    inputBackground: 'rgba(0, 0, 0, 0.35)',
    themeId: 'kadin_cinayeti_antigravity',
    cardRadius: '20px',
    inputRadius: '10px',
    btnRadius: '20px',
    textShadow: '0 1px 8px rgba(0,0,0,0.5)',
    lineHeight: '1.9',
    letterSpacing: '0.15px'
  },
  standart: {
    bgColor: '#F7F8F6',
    cardBg: 'rgba(255,255,255,0.85)',
    textDark: '#353834',
    accentColor: '#5D705D',
    accentHover: '#465446',
    goldAccent: '#C2B69D',
    borderColor: '#DDE2DB',
    cardShadow: '0 10px 30px rgba(93,112,93,0.05)',
    backgroundImage: 'radial-gradient(circle at top right,rgba(194,182,157,.15) 0%,transparent 50%),radial-gradient(circle at bottom left,rgba(93,112,93,.1) 0%,transparent 50%)'
  }
};

const getTheme = (occupation, category, deathCause) => {
  const occLower = occupation ? occupation.toLowerCase().trim() : '';
  const causeLower = deathCause ? deathCause.toLowerCase().trim() : '';
  
  if (
    category === 'sehit' ||
    occLower.includes('şehit') || 
    occLower.includes('sehit') || 
    occLower.includes('asker') || 
    occLower.includes('subay') || 
    occLower.includes('polis') || 
    occLower.includes('erbaş') || 
    occLower.includes('er ') || 
    occLower.endsWith(' er') || 
    occLower === 'er' || 
    occLower.includes('üsteğmen') || 
    occLower.includes('teğmen') || 
    occLower.includes('binbaşı') || 
    occLower.includes('yarbay') || 
    occLower.includes('albay') || 
    occLower.includes('general') || 
    occLower.includes('jandarma') || 
    occLower.includes('tsk') || 
    occLower.includes('komando') || 
    causeLower.includes('şehit') || 
    causeLower.includes('sehit')
  ) {
    // Only apply flag theme if category is NOT 'egitim_sehitleri'
    if (category !== 'egitim_sehitleri') {
      return THEMES.sehit;
    }
  }

  // Hak Savunucusu tema
  if (
    category === 'hak_savunucusu' ||
    occLower.includes('hak savunucu') ||
    occLower.includes('aktivist')
  ) {
    return THEMES.hak_savunucusu;
  }

  // Siyasi tema
  if (
    category === 'siyaset' ||
    category === 'siyasi' ||
    occLower.includes('siyaset') ||
    occLower.includes('siyasi') ||
    occLower.includes('politika') ||
    occLower.includes('cumhurbaşkan') ||
    occLower.includes('başbakan') ||
    occLower.includes('bakan') ||
    occLower.includes('milletvekili') ||
    occLower.includes('vali') ||
    occLower.includes('belediye başkan') ||
    occLower.includes('diplomat')
  ) {
    return THEMES.siyasi;
  }

  // Sanatçılar tema (kategori bazlı)
  if (
    category === 'sanat' ||
    category === 'sanatci'
  ) {
    return THEMES.sanatci;
  }

  // Kadın Cinayetleri tema
  if (
    category === 'kadin_cinayeti'
  ) {
    return THEMES.kadin_cinayeti;
  }
  
  if (!occupation) return THEMES.standart;
  
  if (occLower.includes('hukuk') || occLower.includes('avukat') || occLower.includes('savcı') || occLower.includes('hakim') || occLower.includes('adalet')) {
    return THEMES.hukukcu;
  }
  if (occLower.includes('doktor') || occLower.includes('hekim') || occLower.includes('tıp') || occLower.includes('sağlık') || occLower.includes('hemşire') || occLower.includes('eczacı')) {
    return THEMES.doktor;
  }
  if (occLower.includes('öğretmen') || occLower.includes('akademisyen') || occLower.includes('hoca') || occLower.includes('eğitmen') || occLower.includes('prof') || occLower.includes('öğretim') || occLower.includes('okul')) {
    return THEMES.ogretmen;
  }
  if (occLower.includes('mühendis') || occLower.includes('yazılımcı') || occLower.includes('mimar') || occLower.includes('teknik') || occLower.includes('kodla') || occLower.includes('geliştirici')) {
    return THEMES.muhendis;
  }
  if (occLower.includes('sanat') || occLower.includes('ressam') || occLower.includes('müzisyen') || occLower.includes('şair') || occLower.includes('yazar') || occLower.includes('oyuncu') || occLower.includes('tiyatro') || occLower.includes('heykel')) {
    return THEMES.sanatci;
  }
  
  return THEMES.standart;
};

const Carnation = ({ x, y, size = 32 }) => {
  const petalLayers = [
    { count: 10, scale: 1.0, color: '#C26161', opacity: 0.85 },
    { count: 8, scale: 0.75, color: '#D27979', opacity: 0.9 },
    { count: 6, scale: 0.5, color: '#B25547', opacity: 0.95 }
  ];
  const petalPath = "M 0,0 C -3,-4 -7,-10 -3,-15 C 0,-17 3,-17 6,-15 C 10,-10 6,-4 0,0 Z";

  return (
    <g transform={`translate(${x}, ${y}) scale(${size / 32})`}>
      {/* Stem */}
      <line x1="0" y1="6" x2="0" y2="38" stroke="#6A7A61" strokeWidth="2" strokeLinecap="round" />
      {/* Small leaves on stem */}
      <path d="M 0,18 C -6,14 -10,10 -6,8 C -3,7 0,12 0,18 Z" fill="#8A9E7F" opacity="0.7" />
      <path d="M 0,26 C 6,22 10,18 6,16 C 3,15 0,20 0,26 Z" fill="#8A9E7F" opacity="0.7" />
      {/* Calyx (green base) */}
      <path d="M -4,4 C -4,0 -2,-2 0,-3 C 2,-2 4,0 4,4 Z" fill="#6A7A61" opacity="0.8" />
      {/* Petal layers */}
      {petalLayers.map((layer, li) => (
        Array.from({ length: layer.count }).map((_, i) => (
          <path
            key={`l${li}-p${i}`}
            d={petalPath}
            transform={`rotate(${(i * 360) / layer.count + li * 18}) scale(${layer.scale})`}
            fill={layer.color}
            opacity={layer.opacity}
          />
        ))
      ))}
      {/* Center fringe detail */}
      <circle cx="0" cy="0" r={3} fill="#E8B0B0" opacity="0.6" />
    </g>
  );
};

const CarnationOverlay = ({ flowerCount = 0 }) => {
  if (flowerCount <= 0) return null;

  const positions = [];
  const maxVisible = Math.min(flowerCount, 1);
  const startX = 28;
  const startY = 30;
  const spacingX = 38;
  const spacingY = 48;
  const cols = 5;

  for (let i = 0; i < maxVisible; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push({
      x: startX + col * spacingX,
      y: startY + row * spacingY,
      size: 28 + (i % 3) * 3
    });
  }

  return (
    <svg
      viewBox="0 0 350 420"
      preserveAspectRatio="xMinYMin meet"
      style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        width: 'calc(100% - 16px)',
        height: 'calc(100% - 16px)',
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      <defs>
        <filter id="carnationShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter="url(#carnationShadow)">
        {positions.map((p, idx) => (
          <Carnation key={`carnation-${idx}`} x={p.x} y={p.y} size={p.size} />
        ))}
      </g>
    </svg>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('slug');
  const isPreview = searchParams.get('preview') === 'true';
  const [memorial, setMemorial] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Comments form
  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [showFlower, setShowFlower] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus states for input fields to implement the dynamic gold borders
  const [commentNameFocused, setCommentNameFocused] = useState(false);
  const [infoModal, setInfoModal] = useState({ isOpen: false, text: '' });
  const [commentContentFocused, setCommentContentFocused] = useState(false);

  // Hover state for technological services cards
  const [hoveredCard, setHoveredCard] = useState(null);

  const mapRef = useRef(null);

  const fetchProfile = useCallback(async () => {
    if (!slug) {
      setError('Geçersiz bağlantı.');
      setLoading(false);
      return;
    }
    const d = await Api.getMemorialBySlug(slug, isPreview);
    if (d?.status === 200 && d.payload) {
      setMemorial(d.payload);
      document.title = `${d.payload.name} - Dijital Anıt`;
      
      if (Api.isLoggedIn()) {
        try {
          const myMemRes = await Api.getMyMemorial();
          if (myMemRes?.status === 200 && myMemRes.payload && myMemRes.payload.id === d.payload.id) {
            setIsOwner(true);
          }
        } catch(e) {}
      }
    } else {
      setError('Anıt bulunamadı.');
    }
    setLoading(false);
  }, [slug, isPreview]);

  useEffect(() => {
    // Leaflet styling is loaded globally in index.html, we inject the specific style override here to match the dark theme feel if needed
    fetchProfile();
  }, [fetchProfile]);

  // Handle map init after render
  useEffect(() => {
    if (memorial && mapRef.current) {
      const { lat, lng } = memorial;
      if (lat && lng) {
        const map = L.map(mapRef.current).setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);
        L.marker([lat, lng]).addTo(map).bindPopup("Ebedi İstirahatgah").openPopup();

        return () => map.remove();
      }
    }
  }, [memorial]);

  // Global layout theme variable injector effect
  useEffect(() => {
    if (memorial) {
      const theme = getTheme(memorial.occupation, memorial.category, memorial.deathCause);
      const root = document.documentElement;
      
      const hexToRgb = (hex) => {
        if (!hex || typeof hex !== 'string') return '255, 255, 255';
        const cleanHex = hex.replace('#', '');
        if (cleanHex.length === 3) {
          const r = parseInt(cleanHex[0] + cleanHex[0], 16);
          const g = parseInt(cleanHex[1] + cleanHex[1], 16);
          const b = parseInt(cleanHex[2] + cleanHex[2], 16);
          return `${r}, ${g}, ${b}`;
        } else if (cleanHex.length === 6) {
          const r = parseInt(cleanHex.substring(0, 2), 16);
          const g = parseInt(cleanHex.substring(2, 4), 16);
          const b = parseInt(cleanHex.substring(4, 6), 16);
          return `${r}, ${g}, ${b}`;
        }
        return '255, 255, 255';
      };

      // Save original document.body inline styles to restore them when leaving
      const originalBodyBg = document.body.style.background;
      const originalBodyBgColor = document.body.style.backgroundColor;
      const originalBodyBgImg = document.body.style.backgroundImage;
      const originalBodyBgAtt = document.body.style.backgroundAttachment;
      const originalBodyBgSize = document.body.style.backgroundSize;
      const originalBodyBgRep = document.body.style.backgroundRepeat;
      const originalBodyAnimation = document.body.style.animation;
      const originalBodyColor = document.body.style.color;
      const originalBodyFontFamily = document.body.style.fontFamily;

      // Apply the theme background and parameters to document.body
      document.body.style.background = 'none'; // Reset shorthand first
      
      if ((theme.themeId === 'sehitler_antigravity' || memorial.category === 'sehit' || (memorial.occupation && (memorial.occupation.toLowerCase().includes('şehit') || memorial.occupation.toLowerCase().includes('sehit')))) && memorial.category !== 'egitim_sehitleri') {
        document.body.style.backgroundColor = '#1A0000';
        document.body.style.backgroundImage = theme.backgroundImage;
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundSize = '800px 100%, cover';
        document.body.style.backgroundRepeat = 'repeat-x, no-repeat';
        document.body.style.animation = 'flagWave 12s linear infinite';
      } else {
        document.body.style.backgroundColor = theme.bgColor.includes('gradient') ? 'transparent' : theme.bgColor;
        document.body.style.backgroundImage = theme.backgroundImage || (theme.bgColor.includes('gradient') ? theme.bgColor : 'none');
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.animation = 'none';
      }

      if (theme.textDark) {
        document.body.style.color = theme.textDark;
      }
      if (theme.bodyFont) {
        document.body.style.fontFamily = theme.bodyFont;
      }

      let bgFallback = theme.bgColor;
      if (theme.bgColor.includes('gradient')) {
        bgFallback = '#1A0000'; // dark ruby red bottom color as solid fallback
      }
      root.style.setProperty('--theme-bg-color', bgFallback);

      if ((theme.themeId === 'sehitler_antigravity' || memorial.category === 'sehit' || (memorial.occupation && (memorial.occupation.toLowerCase().includes('şehit') || memorial.occupation.toLowerCase().includes('sehit')))) && memorial.category !== 'egitim_sehitleri') {
        root.style.setProperty('--theme-header-bg', 'rgba(26, 0, 0, 0.8)');
        root.style.setProperty('--theme-border-color', 'rgba(255, 255, 255, 0.15)');
        root.style.setProperty('--theme-logo-color', '#FFFFFF');
        root.style.setProperty('--theme-nav-link-color', '#FFFFFF');
        root.style.setProperty('--theme-nav-link-hover', '#FFFFFF');
        root.style.setProperty('--theme-footer-bg', '#0F0000');
        root.style.setProperty('--theme-footer-text', '#FFFFFF');
        root.style.setProperty('--theme-footer-light-text', 'rgba(255, 255, 255, 0.6)');
        root.style.setProperty('--theme-gold-accent', '#FFFFFF');
      } else {
        const headerBgColor = theme.bgColor === '#FDFCF9' ? 'rgba(249, 247, 241, 0.85)' : `rgba(${hexToRgb(theme.bgColor)}, 0.85)`;
        root.style.setProperty('--theme-header-bg', headerBgColor);
        root.style.setProperty('--theme-border-color', theme.borderColor);
        root.style.setProperty('--theme-logo-color', theme.accentColor);
        root.style.setProperty('--theme-nav-link-color', theme.textDark);
        root.style.setProperty('--theme-nav-link-hover', theme.goldAccent);
        root.style.setProperty('--theme-footer-bg', theme.accentColor === '#3D3528' ? '#3C362A' : theme.accentColor);
        root.style.setProperty('--theme-footer-text', '#F9F7F1');
        root.style.setProperty('--theme-footer-light-text', 'rgba(249, 247, 241, 0.7)');
        root.style.setProperty('--theme-gold-accent', theme.goldAccent);
      }
      
      return () => {
        // Restore body original styles
        document.body.style.background = originalBodyBg;
        document.body.style.backgroundColor = originalBodyBgColor;
        document.body.style.backgroundImage = originalBodyBgImg;
        document.body.style.backgroundAttachment = originalBodyBgAtt;
        document.body.style.backgroundSize = originalBodyBgSize;
        document.body.style.backgroundRepeat = originalBodyBgRep;
        document.body.style.animation = originalBodyAnimation;
        document.body.style.color = originalBodyColor;
        document.body.style.fontFamily = originalBodyFontFamily;

        // Restore root properties
        root.style.removeProperty('--theme-bg-color');
        root.style.removeProperty('--theme-header-bg');
        root.style.removeProperty('--theme-border-color');
        root.style.removeProperty('--theme-logo-color');
        root.style.removeProperty('--theme-nav-link-color');
        root.style.removeProperty('--theme-nav-link-hover');
        root.style.removeProperty('--theme-footer-bg');
        root.style.removeProperty('--theme-footer-text');
        root.style.removeProperty('--theme-footer-light-text');
        root.style.removeProperty('--theme-gold-accent');
      };
    }
  }, [memorial]);

  const handleAction = async (type) => {
    if (!memorial?.id) return;
    const res = await Api.performAction(memorial.id, type);
    if (res?.status === 200 && res.payload?.success) {
        if (type === 'flower') {
          setShowFlower(true);
          setMemorial(prev => ({ ...prev, flowerCount: res.payload.counter }));
        } else if (type === 'fatiha') {
          const field = 'fatihaCount';
          setMemorial(prev => ({ ...prev, [field]: res.payload.counter }));
        }
      setInfoModal({ isOpen: true, text: 'Teşekkürler!' });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!memorial?.id) return;
    setIsSubmitting(true);
    const res = await Api.addComment(memorial.id, commentName, commentContent);
    if (res?.status === 200 && res.payload) {
      setInfoModal({ isOpen: true, text: 'Yorum gönderildi! (Onay Bekliyor)' });
      setCommentContent('');
      setCommentName('');
    } else {
      setInfoModal({ isOpen: true, text: 'Yorum gönderilemedi.' });
    }
    setIsSubmitting(false);
  };

  const handleVisitorUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !memorial?.id) return;
    const res = await Api.uploadVisitorMedia(memorial.id, file);
    if (res?.status === 200) setInfoModal({ isOpen: true, text: 'Dosya yüklendi! Onay sonrası görünür olacak.' });
    else setInfoModal({ isOpen: true, text: 'Yükleme başarısız.' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Dijital Anıt', url: window.location.href });
    } else {
      prompt('Bağlantı:', window.location.href);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-light)' }}>Anıt yükleniyor...</div>;
  if (error || !memorial) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-light)' }}>{error}</div>;

  let ex = {};
  try { ex = JSON.parse(memorial.extraData || '{}'); } catch(e) {}

  let imgUrl = 'https://images.unsplash.com/photo-1544813545-48272337f79c?w=600&q=80';
  if (memorial.media) {
    const i = memorial.media.find(x => x.fileType === 'image' && (x.isApproved || isOwner || isPreview));
    if (i) imgUrl = '/uploads/' + i.filePath;
  }

  // Pre-process timelines, works, traits, gallery, audio, comments
  const tlItems = ex.timeline ? ex.timeline.split('\n').filter(l => l.includes(':')) : [];
  const wkItems = ex.works ? ex.works.split('\n').filter(l => l.includes(':')) : [];
  const trItems = ex.traits ? ex.traits.split(',').filter(t => t.trim()) : [];
  const phItems = ex.physical ? ex.physical.split('\n').filter(l => l.includes(':')) : [];
  
  const gallery = memorial.media?.filter(x => ['gallery','visitor_image'].includes(x.fileType) && x.isApproved) || [];
  const yasinAudios = memorial.media?.filter(x => x.fileType === 'audio_yasin' && x.isApproved) || [];
  const fatihaAudios = memorial.media?.filter(x => x.fileType === 'audio_fatiha' && x.isApproved) || [];
  
  const approvedComments = memorial.comments?.filter(c => c.isApproved) || [];

  // Theme override styles specific to Profile Page
  const theme = getTheme(memorial.occupation, memorial.category, memorial.deathCause);
  const isMartyr = memorial.category !== 'egitim_sehitleri' && (
                   theme.themeId === 'sehitler_antigravity' || 
                   memorial.category === 'sehit' || 
                   (memorial.occupation && (memorial.occupation.toLowerCase().includes('şehit') || memorial.occupation.toLowerCase().includes('sehit'))));
  const isDarkTheme = ['sehitler_antigravity', 'sanatci_antigravity', 'kadin_cinayeti_antigravity', 'siyasi_antigravity'].includes(theme.themeId);
  const profileStyle = {
    '--bg-color': theme.bgColor.includes('gradient') ? '#1A0000' : theme.bgColor,
    '--card-bg': theme.cardBg,
    '--text-dark': theme.textDark,
    '--text-main': theme.headingColor || (theme.textDark === '#353834' ? '#4a4f49' : theme.textDark),
    '--text-light': isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : (theme.textDark === '#353834' ? '#70756D' : 'rgba(0, 0, 0, 0.6)'),
    '--accent-color': theme.accentColor,
    '--accent-hover': theme.accentHover,
    '--border-color': theme.borderColor,
    '--gold-accent': theme.goldAccent,
    '--card-shadow': theme.cardShadow,
    '--card-backdrop-filter': theme.cardBackdropFilter || 'none',
    '--image-glow': theme.imageGlow || 'none',
    '--heading-font': theme.headingFont || "'Playfair Display', serif",
    '--body-font': theme.bodyFont || "'Lora', serif",
    '--heading-color': theme.headingColor || 'var(--accent-color)',
    '--banner-bg': theme.bannerBackground || 'var(--accent-color)',
    '--banner-text': theme.bannerText || 'var(--bg-color)',
    '--input-bg': theme.inputBackground || 'var(--bg-color)',
    '--card-radius': theme.cardRadius || '12px',
    '--input-radius': theme.inputRadius || '8px',
    '--btn-radius': theme.btnRadius || '8px',
    '--text-shadow': theme.textShadow || 'none',
    '--line-height': theme.lineHeight || '1.85',
    '--letter-spacing': theme.letterSpacing || 'normal',
    '--wreath-color': theme.themeId === 'sehitler_antigravity' ? '#EAD196' : 'var(--gold-accent)',
    margin: 0, padding: 0, background: 'transparent', fontFamily: "var(--body-font)", color: 'var(--text-dark)', lineHeight: 1.8,
    minHeight: '100vh'
  };

  return (
    <div style={profileStyle}>
      <style>{`
        @keyframes flagWave {
          0% {
            background-position: 0px 0px, center center;
          }
          100% {
            background-position: 800px 0px, center center;
          }
        }
        .info-card {
          border-radius: var(--card-radius, 12px) !important;
          box-shadow: var(--card-shadow) !important;
          transition: all 0.3s ease !important;
        }
        .info-card p, .info-card li {
          line-height: var(--line-height, 1.85) !important;
          letter-spacing: var(--letter-spacing, normal) !important;
        }
        h1, h2, h3, h4 {
          text-shadow: var(--text-shadow, none);
        }
        .btn, .btn-outline {
          border-radius: var(--btn-radius, 8px) !important;
        }
        .info-card input, .info-card textarea {
          border-radius: var(--input-radius, 8px) !important;
        }
        ::placeholder {
          color: var(--text-light) !important;
          opacity: 0.8;
        }
        :-ms-input-placeholder {
          color: var(--text-light) !important;
        }
        ::-ms-input-placeholder {
          color: var(--text-light) !important;
        }
      `}</style>
      {isOwner && (
        <div style={{
          background: 'var(--banner-bg)',
          backdropFilter: 'blur(5px)',
          color: 'var(--banner-text)',
          textAlign: 'center',
          padding: '14px 20px',
          fontWeight: '500',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px',
          borderBottom: '1px solid var(--gold-accent)',
          fontSize: '15px',
          fontFamily: "var(--body-font)",
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
          <span>✨ Bu anıt size ait. Bilgilerde güncelleme yapmak ister misiniz?</span>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{
              background: 'var(--banner-text)',
              color: 'var(--banner-bg)',
              border: 'none',
              padding: '6px 18px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              fontFamily: "var(--body-font)",
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={e => e.target.style.opacity = '0.9'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Anıtı Düzenle
          </button>
        </div>
      )}
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <header className="header" style={{ textAlign: 'center', marginBottom: '40px', width: '100%', paddingTop: '20px', position: 'relative' }}>
          <h1 style={{ fontFamily: "var(--heading-font)", fontSize: '42px', fontWeight: 500, letterSpacing: '2px', margin: '10px 0 5px', color: 'var(--heading-color)', textTransform: 'uppercase' }}>
            {memorial.name.toUpperCase()}
          </h1>
          <p style={{ fontSize: '18px', margin: 0, color: 'var(--text-light)', fontStyle: 'italic' }}>
            <span>{ex.subtitle || ''}</span> <span style={{ marginLeft: '5px' }}>({memorial.birthYear || '?'} - {memorial.deathYear || 'Hayatta'})</span>
          </p>
          <div className="tag-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
            {memorial.occupation && <span className="tag" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', padding: '6px 15px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--accent-color)', fontWeight: 500 }}>Meslek: {memorial.occupation}</span>}
            {ex.zodiac && <span className="tag" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', padding: '6px 15px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--accent-color)', fontWeight: 500 }}>Burcu: {ex.zodiac}</span>}
            {memorial.deathCause && <span className="tag" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', padding: '6px 15px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--accent-color)', fontWeight: 500 }}>Ölüm Nedeni: {memorial.deathCause}</span>}
          </div>
        </header>

        <div className="main-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '40px', width: '100%', alignItems: 'start' }}>
          {/* SIDEBAR */}
          <div className="sidebar-col" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div className="portrait-wrapper" style={{ position: 'relative', margin: '15px 0 20px', padding: '0', background: 'transparent', borderRadius: '12px', boxShadow: 'var(--card-shadow)' }}>
                {showFlower ? <CarnationOverlay flowerCount={1} /> : null}
              <img src={imgUrl} alt={memorial.name} className="portrait" style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
            </div>
            <div style={{ textAlign: 'center', fontSize: '13.5px', color: 'var(--text-light)' }}>
              Fatiha: <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{memorial.fatihaCount || 0}</span> | 
              Çiçek: <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{memorial.flowerCount || 0}</span>
            </div>
            <div className="action-btns" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '5px' }}>
              <div className="row" style={{ display: 'flex', gap: '10px' }}>
                <button className="btn" onClick={() => handleAction('fatiha')} style={{ flex: 1, background: 'var(--accent-color)', color: 'var(--banner-text, #fff)', border: 'none', padding: '12px', borderRadius: '8px', fontFamily: "var(--body-font)", fontSize: '14px', cursor: 'pointer' }}>🤲 Fatiha Oku</button>
                <button className="btn" onClick={() => handleAction('helallik')} style={{ flex: 1, background: 'var(--accent-color)', color: 'var(--banner-text, #fff)', border: 'none', padding: '12px', borderRadius: '8px', fontFamily: "var(--body-font)", fontSize: '14px', cursor: 'pointer' }}>✨ Helallik Ver</button>
              </div>
              <button className="btn btn-outline" onClick={handleShare} style={{ background: 'transparent', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '12px', borderRadius: '8px', fontFamily: "var(--body-font)", fontSize: '14px', cursor: 'pointer' }}>🔗 Paylaş</button>
            </div>
            
            <div className="info-card" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '25px', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ fontFamily: "var(--heading-font)", fontSize: '21px', marginTop: 0, marginBottom: '20px', paddingBottom: '12px', color: 'var(--accent-color)', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>Bakım & Vefa</h3>
              <button className="btn btn-outline" onClick={() => handleAction('flower')} style={{ width: '100%', marginBottom: '10px', background: 'var(--input-bg)', border: 'none', color: 'var(--accent-color)', padding: '12px', borderRadius: '8px' }}>🌷 Çiçek Bırak</button>
              <button className="btn btn-outline" onClick={() => handleAction('dua')} style={{ width: '100%', background: 'var(--input-bg)', border: 'none', color: 'var(--accent-color)', padding: '12px', borderRadius: '8px' }}>📖 Dua Okutma Talebi</button>
            </div>
            
            <div className="info-card" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '25px', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ fontFamily: "var(--heading-font)", fontSize: '21px', marginTop: 0, marginBottom: '20px', paddingBottom: '12px', color: 'var(--accent-color)', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>Dua Kapısı</h3>
              {yasinAudios.length === 0 && fatihaAudios.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-light)', textAlign: 'center', margin: 0 }}>Henüz ses dosyası yüklenmedi.</p>
              ) : (
                <>
                  {yasinAudios.map(x => (
                    <div key={x.id} className="audio-player" style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '12px' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>📖 Yasin Suresi</h4>
                      <audio controls style={{ width: '100%', height: '35px' }}><source src={`/uploads/${x.filePath}`} /></audio>
                    </div>
                  ))}
                  {fatihaAudios.map(x => (
                     <div key={x.id} className="audio-player" style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '12px' }}>
                       <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>📖 Fatiha Suresi</h4>
                       <audio controls style={{ width: '100%', height: '35px' }}><source src={`/uploads/${x.filePath}`} /></audio>
                     </div>
                  ))}
                </>
              )}
            </div>
            
            <div className="info-card" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '25px', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ fontFamily: "var(--heading-font)", fontSize: '21px', marginTop: 0, marginBottom: '20px', paddingBottom: '12px', color: 'var(--accent-color)', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>Ebedi İstirahatgahı</h3>
              {memorial.lat && memorial.lng && (
                <div ref={mapRef} style={{ width: '100%', height: '150px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '15px' }}></div>
              )}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '12px 0', fontSize: '14.5px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-dark)' }}><span style={{ color: 'var(--accent-color)', fontWeight: 600, fontFamily: "var(--heading-font)" }}>Şehir:</span> {memorial.city || ex.grave_city || 'Türkiye'}</li>
                <li style={{ padding: '12px 0', fontSize: '14.5px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-dark)' }}><span style={{ color: 'var(--accent-color)', fontWeight: 600, fontFamily: "var(--heading-font)" }}>Konum:</span> {ex.grave_location || 'Belirtilmedi'}</li>
                {ex.grave_will && (
                  <li style={{ padding: '12px 0', fontSize: '14.5px', borderBottom: 'none', color: 'var(--text-dark)' }}><span style={{ color: 'var(--accent-color)', fontWeight: 600, fontFamily: "var(--heading-font)" }}>Vasiyeti:</span> {ex.grave_will}</li>
                )}
              </ul>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="content-col" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {ex.quote && (
              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--gold-accent)', padding: '10px 20px 30px', marginBottom: '10px' }}>
                <h2 style={{ fontFamily: "var(--heading-font)", color: 'var(--accent-color)', margin: 0, fontSize: '26px' }}>Hatırasına ve Huzuruna</h2>
                <p style={{ fontSize: '17px', fontStyle: 'italic', color: 'var(--text-main)', marginTop: '15px', lineHeight: 1.8 }}>"{ex.quote}"</p>
              </div>
            )}

            {memorial.bio && (
              <div className="info-card" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '35px 40px', boxShadow: 'var(--card-shadow)' }}>
                <h3 style={{ fontFamily: "var(--heading-font)", fontSize: '24px', margin: '0 0 20px 0', paddingBottom: '12px', color: 'var(--accent-color)', borderBottom: '1px solid var(--border-color)' }}>Hayatı ve Mücadelesi</h3>
                <p style={{ textAlign: 'justify', fontSize: '15.5px', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.9 }}>{memorial.bio}</p>
              </div>
            )}

            {tlItems.length > 0 && (
              <div className="info-card" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '30px 40px', boxShadow: 'var(--card-shadow)' }}>
                <h3 style={{ fontFamily: "var(--heading-font)", fontSize: '21px', margin: '0 0 20px 0', paddingBottom: '12px', color: 'var(--accent-color)', borderBottom: '1px solid var(--border-color)' }}>Hayat Kronolojisi</h3>
                <div style={{ borderLeft: '2px solid var(--gold-accent)', paddingLeft: '25px', marginLeft: '5px', marginTop: '20px' }}>
                  {tlItems.map((l, idx) => {
                    const [y, ...r] = l.split(':');
                    return (
                      <div key={idx} style={{ position: 'relative', marginBottom: '25px', fontSize: '15px', color: 'var(--text-main)' }}>
                        <div style={{ position: 'absolute', left: '-32px', top: '6px', width: '10px', height: '10px', background: 'var(--input-bg)', border: '2px solid var(--accent-color)', borderRadius: '50%' }}></div>
                        <span style={{ display: 'inline-block', fontWeight: 600, color: 'var(--banner-text, #fff)', background: 'var(--accent-color)', padding: '2px 10px', borderRadius: '4px', fontSize: '14px', marginBottom: '5px' }}>{y.trim()}</span><br/>
                        {r.join(':').trim()}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {ex.will && (
              <div className="info-card" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', border: '1px solid var(--gold-accent)', borderRadius: '12px', padding: '30px 40px', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}>
                <h3 style={{ fontFamily: "var(--heading-font)", fontSize: '21px', margin: '0 0 20px 0', paddingBottom: '12px', color: 'var(--accent-color)', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>Manevi Vasiyeti</h3>
                <p style={{ fontSize: '15.5px', fontStyle: 'italic', color: 'var(--text-dark)', lineHeight: 1.8 }}>"{ex.will}"</p>
              </div>
            )}

            {wkItems.length > 0 && (
              <div className="info-card" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '25px', boxShadow: 'var(--card-shadow)' }}>
                <h3 style={{ fontFamily: "var(--heading-font)", fontSize: '21px', margin: '0 0 20px 0', paddingBottom: '12px', color: 'var(--accent-color)', borderBottom: '1px solid var(--border-color)' }}>Temel Eserleri</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {wkItems.map((l, idx) => {
                    const [y, ...r] = l.split(':');
                    return (
                      <li key={idx} style={{ padding: '12px 0', fontSize: '14.5px', color: 'var(--text-main)', borderBottom: idx === wkItems.length -1 ? 'none' : '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--accent-color)', fontWeight: 600, fontFamily: "var(--heading-font)" }}>{y.trim()}:</span> {r.join(':').trim()}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {(trItems.length > 0 || phItems.length > 0) && (
              <div className="info-card" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '25px', boxShadow: 'var(--card-shadow)' }}>
                <h3 style={{ fontFamily: "var(--heading-font)", fontSize: '21px', margin: '0 0 20px 0', paddingBottom: '12px', color: 'var(--accent-color)', borderBottom: '1px solid var(--border-color)' }}>Karakter & Fiziksel Panorama</h3>
                {phItems.length > 0 && (
                  <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '10px', listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
                    {phItems.map((l, idx) => {
                      const [y, ...r] = l.split(':');
                      return (
                        <li key={idx} style={{ padding: '8px 0', fontSize: '14px', borderBottom: '1px dashed var(--border-color)', color: 'var(--text-main)' }}>
                          <span style={{ color: 'var(--accent-color)', fontWeight: 600, fontFamily: "var(--heading-font)", display: 'block', fontSize: '13px' }}>{y.trim()}</span> {r.join(':').trim()}
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  {trItems.map((t, i) => (
                    <span key={i} style={{ padding: '5px 12px', background: i % 2 === 0 ? 'rgba(194,182,157,.15)' : 'var(--card-bg)', borderRadius: '15px', border: `1px solid ${i % 2 === 0 ? 'var(--gold-accent)' : 'var(--border-color)'}`, fontSize: i % 2 === 0 ? '14px' : '13px', color: i % 2 === 0 ? 'var(--accent-color)' : 'var(--text-light)', fontWeight: i % 2 === 0 ? 500 : 400 }}>
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(ex.food || ex.flower || ex.sports || ex.movies || ex.scent || ex.museums) && (
              <div className="info-card" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '25px', boxShadow: 'var(--card-shadow)' }}>
                <h3 style={{ fontFamily: "var(--heading-font)", fontSize: '21px', margin: '0 0 20px 0', paddingBottom: '12px', color: 'var(--accent-color)', borderBottom: '1px solid var(--border-color)' }}>En'leri ve Kültürel Pusulası</h3>
                <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '10px', listStyle: 'none', padding: 0, margin: 0 }}>
                  {ex.food && <li style={{ padding: '12px 0', fontSize: '14.5px', borderBottom: 'none', color: 'var(--text-main)' }}><span style={{ color: 'var(--accent-color)', fontWeight: 600, fontFamily: "var(--heading-font)" }}>Yemek:</span> {ex.food}</li>}
                  {ex.flower && <li style={{ padding: '12px 0', fontSize: '14.5px', borderBottom: 'none', color: 'var(--text-main)' }}><span style={{ color: 'var(--accent-color)', fontWeight: 600, fontFamily: "var(--heading-font)" }}>Çiçek:</span> {ex.flower}</li>}
                  {ex.scent && <li style={{ padding: '12px 0', fontSize: '14.5px', borderBottom: 'none', color: 'var(--text-main)' }}><span style={{ color: 'var(--accent-color)', fontWeight: 600, fontFamily: "var(--heading-font)" }}>Koku:</span> {ex.scent}</li>}
                  {ex.sports && <li style={{ padding: '12px 0', fontSize: '14.5px', borderBottom: 'none', color: 'var(--text-main)' }}><span style={{ color: 'var(--accent-color)', fontWeight: 600, fontFamily: "var(--heading-font)" }}>Spor:</span> {ex.sports}</li>}
                  {ex.movies && <li style={{ padding: '12px 0', fontSize: '14.5px', borderBottom: 'none', color: 'var(--text-main)' }}><span style={{ color: 'var(--accent-color)', fontWeight: 600, fontFamily: "var(--heading-font)" }}>Film:</span> {ex.movies}</li>}
                  {ex.museums && <li style={{ padding: '12px 0', fontSize: '14.5px', borderBottom: 'none', color: 'var(--text-main)' }}><span style={{ color: 'var(--accent-color)', fontWeight: 600, fontFamily: "var(--heading-font)" }}>Müze:</span> {ex.museums}</li>}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ARCHIVE */}
        <div style={{ width: '100%', marginTop: '60px', paddingTop: '40px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '150px', height: '1px', background: 'var(--border-color)' }}></div>
          <h2 style={{ textAlign: 'center', fontFamily: "var(--heading-font)", color: 'var(--accent-color)', fontWeight: 600 }}>Dijital Arşiv</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '20px', marginBottom: '30px' }}>
            {gallery.map(x => (
              <img key={x.id} src={`/uploads/${x.filePath}`} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--card-radius, 12px)', border: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => window.open(`/uploads/${x.filePath}`, '_blank')} alt="Archive" />
            ))}
            <div style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', border: '1px dashed var(--gold-accent)', borderRadius: 'var(--card-radius, 12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '13px', cursor: 'pointer', textAlign: 'center', padding: '20px', height: '160px', position: 'relative', color: 'var(--text-light)' }}>
              <span style={{ fontSize: '28px', marginBottom: '8px' }}>📸</span><strong>Ortak Anı Yükle</strong>
              <input type="file" accept="image/*,video/*,audio/*" onChange={handleVisitorUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
            </div>
          </div>
        </div>

        {/* COMMENTS */}
        <div style={{ width: '100%', maxWidth: '900px', paddingTop: '20px' }}>
          <h2 style={{ textAlign: 'center', fontFamily: "var(--heading-font)", color: 'var(--accent-color)', fontWeight: 600 }}>Ziyaretçi Defteri</h2>
          <div className="info-card" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', padding: '30px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <form onSubmit={handleCommentSubmit} noValidate>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="İsminiz (Opsiyonel)" 
                  value={commentName} 
                  onChange={e => setCommentName(sanitizeInput(e.target.value))} 
                  onFocus={() => setCommentNameFocused(true)}
                  onBlur={() => setCommentNameFocused(false)}
                  maxLength={50}
                  autoComplete="off"
                  style={{ 
                    width: '100%', 
                    padding: '15px', 
                    border: commentNameFocused ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', 
                    borderRadius: '8px', 
                    fontFamily: "var(--body-font)", 
                    boxSizing: 'border-box', 
                    marginBottom: '15px', 
                    background: 'var(--input-bg)', 
                    color: 'var(--text-dark)',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }} 
                />
              </div>
              <div style={{ position: 'relative' }}>
                <textarea 
                  placeholder="Hissettiklerinizi, anılarınızı buraya yazabilirsiniz..." 
                  value={commentContent} 
                  onChange={e => setCommentContent(sanitizeInput(e.target.value))} 
                  required 
                  maxLength={1000}
                  onFocus={() => setCommentContentFocused(true)}
                  onBlur={() => setCommentContentFocused(false)}
                  style={{ 
                    width: '100%', 
                    padding: '15px', 
                    border: commentContentFocused ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', 
                    borderRadius: '8px', 
                    fontFamily: "var(--body-font)", 
                    boxSizing: 'border-box', 
                    height: '140px', 
                    resize: 'none', 
                    marginBottom: '15px', 
                    background: 'var(--input-bg)', 
                    color: 'var(--text-dark)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    paddingBottom: '30px'
                  }}
                ></textarea>
                <div style={{
                  position: 'absolute',
                  bottom: '25px',
                  right: '15px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: commentContent.length >= 950 ? (commentContent.length >= 980 ? '#FF6B6B' : 'var(--gold-accent, #D4AF37)') : 'var(--text-light)',
                  transition: 'color 0.3s ease',
                  pointerEvents: 'none',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                }}>
                  {commentContent.length}/1000
                </div>
              </div>
              <button 
                type="submit" 
                className="btn" 
                style={{ 
                  width: '100%', 
                  fontSize: '16px', 
                  background: 'var(--accent-color)', 
                  color: 'var(--banner-text, #fff)', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  fontFamily: "var(--body-font)", 
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </form>
          </div>
          <div className="info-card" style={{ background: 'var(--card-bg)', backdropFilter: 'var(--card-backdrop-filter)', padding: '30px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            {approvedComments.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>Ziyaretçi defterine henüz mesaj bırakılmadı. İlk anıyı siz bırakabilirsiniz.</p>
            ) : (
              approvedComments.map(c => (
                <div key={c.id} style={{ padding: '25px 0', borderBottom: '1px solid var(--border-color)', fontSize: '15px', color: 'var(--text-dark)' }}>
                  <strong style={{ color: 'var(--accent-color)', fontFamily: "var(--heading-font)", fontSize: '17px' }}>{c.commenterName}</strong> 
                  <span style={{ fontSize: '13px', color: 'var(--text-light)', marginLeft: '5px' }}>({c.createdAt ? new Date(c.createdAt).toLocaleDateString('tr-TR') : ''})</span><br/>
                  <p style={{ margin: '10px 0 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{c.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TECH SERVICES */}
        <div style={{ width: '100%', marginTop: '60px', paddingTop: '40px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '150px', height: '1px', background: 'var(--border-color)' }}></div>
          <h2 style={{ textAlign: 'center', fontFamily: "var(--heading-font)", color: 'var(--accent-color)', fontWeight: 600 }}>İleri Teknolojik Hizmetler</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '25px' }}>
            <div 
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ 
                background: 'var(--card-bg)', 
                backdropFilter: 'var(--card-backdrop-filter)', 
                padding: '30px 25px', 
                borderRadius: '12px', 
                border: hoveredCard === 0 ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', 
                position: 'relative', 
                boxShadow: hoveredCard === 0 ? '0 0 15px var(--accent-color)' : 'var(--card-shadow)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--gold-accent)', opacity: 0.6 }}></div>
              <h4 style={{ fontSize: '26px', marginBottom: '5px', opacity: ex.ai_voice_active ? 1 : 0.3, margin: 0, color: 'var(--accent-color)', fontFamily: "var(--heading-font)" }}>🤖</h4>
              <h4 style={{ opacity: ex.ai_voice_active ? 1 : 0.3, margin: '0 0 10px', color: 'var(--accent-color)', fontFamily: "var(--heading-font)", fontSize: '19px' }}>Yapay Zeka Ses Arşivi</h4>
              <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-light)' }}>Ses kayıtlarından kurgulanan semantik arama bankası.</p>
            </div>
            <div 
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ 
                background: 'var(--card-bg)', 
                backdropFilter: 'var(--card-backdrop-filter)', 
                padding: '30px 25px', 
                borderRadius: '12px', 
                border: hoveredCard === 1 ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', 
                position: 'relative', 
                boxShadow: hoveredCard === 1 ? '0 0 15px var(--accent-color)' : 'var(--card-shadow)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--gold-accent)', opacity: 0.6 }}></div>
              <h4 style={{ fontSize: '26px', marginBottom: '5px', opacity: ex.ar_enabled ? 1 : 0.3, margin: 0, color: 'var(--accent-color)', fontFamily: "var(--heading-font)" }}>📱</h4>
              <h4 style={{ opacity: ex.ar_enabled ? 1 : 0.3, margin: '0 0 10px', color: 'var(--accent-color)', fontFamily: "var(--heading-font)", fontSize: '19px' }}>AR Teknolojisi</h4>
              <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-light)' }}>Kabri ziyaret edenlerin dijital silueti görme teknolojisi.</p>
            </div>
            <div 
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ 
                background: 'var(--card-bg)', 
                backdropFilter: 'var(--card-backdrop-filter)', 
                padding: '30px 25px', 
                borderRadius: '12px', 
                border: hoveredCard === 2 ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', 
                position: 'relative', 
                boxShadow: hoveredCard === 2 ? '0 0 15px var(--accent-color)' : 'var(--card-shadow)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--gold-accent)', opacity: 0.6 }}></div>
              <h4 style={{ fontSize: '26px', marginBottom: '5px', opacity: ex.auto_anniversary_sms ? 1 : 0.3, margin: 0, color: 'var(--accent-color)', fontFamily: "var(--heading-font)" }}>⚙️</h4>
              <h4 style={{ opacity: ex.auto_anniversary_sms ? 1 : 0.3, margin: '0 0 10px', color: 'var(--accent-color)', fontFamily: "var(--heading-font)", fontSize: '19px' }}>Yıldönümü Otomasyonu</h4>
              <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-light)' }}>Her yıl otomatik hatırlatma ve fatiha bildirimi.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Information Modal */}
      {infoModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
        }}>
          <div style={{
            background: 'var(--card-bg)', color: 'var(--text-dark)',
            padding: '40px 50px', borderRadius: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            textAlign: 'center', maxWidth: '400px', width: '90%',
            border: '1px solid var(--gold-accent)'
          }}>
            <p style={{ marginBottom: '30px', fontSize: '18px', fontWeight: '500', color: 'var(--accent-color)', lineHeight: 1.6 }}>{infoModal.text}</p>
            <button 
              className="btn" 
              style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px' }}
              onClick={() => setInfoModal({ isOpen: false, text: '' })}
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
