package com.dijitalanit.controller.impl;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.dijitalanit.controller.IRestMemorialController;
import com.dijitalanit.controller.RestBaseController;
import com.dijitalanit.controller.RootEntity;
import com.dijitalanit.dto.DtoMemorial;
import com.dijitalanit.dto.DtoMemorialIU;
import com.dijitalanit.dto.MemorialCreateDto;
import com.dijitalanit.dto.SearchResultDto;
import com.dijitalanit.model.User;
import com.dijitalanit.repository.UserRepository;
import com.dijitalanit.service.IMemorialService;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
public class RestMemorialControllerImpl extends RestBaseController implements IRestMemorialController {

	@Autowired
	private IMemorialService memorialService;

	@Autowired
	private UserRepository userRepository;

	// ==================== RATE LIMITING (Bucket4j) ====================
	// IP bazlı rate limiter: Dakikada maksimum 3 istek
	private final Map<String, Bucket> rateLimitBuckets = new ConcurrentHashMap<>();

	/**
	 * Her IP adresi için ayrı bir Bucket oluşturur.
	 * Greedy refill: Dakikada 10 token yenilenir.
	 */
	private Bucket resolveBucket(String ip) {
		return rateLimitBuckets.computeIfAbsent(ip, k ->
			Bucket.builder()
				.addLimit(Bandwidth.classic(10, Refill.greedy(10, Duration.ofMinutes(1))))
				.build()
		);
	}

	/**
	 * İstemcinin gerçek IP adresini belirler.
	 * Proxy/load-balancer arkasında X-Forwarded-For header'ı varsa onu kullanır.
	 */
	private String resolveClientIp(HttpServletRequest request) {
		String xForwardedFor = request.getHeader("X-Forwarded-For");
		if (xForwardedFor != null && !xForwardedFor.isBlank()) {
			// İlk IP gerçek istemci IP'sidir
			return xForwardedFor.split(",")[0].trim();
		}
		return request.getRemoteAddr();
	}

	// ==================== AUTHENTICATED ENDPOINTS ====================

	// Python: @app.route('/dashboard')
	@GetMapping("/rest/api/dashboard/memorial")
	@Override
	public RootEntity<DtoMemorial> getMyMemorial() {
		org.springframework.security.core.Authentication auth =
				org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
		String username = auth.getName();
		User user = userRepository.findByUsername(username).orElseThrow();

		DtoMemorial memorial = memorialService.getMemorialByUserId(user.getId());
		return ok(memorial);
	}

	/**
	 * Anıt oluşturma/güncelleme endpoint'i.
	 * 
	 * Güvenlik katmanları:
	 * 1. @Valid → Jakarta Validation (MemorialCreateDto üzerindeki @NotBlank, @Size kontrolları)
	 * 2. Rate Limiting → Bucket4j ile IP bazlı dakikada maks 3 istek
	 * 3. XSS Sanitization → Service katmanında JSoup ile temizleme
	 * 4. SQL Injection → Spring Data JPA parametreli sorgular (string concat yok)
	 */
	@PostMapping("/rest/api/dashboard/memorial")
	public RootEntity<DtoMemorial> createOrUpdateMemorialSecure(
			@Valid @RequestBody MemorialCreateDto input,
			HttpServletRequest request) {

		// ── Rate Limiting Kontrolü ──
		String clientIp = resolveClientIp(request);
		Bucket bucket = resolveBucket(clientIp);

		if (!bucket.tryConsume(1)) {
			throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
					"Çok fazla istek gönderdiniz. Lütfen bir dakika bekleyip tekrar deneyin.");
		}

		// ── Kullanıcı kimlik doğrulama ──
		org.springframework.security.core.Authentication auth =
				org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
		String username = auth.getName();
		User user = userRepository.findByUsername(username).orElseThrow();

		// ── MemorialCreateDto → DtoMemorialIU dönüşümü (mevcut service ile uyum) ──
		DtoMemorialIU memorialIU = new DtoMemorialIU();
		BeanUtils.copyProperties(input, memorialIU);

		return ok(memorialService.createOrUpdateMemorial(user.getId(), memorialIU));
	}

	// Eski imzayla gelen istekleri de karşılamak için (Interface uyumu)
	@Override
	public RootEntity<DtoMemorial> createOrUpdateMemorial(@RequestBody DtoMemorialIU input) {
		// Bu metot artık doğrudan çağrılmaz, güvenli versiyon (createOrUpdateMemorialSecure) kullanılır.
		// Interface uyumluluğu için bırakıldı.
		throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED,
				"Bu endpoint artık güvenli form üzerinden kullanılmalıdır.");
	}

	// ==================== PUBLIC ENDPOINTS ====================

	// Python: @app.route('/profile/<slug>')
	@GetMapping("/rest/api/public/memorial/{slug}")
	@Override
	public RootEntity<DtoMemorial> getMemorialBySlug(
			@PathVariable String slug,
			@RequestParam(required = false, defaultValue = "false") boolean preview) {
		return ok(memorialService.getMemorialBySlug(slug, preview));
	}

	// Python: @app.route('/api/search_memorial')
	@GetMapping("/rest/api/public/search")
	@Override
	public RootEntity<List<SearchResultDto>> searchMemorials(@RequestParam String q) {
		return ok(memorialService.searchMemorials(q));
	}

	// Python: @app.route('/') — ana sayfa filtreleme
	@GetMapping("/rest/api/public/memorials")
	@Override
	public RootEntity<List<DtoMemorial>> getApprovedMemorials(
			@RequestParam(required = false) String firstName,
			@RequestParam(required = false) String lastName,
			@RequestParam(required = false) String city,
			@RequestParam(required = false) String district,
			@RequestParam(required = false) String occupation,
			@RequestParam(required = false) String gender,
			@RequestParam(required = false) String category,
			@RequestParam(required = false) String deathCause,
			@RequestParam(required = false) Integer ageMin,
			@RequestParam(required = false) Integer ageMax) {
		return ok(memorialService.getApprovedMemorials(firstName, lastName, city, district,
				occupation, gender, category, deathCause, ageMin, ageMax));
	}
	
	@DeleteMapping("/rest/api/memorials/my-memorial")
	@Override
	public RootEntity<String> deleteMyMemorial() {
		org.springframework.security.core.Authentication auth =
				org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
		String username = auth.getName();
		User user = userRepository.findByUsername(username).orElseThrow();
		
		memorialService.deleteMyMemorial(user.getId());
		return ok("Anıt başarıyla silindi.");
	}
}
