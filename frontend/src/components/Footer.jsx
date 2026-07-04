import React from 'react';
import { Link } from 'react-router-dom';

const Footer = React.memo(() => {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-col">
          <h4>Dijital Anıt</h4>
          <p>Sevdiklerinizin mirasını zamanın ötesine taşıyan, zarif ve güvenilir bir dijital arşiv platformu.</p>
        </div>
        <div className="footer-col">
          <h4>Hızlı Bağlantılar</h4>
          <ul>
            <li><Link to="/">Ana Sayfa</Link></li>
            <li><a href="/#search">Anıt Bul</a></li>
            <li><Link to="/register">Yeni Anıt Oluştur</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Yasal</h4>
          <ul>
            <li><a href="#">Kullanım Koşulları</a></li>
            <li><a href="#">Gizlilik Politikası</a></li>
            <li><a href="#">KVKK Aydınlatma Metni</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>İletişim</h4>
          <ul>
            <li><a href="mailto:info@dijitalanit.com">info@dijitalanit.com</a></li>
            <li><p>İstanbul, Türkiye</p></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Dijital Anıt. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
});

export default Footer;
