package com.dijitalanit.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Güvenli dosya yükleme servisi.
 * Magic Byte (MIME) kontrolü, UUID isimlendirme ve boyut sınırı uygular.
 */
public interface IFileUploadService {

	/**
	 * Güvenli fotoğraf yükleme (jpeg, png, webp). Maks 5MB.
	 * Orijinal dosya adını siler, UUID atar.
	 * Apache Tika ile gerçek MIME türünü doğrular.
	 * 
	 * @return Kaydedilen dosyanın relative path'i
	 */
	String uploadImage(MultipartFile file, String prefix, int maxWidth);

	/**
	 * Güvenli ses yükleme (mp3). Maks 10MB.
	 * Orijinal dosya adını siler, UUID atar.
	 * Apache Tika ile gerçek MIME türünü doğrular.
	 * 
	 * @return Kaydedilen dosyanın relative path'i
	 */
	String uploadAudio(MultipartFile file, String prefix);
}
