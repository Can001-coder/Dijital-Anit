package com.dijitalanit.handler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;

import com.dijitalanit.controller.RootEntity;
import com.dijitalanit.exception.BaseException;

/**
 * Global Exception Handler — Sessiz Hata Yönetimi
 * 
 * Güvenlik Prensibi: Kullanıcıya ASLA stack trace, sınıf adı veya
 * dahili hata detayı döndürülmez. Tüm hatalar steril JSON formatında döner.
 * Detaylı hata bilgisi sadece sunucu loglarına yazılır.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	// ==================== İŞ KURALI HATALARI ====================

	/**
	 * BaseException → Frontend'in beklediği RootEntity formatında steril mesaj döndürür.
	 * Stack trace sadece sunucu logunda kalır.
	 */
	@ExceptionHandler(value = { BaseException.class })
	public ResponseEntity<RootEntity<?>> handleBaseException(BaseException ex, WebRequest request) {
		log.warn("İş kuralı hatası: {}", ex.getMessage());
		return ResponseEntity.badRequest().body(RootEntity.error(ex.getMessage()));
	}

	// ==================== VALİDASYON HATALARI ====================

	/**
	 * DTO doğrulama hataları → Alan bazlı steril hata mesajları.
	 * Jakarta Validation (@NotBlank, @Size vs.) hataları burada yakalanır.
	 */
	@ExceptionHandler(value = { MethodArgumentNotValidException.class })
	public ResponseEntity<RootEntity<?>> handleMethodArgumentNotValidException(
			MethodArgumentNotValidException ex, WebRequest request) {
		
		Map<String, String> fieldErrors = new HashMap<>();
		for (ObjectError objError : ex.getBindingResult().getAllErrors()) {
			String fieldName = ((FieldError) objError).getField();
			String message = objError.getDefaultMessage();
			fieldErrors.put(fieldName, message);
		}

		// Kullanıcıya okunabilir tek mesaj oluştur
		StringBuilder sb = new StringBuilder();
		fieldErrors.forEach((field, msg) -> sb.append(msg).append("; "));
		
		log.warn("Doğrulama hatası: {}", fieldErrors);
		return ResponseEntity.badRequest().body(RootEntity.error(sb.toString().trim()));
	}

	// ==================== RATE LIMITING HATALARI ====================

	/**
	 * Rate limiting (429 Too Many Requests) ve diğer ResponseStatusException'lar.
	 */
	@ExceptionHandler(value = { ResponseStatusException.class })
	public ResponseEntity<RootEntity<?>> handleResponseStatusException(
			ResponseStatusException ex, WebRequest request) {
		log.warn("HTTP durum hatası: {} - {}", ex.getStatusCode(), ex.getReason());
		
		String safeMessage = ex.getReason() != null 
			? ex.getReason() 
			: "İstek işlenemedi. Lütfen daha sonra tekrar deneyin.";
		
		return ResponseEntity.status(ex.getStatusCode())
				.body(RootEntity.error(safeMessage));
	}

	// ==================== GENEL HATALAR (Catch-All) ====================

	/**
	 * Beklenmeyen tüm hatalar — ASLA stack trace veya iç detay sızdırılmaz.
	 * Dahili hata detayı sadece sunucu loglarına yazılır (güvenlik için).
	 */
	@ExceptionHandler(value = { Exception.class })
	public ResponseEntity<RootEntity<?>> handleGeneralException(Exception ex, WebRequest request) {
		// Detaylı hata bilgisini SADECE sunucu loglarına yaz
		log.error("Beklenmeyen sunucu hatası oluştu", ex);

		// Kullanıcıya steril, genel bir mesaj dön — stack trace SIFIR
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(RootEntity.error("Bir hata oluştu. Lütfen daha sonra tekrar deneyin."));
	}
}
