package com.dijitalanit.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.dijitalanit.handler.AuthEntryPoint;
import com.dijitalanit.jwt.JWTAuthenticationFilter;

/**
 * Spring Security Konfigürasyonu — Production-Ready Güvenlik Ayarları
 * 
 * Güvenlik Başlıkları:
 * - X-Frame-Options: DENY (Clickjacking koruması)
 * - X-Content-Type-Options: nosniff (MIME-type sniffing koruması)
 * - X-XSS-Protection: 1; mode=block (Legacy XSS koruması)
 * - Content-Security-Policy: frame-ancestors 'none' (Modern Clickjacking koruması)
 * 
 * CORS: Sadece uygulamanın kendi domain'inden gelen isteklere izin verilir.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

	public static final String REGISTER = "/rest/api/auth/register";
	public static final String AUTHENTICATE = "/rest/api/auth/authenticate";
	public static final String REFRESH_TOKEN = "/rest/api/auth/refresh-token";

	@Autowired
	private AuthenticationProvider authenticationProvider;

	@Autowired
	private JWTAuthenticationFilter jwtAuthenticationFilter;

	@Autowired
	private AuthEntryPoint authEntryPoint;

	/**
	 * İzin verilen origin'ler. Production'da application.properties'ten okunur:
	 * app.cors.allowed-origins=https://dijitalanit.com
	 * 
	 * Default olarak development ortamı için localhost:5173 aktiftir.
	 */
	@Value("${app.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}")
	private String[] allowedOrigins;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
			// ── CORS Konfigürasyonu ──
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))

			// ── CSRF devre dışı (JWT kullandığımız için) ──
			.csrf(csrf -> csrf.disable())

			// ── GÜVENLİK BAŞLIKLARI ──
			.headers(headers -> headers
				// Clickjacking koruması: Sayfanın iframe içinde yüklenmesini engeller
				.frameOptions(frame -> frame.deny())
				// MIME-type sniffing koruması
				.contentTypeOptions(content -> {})
				// Legacy XSS koruması (modern tarayıcılar için ek güvenlik)
				.xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
				// Content-Security-Policy: frame-ancestors 'none' (modern clickjacking koruması)
				.contentSecurityPolicy(csp -> csp.policyDirectives("frame-ancestors 'none'"))
			)

			// ── YETK\u0130LEND\u0130RME KURALLARI ──
			.authorizeHttpRequests(request -> request
				// Statik frontend dosyaları herkese açık (HTML, CSS, JS, images)
				.requestMatchers("/", "/index.html", "/assets/**", "/pages/**", "/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()
				// Auth endpointleri herkese açık
				.requestMatchers(REGISTER, AUTHENTICATE, REFRESH_TOKEN, "/rest/api/auth/send-2fa", "/rest/api/auth/verify-2fa").permitAll()
				// Public endpointler (Python'daki /, /profile/<slug>, /api/search_memorial, /api/stats, /istatistikler)
				.requestMatchers(HttpMethod.GET, "/rest/api/public/**").permitAll()
				// Etkileşim endpointleri (fatiha, çiçek vb.) herkese açık
				.requestMatchers(HttpMethod.POST, "/rest/api/interaction/**").permitAll()
				// Yorum ekleme herkese açık
				.requestMatchers(HttpMethod.POST, "/rest/api/comment/**").permitAll()
				// Ziyaretçi medya yükleme herkese açık
				.requestMatchers(HttpMethod.POST, "/rest/api/visitor-media/**").permitAll()
				// QR code herkese açık
				.requestMatchers(HttpMethod.GET, "/rest/api/qr/**").permitAll()
				// Dosya servisi (görseller) herkese açık
				.requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
				// Geri kalan her şey authentication gerektirir
				.anyRequest().authenticated()
			)
			.exceptionHandling(ex -> ex.authenticationEntryPoint(authEntryPoint))
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authenticationProvider(authenticationProvider)
			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	/**
	 * CORS Konfigürasyonu — Sadece belirtilen origin'lerden gelen isteklere izin verir.
	 * 
	 * Production'da sadece uygulamanın kendi domain'i (dijitalanit.com) izin verilir.
	 * Geliştirme ortamında localhost:5173 ve 127.0.0.1:5173 eklenir.
	 * 
	 * Wildcard (*) ASLA kullanılmaz — güvenlik açığı yaratır.
	 */
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		
		// Sadece uygulamanın kendi domain'lerinden gelen isteklere izin ver
		configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
		
		// Sadece gerekli HTTP metotlarına izin ver
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		
		// İzin verilen header'lar — sadece gerekli olanlar
		configuration.setAllowedHeaders(Arrays.asList(
			"Authorization", "Content-Type", "Cache-Control", "Accept", "X-Requested-With"
		));
		
		// Tarayıcının credential (cookie, auth header) göndermesine izin ver
		configuration.setAllowCredentials(true);
		
		// Preflight cache süresi (saniye) — gereksiz OPTIONS isteklerini azaltır
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}
