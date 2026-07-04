package com.dijitalanit.controller.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.dijitalanit.controller.RestBaseController;
import com.dijitalanit.controller.RootEntity;
import com.dijitalanit.exception.BaseException;
import com.dijitalanit.exception.ErrorMessage;
import com.dijitalanit.exception.MessageType;
import com.dijitalanit.model.Media;
import com.dijitalanit.model.Memorial;
import com.dijitalanit.model.User;
import com.dijitalanit.repository.MediaRepository;
import com.dijitalanit.repository.MemorialRepository;
import com.dijitalanit.repository.UserRepository;
import com.dijitalanit.service.IImageService;
import com.dijitalanit.service.IQrCodeService;

import jakarta.servlet.http.HttpServletRequest;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.Optional;
import java.util.Set;

@RestController
public class RestFileControllerImpl extends RestBaseController {

	@Autowired
	private IImageService imageService;

	@Autowired
	private IQrCodeService qrCodeService;

	@Autowired
	private MemorialRepository memorialRepository;

	@Autowired
	private MediaRepository mediaRepository;

	@Autowired
	private UserRepository userRepository;

	@Value("${app.upload.dir}")
	private String uploadDir;

	private static final Set<String> IMAGE_EXTS = Set.of("jpg", "jpeg", "png", "gif", "webp");
	private static final Set<String> VIDEO_EXTS = Set.of("mp4", "mov", "avi", "webm");
	private static final Set<String> AUDIO_EXTS = Set.of("mp3", "wav", "ogg", "m4a");

	private String getExt(String filename) {
		if (filename == null || !filename.contains(".")) return "";
		return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
	}

	// ==================== DOSYA SERVİSİ ====================
	@GetMapping("/uploads/**")
	public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
		try {
			String filePath = request.getRequestURI().substring("/uploads/".length());
			Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
			Path file = uploadPath.resolve(filePath).normalize();

			// Güvenlik: Path Traversal (Dizin Atlama) Koruması
			if (!file.startsWith(uploadPath)) {
				return ResponseEntity.status(403).build(); // Forbidden
			}

			Resource resource = new UrlResource(file.toUri());
			if (resource.exists() && resource.isReadable()) {
				return ResponseEntity.ok()
						.header(HttpHeaders.CONTENT_DISPOSITION, "inline")
						.body(resource);
			}
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			return ResponseEntity.notFound().build();
		}
	}

	// ==================== QR CODE ====================
	@GetMapping("/rest/api/qr/{slug}")
	public ResponseEntity<byte[]> generateQrCode(@PathVariable String slug, HttpServletRequest request) {
		String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
		byte[] qrImage = qrCodeService.generateQrCode(slug, baseUrl);
		return ResponseEntity.ok()
				.contentType(MediaType.IMAGE_PNG)
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + slug + "_qr.png")
				.body(qrImage);
	}

	// ==================== ZİYARETÇİ MEDYA YÜKLEME ====================
	@PostMapping("/rest/api/visitor-media/{memorialId}")
	public RootEntity<String> uploadVisitorMedia(
			@PathVariable Long memorialId,
			@RequestParam("visitor_media") MultipartFile file) {

		Memorial memorial = memorialRepository.findById(memorialId)
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MEMORIAL_NOT_FOUND, memorialId.toString())));

		String ext = getExt(file.getOriginalFilename());
		String filePath;
		String fileType;

		if (IMAGE_EXTS.contains(ext)) {
			filePath = imageService.optimizeAndSave(file, "visitor_" + memorialId, 1200);
			fileType = "visitor_image";
		} else if (VIDEO_EXTS.contains(ext)) {
			filePath = imageService.saveFile(file, "video", "visitor_" + memorialId);
			fileType = "visitor_video";
		} else if (AUDIO_EXTS.contains(ext)) {
			filePath = imageService.saveFile(file, "audio", "visitor_" + memorialId);
			fileType = "visitor_audio";
		} else {
			throw new BaseException(new ErrorMessage(MessageType.INVALID_FILE_FORMAT, ext));
		}

		saveNewMedia(memorial, filePath, fileType, "visitor", false);

		return ok("Dosya yüklendi. Onay sonrası görünür olacak.");
	}

	// ==================== DASHBOARD MEDYA YÜKLEME (Authenticated) ====================
	// Profil fotoğrafı yükle
	@PostMapping("/rest/api/dashboard/upload/profile-image")
	public RootEntity<String> uploadProfileImage(@RequestParam("file") MultipartFile file) {
		Memorial memorial = getAuthenticatedMemorial();
		String filePath = imageService.optimizeAndSave(file, String.valueOf(memorial.getId()), 800);

		// Owner'ın yüklediği profil fotoğrafı otomatik onaylı
		saveOrUpdateMedia(memorial, filePath, "image", "owner", true);
		return ok(filePath);
	}

	// Galeri fotoğrafları yükle (çoklu)
	@PostMapping("/rest/api/dashboard/upload/gallery")
	public RootEntity<String> uploadGallery(@RequestParam("files") MultipartFile[] files) {
		Memorial memorial = getAuthenticatedMemorial();
		int count = 0;
		for (MultipartFile file : files) {
			if (file.isEmpty()) continue;
			String filePath = imageService.optimizeAndSave(file, "gallery_" + memorial.getId(), 1200);
			saveNewMedia(memorial, filePath, "gallery", "owner", true);
			count++;
		}
		return ok(count + " fotoğraf yüklendi");
	}

	// Ses dosyası yükle (yasin, fatiha, voice, music)
	@PostMapping("/rest/api/dashboard/upload/audio")
	public RootEntity<String> uploadAudio(
			@RequestParam("file") MultipartFile file,
			@RequestParam("audioType") String audioType) {
			
		String ext = getExt(file.getOriginalFilename());
		if (!AUDIO_EXTS.contains(ext)) {
			throw new BaseException(new ErrorMessage(MessageType.INVALID_FILE_FORMAT, ext));
		}

		Memorial memorial = getAuthenticatedMemorial();

		// audioType: audio_yasin, audio_fatiha, audio_voice, audio_music
		String filePath = imageService.saveFile(file, "audio", memorial.getId() + "_" + audioType);

		saveOrUpdateMedia(memorial, filePath, audioType, "owner", true);
		return ok(filePath);
	}

	// Authenticated kullanıcının memorial'ını getir
	private Memorial getAuthenticatedMemorial() {
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userRepository.findByUsername(username).orElseThrow();
		return memorialRepository.findByUserId(user.getId())
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MEMORIAL_NOT_FOUND, "Önce anıt oluşturun")));
	}

	// ==================== YARDIMCI METOTLAR ====================
	private void saveNewMedia(Memorial memorial, String filePath, String fileType, String source, boolean isApproved) {
		Media media = new Media();
		media.setCreateTime(new Date());
		media.setMemorial(memorial);
		media.setFilePath(filePath);
		media.setFileType(fileType);
		media.setSource(source);
		media.setIsApproved(isApproved);
		mediaRepository.save(media);
	}

	private void saveOrUpdateMedia(Memorial memorial, String filePath, String fileType, String source, boolean isApproved) {
		Optional<Media> existing = mediaRepository.findByMemorialIdAndFileType(memorial.getId(), fileType);
		if (existing.isPresent()) {
			existing.get().setFilePath(filePath);
			if (isApproved) existing.get().setIsApproved(true);
			mediaRepository.save(existing.get());
		} else {
			saveNewMedia(memorial, filePath, fileType, source, isApproved);
		}
	}
}
