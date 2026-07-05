package com.dijitalanit.utils;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

/**
 * Backend tarafında XSS ve injection koruması için katı sanitizasyon.
 * Jsoup kullanarak tüm HTML tag'lerini sıyırır ve tehlikeli karakterleri temizler.
 */
public final class InputSanitizer {

	private InputSanitizer() {}

	/**
	 * Verilen string'i XSS/SQLi saldırılarına karşı temizler.
	 * - Tüm HTML tag'lerini Jsoup ile sıyırır
	 * - < > { } = ; karakterlerini kaldırır
	 * 
	 * @param input Kullanıcıdan gelen ham metin
	 * @return Güvenli hale getirilmiş metin
	 */
	public static String sanitize(String input) {
		if (input == null) return null;
		
		// 1. Jsoup ile tüm HTML tag'lerini sıyır (whitelist: NONE — hiçbir tag'e izin verme)
		String clean = Jsoup.clean(input, Safelist.none());
		
		// 2. Kalan tehlikeli karakterleri kaldır
		clean = clean.replaceAll("[<>{}=;]", "");
		
		return clean.trim();
	}

	/**
	 * E-posta adresi için hafif sanitizasyon (formatı bozmadan).
	 * Sadece HTML tag'lerini sıyırır.
	 */
	public static String sanitizeEmail(String email) {
		if (email == null) return null;
		return Jsoup.clean(email.trim(), Safelist.none());
	}
}
