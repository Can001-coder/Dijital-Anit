import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Doughnut, Line, Bar } from 'react-chartjs-2';
import Api from '../api';
import { sanitizeInput } from '../utils/sanitize';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const bgColors = ['rgba(142,145,113,.8)','rgba(180,162,134,.8)','rgba(107,112,92,.8)','rgba(231,76,60,.8)','rgba(52,152,219,.8)','rgba(241,196,15,.8)'];

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ gender: '', category: '', city: '', cause: '' });

  const fetchStats = useCallback(async () => {
    const d = await Api.getStats(filters);
    if (d?.status === 200 && d.payload) {
      setStats(d.payload);
    }
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFilter = () => {
    fetchStats();
  };

  const getChartData = (label, dataObj, customColors) => ({
    labels: dataObj ? Object.keys(dataObj) : [],
    datasets: [{
      label,
      data: dataObj ? Object.values(dataObj) : [],
      backgroundColor: customColors || bgColors,
      borderWidth: 0
    }]
  });

  return (
    <div className="admin-wrapper fade-in" style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px' }}>
      <div className="admin-header-v2">
        <h2 style={{ fontSize: '32px' }}>📊 Dijital Hafıza Paneli & İstatistikler</h2>
        <p>Detaylı toplumsal ve demografik analizler.</p>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,.03)', marginTop: '30px', display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Cinsiyet</label>
          <select value={filters.gender} onChange={e => setFilters(p => ({...p, gender: e.target.value}))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <option value="">Tümü</option><option value="Erkek">Erkek</option><option value="Kadın">Kadın</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Kategori</label>
          <select value={filters.category} onChange={e => setFilters(p => ({...p, category: e.target.value}))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <option value="">Tümü</option>
            <option value="sehit">Şehitler</option>
            <option value="kadin_cinayeti">Kadın Cinayetleri</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Şehir</label>
          <input type="text" placeholder="Şehir seçin..." value={filters.city} onChange={e => setFilters(p => ({...p, city: sanitizeInput(e.target.value)}))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
        </div>
        <button onClick={handleFilter} className="btn" style={{ background: 'var(--accent-color)', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Filtrele</button>
      </div>

      <div className="admin-stats-row" style={{ marginTop: '30px' }}>
        <div className="stat-card" style={{ flex: 1 }}><div className="st-icon">👥</div><div className="st-data"><h4>{stats?.totalMemorials || 0}</h4><p>Bulunan Kayıt</p></div></div>
        <div className="stat-card" style={{ flex: 1 }}><div className="st-icon">⏳</div><div className="st-data"><h4>{stats?.averageAge > 0 ? stats.averageAge : '-'}</h4><p>Ortalama Yaş</p></div></div>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)', gap: '40px', marginTop: '40px' }}>
        <div className="admin-card" style={{ padding: '20px' }}>
          <h3 style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginTop: 0 }}>Cinsiyet Dağılımı</h3>
          {stats?.genders && <Pie data={getChartData('Cinsiyet', stats.genders, ['#3498db','#e74c3c','#95a5a6'])} />}
        </div>
        <div className="admin-card" style={{ padding: '20px' }}>
          <h3 style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginTop: 0 }}>Kategori Payı</h3>
          {stats?.categories && <Doughnut data={getChartData('Kategori', stats.categories)} />}
        </div>
        <div className="admin-card" style={{ padding: '20px' }}>
          <h3 style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginTop: 0 }}>Vefat Nedenleri</h3>
          {stats?.causes && <Pie data={getChartData('Vefat Nedeni', stats.causes)} />}
        </div>
        <div className="admin-card" style={{ padding: '20px', gridColumn: 'span 2' }}>
          <h3 style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginTop: 0 }}>Vefat Yılı Trendi</h3>
          {stats?.trend && <Line data={getChartData('Trend', stats.trend, ['rgba(231,76,60,1)'])} />}
        </div>
        <div className="admin-card" style={{ padding: '20px', gridColumn: 'span 2' }}>
          <h3 style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginTop: 0 }}>Meslek & Yaş Korelasyonu</h3>
          {stats?.occupationsAge && <Bar data={{...getChartData('Meslek Yaş', stats.occupationsAge, [bgColors[0]]), datasets: [{...getChartData('Meslek Yaş', stats.occupationsAge, [bgColors[0]]).datasets[0], borderRadius: 4}]}} options={{ indexAxis: 'y' }} />}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
