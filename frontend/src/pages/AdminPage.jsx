import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Api from '../api';
import { showFlash } from '../components/FlashMessage';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [adminData, setAdminData] = useState(null);

  const loadAdmin = useCallback(async () => {
    const d = await Api.getAdminDashboard();
    if (d?.status === 200 && d.payload) {
      setAdminData(d.payload);
    } else {
      showFlash('Admin verisi yüklenemedi veya yetkiniz yok.', 'error');
    }
  }, []);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  const doAction = async (action, id) => {
    let res;
    if (action === 'approve') res = await Api.approveMemorial(id);
    else if (action === 'reject') res = await Api.rejectMemorial(id);
    else if (action === 'pending') res = await Api.pendingMemorial(id);
    
    if (res?.status === 200) {
      showFlash(res.payload || 'İşlem başarılı', 'success');
      loadAdmin();
    } else {
      showFlash('İşlem başarısız', 'error');
    }
  };

  const doMediaAction = async (action, mediaId) => {
    const res = await Api.moderate('media', mediaId, action);
    if (res?.status === 200) {
      showFlash('Medya işlemi başarılı', 'success');
      loadAdmin();
    } else {
      showFlash('İşlem başarısız', 'error');
    }
  };

  const doCommentAction = async (action, commentId) => {
    const res = await Api.moderate('comment', commentId, action);
    if (res?.status === 200) {
      showFlash('Yorum işlemi başarılı', 'success');
      loadAdmin();
    } else {
      showFlash('İşlem başarısız', 'error');
    }
  };

  const renderCard = (m, isPending) => {
    let imgH = <div className="acard-img-placeholder">Resim Yok</div>;
    if (m.media) {
      const img = m.media.find(x => x.fileType === 'image');
      if (img) imgH = <img src={`/uploads/${img.filePath}`} alt="Profil" className="acard-img" />;
    }
    const badge = isPending ? <span className="badge badge-pending">Beklemede</span> : <span className="badge badge-approved">Yayında</span>;

    return (
      <div key={m.id} className="admin-card">
        <div className="acard-header">
          {imgH}
          <div className="acard-titles">
            <h3>{m.name}</h3>{badge}
          </div>
        </div>
        <div className="acard-body">
          <p><strong>Slug:</strong> /profile/{m.slug}</p>
          <p><strong>Kullanıcı:</strong> #{m.userId}</p>
          <p><strong>Konum:</strong> {m.city || '-'} / {m.district || '-'}</p>
          <p><strong>Kategori:</strong> {m.category || '-'}</p>
          <hr />
          <p className="acard-bio">{(m.bio || '').substring(0, 120)}...</p>
        </div>
        <div className="acard-footer" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', padding: '15px', background: '#f9f9f9' }}>
          {isPending ? (
            <>
              <Link to={`/profile?slug=${m.slug}&preview=true`} className="btn" style={{ background: '#5ba4a4', color: 'white', textAlign: 'center', padding: '10px', fontSize: '13px', textDecoration: 'none', borderRadius: '8px' }}>👁️ ÖNİZLE</Link>
              <button onClick={() => doAction('approve', m.id)} className="btn" style={{ background: '#3ac162', color: 'white', padding: '10px', fontSize: '13px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✔️ ONAYLA</button>
              <button onClick={() => doAction('reject', m.id)} className="btn" style={{ background: '#e74c3c', color: 'white', padding: '10px', fontSize: '13px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>❌ REDDET</button>
            </>
          ) : (
            <>
              <Link to={`/profile?slug=${m.slug}`} className="btn" style={{ background: '#5ba4a4', color: 'white', textAlign: 'center', padding: '10px', fontSize: '13px', textDecoration: 'none', borderRadius: '8px' }}>👁️ GÖRÜNTÜLE</Link>
              <button onClick={() => doAction('reject', m.id)} className="btn" style={{ background: '#e74c3c', color: 'white', padding: '10px', fontSize: '13px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>⛔ KALDIR</button>
              <button onClick={() => doAction('pending', m.id)} className="btn" style={{ background: '#f39c12', color: 'white', padding: '10px', fontSize: '13px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>🔄 ONAYA ÇEK</button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderMediaCard = (media) => {
    const isImage = media.fileType && media.fileType.includes('image');
    const isVideo = media.fileType && media.fileType.includes('video');
    const isAudio = media.fileType && media.fileType.includes('audio');

    return (
      <div key={media.id} className="admin-card" style={{ borderTop: '3px solid #e67e22' }}>
        <div className="acard-header" style={{ background: '#fff8f0' }}>
          {isImage ? (
            <img
              src={`/uploads/${media.filePath}`}
              alt="Medya"
              className="acard-img"
              style={{ objectFit: 'cover' }}
            />
          ) : isVideo ? (
            <div className="acard-img-placeholder" style={{ background: '#2c3e50', color: '#fff' }}>🎬 Video</div>
          ) : isAudio ? (
            <div className="acard-img-placeholder" style={{ background: '#8e44ad', color: '#fff' }}>🎵 Ses</div>
          ) : (
            <div className="acard-img-placeholder">📁 Dosya</div>
          )}
          <div className="acard-titles">
            <h3 style={{ fontSize: '14px' }}>Medya #{media.id}</h3>
            <span className="badge badge-pending">Onay Bekliyor</span>
          </div>
        </div>
        <div className="acard-body">
          <p><strong>Tür:</strong> {media.fileType || '-'}</p>
          <p><strong>Kaynak:</strong> {media.source === 'visitor' ? '👤 Ziyaretçi' : '👑 Sahip'}</p>
          <p><strong>Anıt ID:</strong> #{media.memorialId}</p>
          <p style={{ wordBreak: 'break-all', fontSize: '12px', color: '#888' }}>{media.filePath}</p>
          {isImage && (
            <a href={`/uploads/${media.filePath}`} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#5ba4a4' }}>
              🔍 Tam Boyut Görüntüle
            </a>
          )}
          {isAudio && (
            <audio controls style={{ width: '100%', marginTop: '8px' }}>
              <source src={`/uploads/${media.filePath}`} />
            </audio>
          )}
          {isVideo && (
            <video controls style={{ width: '100%', marginTop: '8px', maxHeight: '150px' }}>
              <source src={`/uploads/${media.filePath}`} />
            </video>
          )}
        </div>
        <div className="acard-footer" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '15px', background: '#fff8f0' }}>
          <button
            onClick={() => doMediaAction('approve', media.id)}
            className="btn"
            style={{ background: '#3ac162', color: 'white', padding: '10px', fontSize: '13px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            ✔️ ONAYLA
          </button>
          <button
            onClick={() => doMediaAction('reject', media.id)}
            className="btn"
            style={{ background: '#e74c3c', color: 'white', padding: '10px', fontSize: '13px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            ❌ SİL
          </button>
        </div>
      </div>
    );
  };

  const renderCommentCard = (comment) => {
    return (
      <div key={comment.id} className="admin-card" style={{ borderTop: '3px solid #8e44ad' }}>
        <div className="acard-header" style={{ background: '#f9f0ff' }}>
          <div className="acard-img-placeholder" style={{ background: '#8e44ad', color: '#fff', fontSize: '28px' }}>💬</div>
          <div className="acard-titles">
            <h3 style={{ fontSize: '14px' }}>{comment.commenterName || 'Anonim'}</h3>
            <span className="badge badge-pending">Onay Bekliyor</span>
          </div>
        </div>
        <div className="acard-body">
          <p><strong>Anıt ID:</strong> #{comment.memorialId}</p>
          <p><strong>Tarih:</strong> {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</p>
          <hr />
          <p style={{ fontStyle: 'italic', color: '#444', lineHeight: 1.6 }}>"{comment.content}"</p>
        </div>
        <div className="acard-footer" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '15px', background: '#f9f0ff' }}>
          <button
            onClick={() => doCommentAction('approve', comment.id)}
            className="btn"
            style={{ background: '#3ac162', color: 'white', padding: '10px', fontSize: '13px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            ✔️ ONAYLA
          </button>
          <button
            onClick={() => doCommentAction('reject', comment.id)}
            className="btn"
            style={{ background: '#e74c3c', color: 'white', padding: '10px', fontSize: '13px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            ❌ SİL
          </button>
        </div>
      </div>
    );
  };

  const pending = adminData?.pendingMemorials || [];
  const approved = adminData?.approvedMemorials || [];
  const pendingMedia = adminData?.pendingMedia || [];
  const pendingComments = adminData?.pendingComments || [];
  const totalInteractions = (adminData?.totalFatiha || 0) + (adminData?.totalFlower || 0) + (adminData?.totalDua || 0) + (adminData?.totalHelallik || 0);

  return (
    <div className="admin-wrapper fade-in">
      <div className="admin-header-v2">
        <h2>Yönetim Üssü</h2>
        <p>Sistem genelindeki istatistikleri ve anıtları yönetin.</p>
        <div style={{ marginTop: '20px' }}>
          <Link to="/stats" className="btn" style={{ backgroundColor: 'var(--accent-color)', color: 'white', fontSize: '16px', padding: '12px 30px', textDecoration: 'none' }}>📊 İstatistikleri Görüntüle</Link>
        </div>
      </div>

      <div className="admin-stats-row">
        <div className="stat-card stat-pending"><div className="st-icon">⏳</div><div className="st-data"><h4>{pending.length}</h4><p>Onay Bekleyen Anıt</p></div></div>
        <div className="stat-card stat-approved"><div className="st-icon">✅</div><div className="st-data"><h4>{approved.length}</h4><p>Yayındaki Anıt</p></div></div>
        <div className="stat-card stat-users" style={{ borderTop: '4px solid #e67e22' }}><div className="st-icon">📸</div><div className="st-data"><h4>{pendingMedia.length}</h4><p>Bekleyen Medya</p></div></div>
        <div className="stat-card stat-interactions" style={{ borderTop: '4px solid #8e44ad' }}><div className="st-icon">💬</div><div className="st-data"><h4>{pendingComments.length}</h4><p>Bekleyen Yorum</p></div></div>
        <div className="stat-card stat-users"><div className="st-icon">👥</div><div className="st-data"><h4>{adminData?.totalUsers || 0}</h4><p>Kayıtlı Kullanıcı</p></div></div>
        <div className="stat-card stat-interactions"><div className="st-icon">🌸</div><div className="st-data"><h4>{totalInteractions}</h4><p>Toplam Etkileşim</p></div></div>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          ⏳ Onay Bekleyen Anıtlar {pending.length > 0 && <span style={{ background: '#e74c3c', color: '#fff', borderRadius: '50%', padding: '1px 7px', fontSize: '12px', marginLeft: '6px' }}>{pending.length}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>✅ Yayındaki Anıtlar</button>
        <button className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
          📸 Bekleyen Medyalar {pendingMedia.length > 0 && <span style={{ background: '#e67e22', color: '#fff', borderRadius: '50%', padding: '1px 7px', fontSize: '12px', marginLeft: '6px' }}>{pendingMedia.length}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
          💬 Bekleyen Yorumlar {pendingComments.length > 0 && <span style={{ background: '#8e44ad', color: '#fff', borderRadius: '50%', padding: '1px 7px', fontSize: '12px', marginLeft: '6px' }}>{pendingComments.length}</span>}
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="tab-content">
          {pending.length ? <div className="admin-grid">{pending.map(m => renderCard(m, true))}</div> : <div className="empty-state"><div className="empty-icon">🎉</div><p>Onay bekleyen anıt bulunmuyor.</p></div>}
        </div>
      )}
      
      {activeTab === 'approved' && (
        <div className="tab-content">
          {approved.length ? <div className="admin-grid">{approved.map(m => renderCard(m, false))}</div> : <div className="empty-state"><p>Henüz yayında anıt bulunmuyor.</p></div>}
        </div>
      )}

      {activeTab === 'media' && (
        <div className="tab-content">
          {pendingMedia.length > 0 ? (
            <>
              <div style={{ background: '#fff3e0', border: '1px solid #e67e22', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px', fontSize: '14px', color: '#7c4a00' }}>
                ℹ️ Ziyaretçilerin anıta yüklediği fotoğraf, video ve ses dosyaları burada listelenir. Onayladığınızda anıt sayfasında görünür hale gelir.
              </div>
              <div className="admin-grid">{pendingMedia.map(m => renderMediaCard(m))}</div>
            </>
          ) : (
            <div className="empty-state"><div className="empty-icon">📸</div><p>Onay bekleyen medya dosyası bulunmuyor.</p></div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="tab-content">
          {pendingComments.length > 0 ? (
            <>
              <div style={{ background: '#f3e5f5', border: '1px solid #8e44ad', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px', fontSize: '14px', color: '#4a0080' }}>
                ℹ️ Ziyaretçilerin bıraktığı yorumlar burada listelenir. Onayladığınızda anıt sayfasında görünür hale gelir.
              </div>
              <div className="admin-grid">{pendingComments.map(c => renderCommentCard(c))}</div>
            </>
          ) : (
            <div className="empty-state"><div className="empty-icon">💬</div><p>Onay bekleyen yorum bulunmuyor.</p></div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
