package com.dijitalanit.controller.impl;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.dijitalanit.controller.RestBaseController;
import com.dijitalanit.controller.RootEntity;
import com.dijitalanit.dto.ActionResponse;
import com.dijitalanit.dto.DtoComment;
import com.dijitalanit.dto.DtoCommentIU;
import com.dijitalanit.dto.StatsResponse;
import com.dijitalanit.service.IMemorialService;
import com.dijitalanit.service.IStatisticsService;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
public class RestApiControllerImpl extends RestBaseController {

	@Autowired
	private IMemorialService memorialService;

	@Autowired
	private IStatisticsService statisticsService;

	// ==================== RATE LIMITING (Bucket4j) ====================
	// Ziyaretçi defteri için IP bazlı rate limiter: Dakikada maksimum 5 istek
	private final Map<String, Bucket> commentRateLimitBuckets = new ConcurrentHashMap<>();

	private Bucket resolveCommentBucket(String ip) {
		return commentRateLimitBuckets.computeIfAbsent(ip, k ->
			Bucket.builder()
				.addLimit(Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1))))
				.build()
		);
	}

	private String resolveClientIp(HttpServletRequest request) {
		String xForwardedFor = request.getHeader("X-Forwarded-For");
		if (xForwardedFor != null && !xForwardedFor.isBlank()) {
			return xForwardedFor.split(",")[0].trim();
		}
		return request.getRemoteAddr();
	}

	// Python: @app.route('/action/<int:id>/<string:action_type>', methods=['POST'])
	@PostMapping("/rest/api/interaction/{memorialId}/{actionType}")
	public RootEntity<ActionResponse> handleAction(
			@PathVariable Long memorialId,
			@PathVariable String actionType) {
		return ok(memorialService.handleAction(memorialId, actionType));
	}

	// Python: @app.route('/comment/<int:id>', methods=['POST'])
	@PostMapping("/rest/api/comment/{memorialId}")
	public RootEntity<DtoComment> addComment(
			@PathVariable Long memorialId,
			@Valid @RequestBody DtoCommentIU input,
			HttpServletRequest request) {
		
		// ── Rate Limiting Kontrolü ──
		String clientIp = resolveClientIp(request);
		Bucket bucket = resolveCommentBucket(clientIp);

		if (!bucket.tryConsume(1)) {
			throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
					"Çok fazla yorum gönderdiniz. Lütfen bir dakika bekleyip tekrar deneyin.");
		}

		return ok(memorialService.addComment(memorialId, input));
	}

	// Python: @app.route('/api/stats')
	@GetMapping("/rest/api/public/stats")
	public RootEntity<StatsResponse> getStats(
			@RequestParam(required = false) String gender,
			@RequestParam(required = false) String city,
			@RequestParam(required = false) String category,
			@RequestParam(required = false) String cause) {
		return ok(statisticsService.getStatistics(gender, city, category, cause));
	}
}

