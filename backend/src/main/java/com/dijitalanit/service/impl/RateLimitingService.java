package com.dijitalanit.service.impl;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;

/**
 * 2FA Brute-Force Koruması — Rate Limiting Servisi
 * 
 * Güvenlik Politikası:
 * - Her twoFactorToken için maksimum 3 doğrulama denemesine izin verilir
 * - 3 hatalı denemeden sonra token 15 dakika boyunca kilitlenir
 * - 15 dakika sonunda otomatik olarak 3 deneme hakkı yenilenir
 * 
 * Kullanılan Algoritma: Token Bucket (Bucket4j)
 */
@Service
public class RateLimitingService {

	/** Her twoFactorToken için ayrı bir rate limit bucket'ı */
	private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

	/**
	 * Verilen anahtar (twoFactorToken veya IP) için deneme hakkı olup olmadığını kontrol eder.
	 * 
	 * @param key Rate limiting anahtarı (twoFactorToken veya IP adresi)
	 * @return true = deneme izni var, false = rate limit aşıldı (kilitli)
	 */
	public boolean tryConsume(String key) {
		Bucket bucket = buckets.computeIfAbsent(key, this::createBucket);
		return bucket.tryConsume(1);
	}

	/**
	 * Verilen anahtar için kalan deneme hakkı sayısını döndürür.
	 */
	public long getRemainingAttempts(String key) {
		Bucket bucket = buckets.get(key);
		if (bucket == null) return 3;
		return bucket.getAvailableTokens();
	}

	/**
	 * Başarılı doğrulama sonrası bucket'ı temizler.
	 */
	public void resetLimit(String key) {
		buckets.remove(key);
	}

	/**
	 * 15 dakikada 3 deneme hakkı veren bucket oluşturur.
	 * 
	 * Refill.intervally: 15 dakika dolduğunda 3 token birden eklenir (greedy değil).
	 * Bu sayede saldırgan 15 dakika beklemeden yeni deneme yapamaz.
	 */
	private Bucket createBucket(String key) {
		Bandwidth limit = Bandwidth.classic(
			3, // Maksimum 3 deneme
			Refill.intervally(3, Duration.ofMinutes(15)) // 15 dakikada 3 token yenilenir
		);
		return Bucket.builder()
			.addLimit(limit)
			.build();
	}
}
