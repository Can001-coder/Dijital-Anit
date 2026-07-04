package com.dijitalanit.service;

import org.springframework.web.multipart.MultipartFile;

public interface IImageService {

	// Python: optimize_image(file_obj, max_width=1200) → WebP dönüşüm pipeline
	String optimizeAndSave(MultipartFile file, String prefix, int maxWidth);

	// Dosya kaydetme (audio, video)
	String saveFile(MultipartFile file, String subDir, String prefix);
}
