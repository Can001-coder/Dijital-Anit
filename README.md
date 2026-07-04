# Dijital Anıt — Memorial Platform

Dijital Anıt, anma sayfaları oluşturmak ve paylaşmak için geliştirilmiş bir web platformudur.

## Proje Yapısı

```
dijital-anit/
├── backend/          ← Spring Boot (Java 17) backend
│   ├── pom.xml
│   ├── uploads/      ← Kullanıcı dosyaları (images, audio, video)
│   └── src/
│       ├── main/
│       │   ├── java/com/dijitalanit/   ← Java kaynak kodu
│       │   └── resources/
│       │       ├── application.properties
│       │       └── static/             ← Frontend build çıktısı
│       └── test/
│
├── frontend/         ← React + Vite frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── api.js
│       ├── main.jsx
│       ├── components/
│       ├── data/
│       └── pages/
│
└── README.md
```

## Geliştirme Ortamı

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
# veya
mvn spring-boot:run
```

Backend varsayılan olarak `http://localhost:8080` üzerinde çalışır.

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend geliştirme sunucusu varsayılan olarak `http://localhost:5173` üzerinde çalışır.
API istekleri otomatik olarak `http://localhost:8080` adresine proxy edilir.

### Production Build

Frontend'in production build'ini almak ve backend'e entegre etmek için:

```bash
cd frontend
npm run build
```

Build çıktısı otomatik olarak `backend/src/main/resources/static/` dizinine yazılır.

## Teknolojiler

| Katman   | Teknoloji                          |
|----------|------------------------------------|
| Frontend | React 18, Vite, React Router, Chart.js, Leaflet |
| Backend  | Spring Boot 3.3, Spring Security, JPA/Hibernate |
| Database | PostgreSQL                         |
| Auth     | JWT (jjwt)                         |
