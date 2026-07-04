package com.dijitalanit.service.impl;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dijitalanit.exception.BaseException;
import com.dijitalanit.exception.ErrorMessage;
import com.dijitalanit.exception.MessageType;
import com.dijitalanit.service.IImageService;

import net.coobird.thumbnailator.Thumbnails;

@Service
public class ImageServiceImpl implements IImageService {

	@Value("${app.upload.dir}")
	private String uploadDir;

	@Value("${app.image.quality}")
	private double imageQuality;

	/**
	 * Python karşılığı:
	 * def optimize_image(file_obj, max_width=1200):
	 *     img = Image.open(file_obj)
	 *     if img.width > max_width: img = img.resize(...)
	 *     img.save(output, format='WEBP', quality=85)
	 */
	@Override
	public String optimizeAndSave(MultipartFile file, String prefix, int maxWidth) {
		try {
			Path imagesDir = Paths.get(uploadDir, "images");
			Files.createDirectories(imagesDir);

			String originalName = file.getOriginalFilename();
			String baseName = originalName != null
					? originalName.replaceAll("\\.[^.]+$", "")
					: "image";

			// Python: filename = secure_filename(...) + '.webp'
			String fileName = prefix + "_" + sanitize(baseName) + "_" + UUID.randomUUID().toString().substring(0, 8) + ".jpg";
			File outputFile = imagesDir.resolve(fileName).toFile();

			Thumbnails.of(file.getInputStream())
					.size(maxWidth, maxWidth)
					.keepAspectRatio(true)
					.outputFormat("jpeg")
					.outputQuality(imageQuality / 100.0)
					.toFile(outputFile);

			return "images/" + fileName;
		} catch (IOException e) {
			throw new BaseException(new ErrorMessage(MessageType.FILE_UPLOAD_FAILED, null));
		}
	}

	@Override
	public String saveFile(MultipartFile file, String subDir, String prefix) {
		try {
			Path dir = Paths.get(uploadDir, subDir);
			Files.createDirectories(dir);

			String originalName = file.getOriginalFilename();
			String ext = originalName != null && originalName.contains(".")
					? originalName.substring(originalName.lastIndexOf('.'))
					: "";

			String fileName = prefix + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
			Path filePath = dir.resolve(fileName);

			file.transferTo(filePath.toFile());
			return subDir + "/" + fileName;
		} catch (IOException e) {
			throw new BaseException(new ErrorMessage(MessageType.FILE_UPLOAD_FAILED, null));
		}
	}

	// Python: secure_filename() karşılığı
	private String sanitize(String name) {
		return name.replaceAll("[^a-zA-Z0-9_\\-]", "_").toLowerCase();
	}
}
