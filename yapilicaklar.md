# Yapılacaklar

## 1. 📧 Mail Entegrasyonu — Yıl Dönümü Maili

- [ ] Kullanıcıların anma yıl dönümlerini takip eden bir zamanlayıcı (scheduler) servisi oluştur
- [ ] Yıl dönümü yaklaştığında (örn. 1 gün önce) kayıtlı kullanıcılara otomatik hatırlatma maili gönder
- [ ] Mail şablonu tasarla (HTML e-mail template)
- [ ] `application.properties` içindeki mail konfigürasyonunu aktif et (SMTP ayarları)
- [ ] Kullanıcıların mail bildirim tercihlerini yönetebileceği bir ayar ekle (opt-in/opt-out)
- [ ] Vefat tarihi bilgisinden yıl dönümünü otomatik hesapla

---

## 2. 🎨 Kişisel Sayfa Tasarım Optimizasyonu — Mesleğe Özel Temalar

Anıt sayfasının arka planı ve tasarımı, kişinin mesleğine/uzmanlık alanına göre özelleştirilecek.

**Örnekler:**
- **Hukukçu** → Arka planda hukuk temalı web tasarımı (terazi, kitaplar, adalet sembolleri)
- **Doktor** → Tıp temalı tasarım (stetoskop, tıbbi semboller)
- **Öğretmen** → Eğitim temalı tasarım
- **Mühendis** → Mühendislik temalı tasarım
- **Sanatçı** → Sanat temalı tasarım
- **Kadın Cinayetleri** → Kadına yönelik şiddete dikkat çeken, hüzünlü ve saygı uyandıran tasarım
- **Siyasetçi** → Siyaset temalı tasarım

### Alt Görevler
- [x] Desteklenecek meslek kategorilerini belirle
- [x] Her meslek için arka plan görselleri / SVG pattern'leri tasarla
- [x] Memorial modelinde meslek/uzmanlık alanı field'ı ekle (varsa kontrol et)
- [x] `ProfilePage.jsx` bileşeninde mesleğe göre dinamik tema uygulama mantığı
- [x] CSS tema değişkenleri oluştur (renk paleti, arka plan, aksan renkleri)
- [x] Dashboard'da kullanıcının meslek seçimi yapabilmesi için UI ekle
- [x] Anıt ekleme aşamaları input alanlarını düzenle ve zorunlu alan uyarılarını ekle

---

## 3. 🗺️ Harita Entegrasyonu — NFC ile İşaretlenmiş Mezar Gösterimi

NFC etiketleriyle işaretlenmiş mezarların Google Maps üzerinde interaktif gösterimi.

### Alt Görevler
- [ ] Backend'e mezar konum bilgisi (latitude, longitude) kaydetme endpoint'i ekle
- [ ] Memorial modeline GPS koordinat alanları ekle (`latitude`, `longitude`)
- [ ] NFC etiket ID'si ile memorial eşleştirme mekanizması
- [ ] Google Maps API entegrasyonu (veya mevcut Leaflet haritasını genişlet)
- [ ] Harita üzerinde mezar konumlarını pin/marker ile göster
- [ ] Pin'e tıklandığında kişinin anıt sayfasına yönlendirme
- [ ] Filtreleme özellikleri (şehir, ilçe, mezarlık bazlı)
- [ ] Kümeleme (clustering) — çok fazla pin olduğunda performans için
- [ ] Mobil uyumlu harita görünümü

---

## Öncelik Sırası

| # | Özellik | Öncelik | Tahmini Zorluk |
|---|---------|---------|----------------|
| 1 | Mail Entegrasyonu | 🔴 Yüksek | Orta |
| 2 | Mesleğe Özel Tema | 🟡 Orta | Orta |
| 3 | Harita + NFC | 🔴 Yüksek | Yüksek |
