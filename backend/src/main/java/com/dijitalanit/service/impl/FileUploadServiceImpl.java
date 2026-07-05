package com.dijitalanit.service.impl;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dijitalanit.exception.BaseException;
import com.dijitalanit.exception.ErrorMessage;
import com.dijitalanit.exception.MessageType;
import com.dijitalanit.service.IFileUploadService;

import net.coobird.thumbnailator.Thumbnails;

/**
 * Production-Ready Güvenli Dosya Yükleme Servisi
 * 
 * Güvenlik Katmanları:
 * 1. Magic Byte / MIME türü kontrolü (Apache Tika)
 * 2. Dosya boyutu kontrolü (Fotoğraf: 5MB, Ses: 10MB)
 * 3. Orijinal dosya adı silme + UUID isimlendirme (Path Traversal koruması)
 * 4. İzin verilen formatlar: jpeg, png, webp (fotoğraf) | mp3 (ses)
 */
@Service
public class FileUploadServiceImpl implements IFileUploadService {

	@Value("${app.upload.dir}")
	private String uploadDir;

	@Value("${app.image.quality}")
	private double imageQuality;

	private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;    // 5MB
	private static final long MAX_AUDIO_SIZE = 10 * 1024 * 1024;   // 10MB

	/** İzin verilen fotoğraf MIME türleri */
	private static final Set<String> ALLOWED_IMAGE_MIMES = Set.of(
		"image/jpeg", "image/png", "image/webp"
	);

	/** İzin verilen ses MIME türleri */
	private static final Set<String> ALLOWED_AUDIO_MIMES = Set.of(
		"audio/mpeg", "audio/mp3"
	);

	private final Tika tika = new Tika();

	@Override
	public String uploadImage(MultipartFile file, String prefix, int maxWidth) {
		// 1. Boyut kontrolü
		if (file.getSize() > MAX_IMAGE_SIZE) {
			throw new BaseException(new ErrorMessage(
				MessageType.FILE_TOO_LARGE, "Fotoğraf maksimum 5MB olabilir (Yüklenen: " + (file.getSize() / 1024 / 1024) + "MB)"));
		}

		// 2. Magic Byte / MIME türü kontrolü
		String detectedMime = detectMimeType(file);
		if (!ALLOWED_IMAGE_MIMES.contains(detectedMime)) {
			throw new BaseException(new ErrorMessage(
				MessageType.INVALID_MIME_TYPE, "İzin verilen formatlar: jpeg, png, webp. Algılanan: " + detectedMime));
		}

		// 3. UUID ile dosya adı oluştur (Path Traversal koruması)
		String extension = mimeToExtension(detectedMime);
		String safeFileName = UUID.randomUUID().toString() + extension;

		try {
			Path imagesDir = Paths.get(uploadDir, "images");
			Files.createDirectories(imagesDir);

			File outputFile = imagesDir.resolve(safeFileName).toFile();

			Thumbnails.of(file.getInputStream())
				.size(maxWidth, maxWidth)
				.keepAspectRatio(true)
				.outputFormat(extension.replace(".", "").equals("webp") ? "png" : "jpeg")
				.outputQuality(imageQuality / 100.0)
				.toFile(outputFile);

			return "images/" + safeFileName;
		} catch (IOException e) {
			throw new BaseException(new ErrorMessage(MessageType.FILE_UPLOAD_FAILED, null));
		}
	}

	@Override
	public String uploadAudio(MultipartFile file, String prefix) {
		// 1. Boyut kontrolü
		if (file.getSize() > MAX_AUDIO_SIZE) {
			throw new BaseException(new ErrorMessage(
				MessageType.FILE_TOO_LARGE, "Ses dosyası maksimum 10MB olabilir (Yüklenen: " + (file.getSize() / 1024 / 1024) + "MB)"));
		}

		// 2. Magic Byte / MIME türü kontrolü
		String detectedMime = detectMimeType(file);
		if (!ALLOWED_AUDIO_MIMES.contains(detectedMime)) {
			throw new BaseException(new ErrorMessage(
				MessageType.INVALID_MIME_TYPE, "İzin verilen ses formatı: mp3. Algılanan: " + detectedMime));
		}

		// 3. UUID ile dosya adı oluştur
		String safeFileName = UUID.randomUUID().toString() + ".mp3";

		try {
			Path audioDir = Paths.get(uploadDir, "audio");
			Files.createDirectories(audioDir);

			Path filePath = audioDir.resolve(safeFileName);
			file.transferTo(filePath.toFile());

			return "audio/" + safeFileName;
		} catch (IOException e) {
			throw new BaseException(new ErrorMessage(MessageType.FILE_UPLOAD_FAILED, null));
		}
	}

	/**
	 * Apache Tika ile dosyanın gerçek MIME türünü tespit eder.
	 * Frontend uzantı kontrolünün aksine, dosya içeriğinin Magic Byte'larını okur.
	 */
	private String detectMimeType(MultipartFile file) {
		try (InputStream is = file.getInputStream()) {
			return tika.detect(is);
		} catch (IOException e) {
			throw new BaseException(new ErrorMessage(MessageType.FILE_UPLOAD_FAILED, "Dosya türü tespit edilemedi"));
		}
	}

	private String mimeToExtension(String mime) {
		return switch (mime) {
			case "image/jpeg" -> ".jpg";
			case "image/png" -> ".png";
			case "image/webp" -> ".webp";
			case "audio/mpeg", "audio/mp3" -> ".mp3";
			default -> "";
		};
	}
}
