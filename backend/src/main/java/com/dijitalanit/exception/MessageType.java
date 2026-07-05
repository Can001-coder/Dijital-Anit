package com.dijitalanit.exception;

import lombok.Getter;

@Getter
public enum MessageType {

	NO_RECORD_EXIST("1004", "Kayıt bulunamadı"),
	TOKEN_IS_EXPIRED("1005", "Tokenın süresi bitmiştir"),
	USERNAME_NOT_FOUND("1006", "Kullanıcı adı bulunamadı"),
	USERNAME_OR_PASSWORD_INVALID("1007", "Kullanıcı adı veya şifre hatalı"),
	REFRESH_TOKEN_NOT_FOUND("1008", "Refresh token bulunamadı"),
	REFRESH_TOKEN_IS_EXPIRED("1009", "Refresh tokenın süresi bitmiştir"),
	EMAIL_ALREADY_EXISTS("1010", "Bu e-posta adresi zaten kayıtlı"),
	USERNAME_ALREADY_EXISTS("1011", "Bu kullanıcı adı zaten alınmış"),
	MEMORIAL_NOT_FOUND("1012", "Anıt bulunamadı"),
	UNAUTHORIZED_ACCESS("1013", "Yetkisiz erişim"),
	INVALID_FILE_FORMAT("1014", "Geçersiz dosya formatı"),
	FILE_UPLOAD_FAILED("1015", "Dosya yüklemesi başarısız"),
	INVALID_ACTION_TYPE("1016", "Geçersiz işlem tipi"),
	COMMENT_EMPTY("1017", "Yorum metni boş olamaz"),
	INVALID_VERIFICATION_TOKEN("1018", "Geçersiz veya süresi dolmuş doğrulama bağlantısı"),
	RATE_LIMIT_EXCEEDED("1019", "Çok fazla hatalı deneme. Lütfen 15 dakika sonra tekrar deneyin."),
	FILE_TOO_LARGE("1020", "Dosya boyutu izin verilen sınırı aşıyor"),
	INVALID_MIME_TYPE("1021", "Dosya içeriği izin verilen türlerle eşleşmiyor"),
	INVALID_PHONE_FORMAT("1022", "Telefon numarası başında 0 olmadan 10 haneli olmalıdır (Örn: 5551234567)"),
	INVALID_EMAIL_FORMAT("1023", "Geçerli bir e-posta adresi giriniz"),
	OTP_VERIFICATION_REQUIRED("1024", "Değişikliği onaylamak için doğrulama kodu gereklidir"),
	GENERAL_EXCEPTION("9999", "Genel bir hata oluştu");

	private String code;
	private String message;

	MessageType(String code, String message) {
		this.code = code;
		this.message = message;
	}
}
