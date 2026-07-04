package com.dijitalanit.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dijitalanit.dto.ActionResponse;
import com.dijitalanit.dto.DtoComment;
import com.dijitalanit.dto.DtoCommentIU;
import com.dijitalanit.dto.DtoMedia;
import com.dijitalanit.dto.DtoMemorial;
import com.dijitalanit.dto.DtoMemorialIU;
import com.dijitalanit.dto.MemorialCreateDto;
import com.dijitalanit.dto.SearchResultDto;
import com.dijitalanit.enums.MemorialStatus;
import com.dijitalanit.enums.UserRole;
import com.dijitalanit.exception.BaseException;
import com.dijitalanit.exception.ErrorMessage;
import com.dijitalanit.exception.MessageType;
import com.dijitalanit.model.Comment;
import com.dijitalanit.model.Media;
import com.dijitalanit.model.Memorial;
import com.dijitalanit.model.User;
import com.dijitalanit.repository.CommentRepository;
import com.dijitalanit.repository.MediaRepository;
import com.dijitalanit.repository.MemorialRepository;
import com.dijitalanit.repository.UserRepository;
import com.dijitalanit.service.IMemorialService;

import com.github.slugify.Slugify;

@Service
public class MemorialServiceImpl implements IMemorialService {

	@Autowired
	private MemorialRepository memorialRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private CommentRepository commentRepository;

	@Autowired
	private MediaRepository mediaRepository;

	private final Slugify slugify = Slugify.builder().build();

	// ==================== XSS SANİTİZASYON ====================

	/**
	 * JSoup Safelist.none() ile tüm HTML etiketlerini temizler.
	 * Bu metod servis katmanında DTO → Entity dönüşümü sırasında kullanılır.
	 * Veritabanına asla HTML kodu girmez.
	 */
	private String sanitize(String input) {
		if (input == null || input.isBlank()) {
			return input;
		}
		return Jsoup.clean(input, Safelist.none()).trim();
	}

	// ==================== DTO DÖNÜŞÜM HELPERS ====================

	private DtoMemorial toDto(Memorial m) {
		DtoMemorial dto = new DtoMemorial();
		BeanUtils.copyProperties(m, dto);
		dto.setUserId(m.getUser().getId());
		dto.setStatus(m.getStatus().getValue());

		if (m.getMedia() != null) {
			dto.setMedia(m.getMedia().stream().map(this::toMediaDto).collect(Collectors.toList()));
		}
		if (m.getComments() != null) {
			dto.setComments(m.getComments().stream()
					.filter(c -> Boolean.TRUE.equals(c.getIsApproved()))
					.map(this::toCommentDto)
					.collect(Collectors.toList()));
		}
		return dto;
	}

	private DtoMedia toMediaDto(Media media) {
		DtoMedia dto = new DtoMedia();
		BeanUtils.copyProperties(media, dto);
		dto.setMemorialId(media.getMemorial().getId());
		return dto;
	}

	private DtoComment toCommentDto(Comment comment) {
		DtoComment dto = new DtoComment();
		BeanUtils.copyProperties(comment, dto);
		dto.setMemorialId(comment.getMemorial().getId());
		return dto;
	}

	// Python: extra_data_dict oluşturma mantığı — TÜM STRING ALANLAR SANİTİZE EDİLİR
	private String buildExtraDataJson(DtoMemorialIU input) {
		Map<String, Object> extraData = new HashMap<>();
		if (input.getSubtitle() != null) extraData.put("subtitle", sanitize(input.getSubtitle()));
		if (input.getQuote() != null) extraData.put("quote", sanitize(input.getQuote()));
		if (input.getTraits() != null) extraData.put("traits", sanitize(input.getTraits()));
		if (input.getPhysical() != null) extraData.put("physical", sanitize(input.getPhysical()));
		if (input.getBiggestFear() != null) extraData.put("biggest_fear", sanitize(input.getBiggestFear()));
		if (input.getMakesCry() != null) extraData.put("makes_cry", sanitize(input.getMakesCry()));
		if (input.getHappiestMemory() != null) extraData.put("happiest_memory", sanitize(input.getHappiestMemory()));
		if (input.getMakesLaugh() != null) extraData.put("makes_laugh", sanitize(input.getMakesLaugh()));
		if (input.getWill() != null) extraData.put("will", sanitize(input.getWill()));
		if (input.getViewsLikes() != null) extraData.put("views_likes", sanitize(input.getViewsLikes()));
		if (input.getTitles() != null) extraData.put("titles", sanitize(input.getTitles()));
		if (input.getZodiac() != null) extraData.put("zodiac", sanitize(input.getZodiac()));
		if (input.getDeathCause() != null) extraData.put("death_cause", sanitize(input.getDeathCause()));
		if (input.getCountdown() != null) extraData.put("countdown", sanitize(input.getCountdown()));
		if (input.getEducation() != null) extraData.put("education", sanitize(input.getEducation()));
		if (input.getCertifications() != null) extraData.put("certifications", sanitize(input.getCertifications()));
		if (input.getSocialProjects() != null) extraData.put("social_projects", sanitize(input.getSocialProjects()));
		if (input.getTimeline() != null) extraData.put("timeline", sanitize(input.getTimeline()));
		if (input.getWorks() != null) extraData.put("works", sanitize(input.getWorks()));
		if (input.getFriends() != null) extraData.put("friends", sanitize(input.getFriends()));
		if (input.getPets() != null) extraData.put("pets", sanitize(input.getPets()));
		if (input.getBooks() != null) extraData.put("books", sanitize(input.getBooks()));
		if (input.getFood() != null) extraData.put("food", sanitize(input.getFood()));
		if (input.getColorSeason() != null) extraData.put("color_season", sanitize(input.getColorSeason()));
		if (input.getFlower() != null) extraData.put("flower", sanitize(input.getFlower()));
		if (input.getScent() != null) extraData.put("scent", sanitize(input.getScent()));
		if (input.getSports() != null) extraData.put("sports", sanitize(input.getSports()));
		if (input.getMuseums() != null) extraData.put("museums", sanitize(input.getMuseums()));
		if (input.getHistoricalPlaces() != null) extraData.put("historical_places", sanitize(input.getHistoricalPlaces()));
		if (input.getMovies() != null) extraData.put("movies", sanitize(input.getMovies()));
		if (input.getGraveCity() != null) extraData.put("grave_city", sanitize(input.getGraveCity()));
		if (input.getGraveLocation() != null) extraData.put("grave_location", sanitize(input.getGraveLocation()));
		if (input.getGraveWill() != null) extraData.put("grave_will", sanitize(input.getGraveWill()));
		extraData.put("ai_voice_active", Boolean.TRUE.equals(input.getAiVoiceActive()));
		extraData.put("ar_enabled", Boolean.TRUE.equals(input.getArEnabled()));
		extraData.put("auto_anniversary_sms", Boolean.TRUE.equals(input.getAutoAnniversarySms()));
		if (input.getHiddenFields() != null) extraData.put("hidden_fields", sanitize(input.getHiddenFields()));

		// Basit JSON serialize (Jackson dependency'si zaten var)
		try {
			com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
			return mapper.writeValueAsString(extraData);
		} catch (Exception e) {
			return "{}";
		}
	}

	// ==================== SERVICE METHODS ====================

	@Override
	public DtoMemorial getMemorialByUserId(Long userId) {
		Optional<Memorial> opt = memorialRepository.findByUserId(userId);
		return opt.map(this::toDto).orElse(null);
	}

	@Override
	public DtoMemorial getMemorialById(Long memorialId) {
		Memorial memorial = memorialRepository.findById(memorialId)
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MEMORIAL_NOT_FOUND, memorialId.toString())));
		return toDto(memorial);
	}

	@Override
	@Transactional
	public DtoMemorial createOrUpdateMemorial(Long userId, DtoMemorialIU input) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.USERNAME_NOT_FOUND, userId.toString())));

		String fullName = ((input.getFirstName() != null ? input.getFirstName() : "") + " " +
				(input.getLastName() != null ? input.getLastName() : "")).trim();

		Integer birthYear = input.getBirthDate() != null ? input.getBirthDate().getYear() : null;
		Integer deathYear = input.getDeathDate() != null ? input.getDeathDate().getYear() : null;

		String extraDataJson = buildExtraDataJson(input);

		Memorial memorial;
		boolean isAdminEdit = input.getMemorialIdToEdit() != null && user.getRole() == UserRole.ADMIN;

		// Python: Admin edit desteği
		if (isAdminEdit) {
			memorial = memorialRepository.findById(input.getMemorialIdToEdit())
					.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MEMORIAL_NOT_FOUND, input.getMemorialIdToEdit().toString())));
		} else {
			Optional<Memorial> existing = memorialRepository.findByUserId(userId);
			memorial = existing.orElse(null);
		}

		boolean isNew = (memorial == null);

		if (isNew) {
			// Yeni anıt oluştur
			memorial = new Memorial();
			memorial.setCreateTime(new Date());
			memorial.setUser(user);
			
			String baseSlug = slugify.slugify(fullName);
			String uniqueSlug = baseSlug;
			int counter = 1;
			while (memorialRepository.findBySlug(uniqueSlug).isPresent()) {
				uniqueSlug = baseSlug + "-" + counter;
				counter++;
			}
			memorial.setSlug(uniqueSlug);
		}

		// Alanları güncelle — TÜM STRING ALANLAR XSS TEMİZLİĞİNDEN GEÇİRİLİR
		memorial.setFirstName(sanitize(input.getFirstName()));
		memorial.setLastName(sanitize(input.getLastName()));
		memorial.setName(sanitize(fullName));
		memorial.setBio(sanitize(input.getBio()));
		memorial.setLat(input.getLat());
		memorial.setLng(input.getLng());
		memorial.setCity(sanitize(input.getCity()));
		memorial.setDistrict(sanitize(input.getDistrict()));
		memorial.setOccupation(sanitize(input.getOccupation()));
		memorial.setGender(sanitize(input.getGender()));
		memorial.setCategory(sanitize(input.getCategory()));
		memorial.setDeathCause(sanitize(input.getDeathCause()));
		memorial.setBirthYear(birthYear);
		memorial.setDeathYear(deathYear);
		memorial.setBirthDate(input.getBirthDate());
		memorial.setDeathDate(input.getDeathDate());
		memorial.setSectionConfig(input.getSectionOrder());
		memorial.setExtraData(extraDataJson);

		// Yeni anıtlar PENDING olarak başlasın; mevcut anıtlarda status korunur
		// Admin düzenleme ise mevcut status değiştirilmez
		if (isNew) {
			memorial.setStatus(MemorialStatus.PENDING);
		}
		// Mevcut anıt güncellemelerinde kullanıcının kendi anıtını düzenlediği durumda
		// status'u PENDING'e çek ki tekrar admin onayı gereksin
		if (!isNew && !isAdminEdit) {
			memorial.setStatus(MemorialStatus.PENDING);
		}

		Memorial saved = memorialRepository.save(memorial);
		return toDto(saved);
	}

	@Override
	public DtoMemorial getMemorialBySlug(String slug, boolean preview) {
		Memorial memorial = memorialRepository.findBySlug(slug)
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MEMORIAL_NOT_FOUND, slug)));

		if (!preview && memorial.getStatus() != MemorialStatus.APPROVED) {
			boolean isOwner = false;
			try {
				String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
				if (username != null && !"anonymousUser".equals(username)) {
					java.util.Optional<com.dijitalanit.model.User> currentUser = userRepository.findByUsername(username);
					if (currentUser.isPresent() && memorial.getUser().getId().equals(currentUser.get().getId())) {
						isOwner = true;
					}
				}
			} catch (Exception e) {
				// ignore
			}
			if (!isOwner) {
				throw new BaseException(new ErrorMessage(MessageType.MEMORIAL_NOT_FOUND, "bu anıt henüz yayında değil"));
			}
		}
		return toDto(memorial);
	}

	@Override
	public List<DtoMemorial> getApprovedMemorials(String firstName, String lastName, String city,
			String district, String occupation, String gender, String category,
			String deathCause, Integer ageMin, Integer ageMax) {

		List<Memorial> all = new java.util.ArrayList<>(memorialRepository.findByStatus(MemorialStatus.APPROVED));
		try {
			String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
			if (username != null && !"anonymousUser".equals(username)) {
				java.util.Optional<com.dijitalanit.model.User> currentUser = userRepository.findByUsername(username);
				if (currentUser.isPresent()) {
					java.util.Optional<Memorial> ownMemorial = memorialRepository.findByUserId(currentUser.get().getId());
					if (ownMemorial.isPresent() && ownMemorial.get().getStatus() != MemorialStatus.APPROVED) {
						all.add(ownMemorial.get());
					}
				}
			}
		} catch (Exception e) {
			// ignore
		}

		return all.stream()
				.filter(m -> firstName == null || (m.getFirstName() != null && m.getFirstName().toLowerCase().contains(firstName.toLowerCase())))
				.filter(m -> lastName == null || (m.getLastName() != null && m.getLastName().toLowerCase().contains(lastName.toLowerCase())))
				.filter(m -> city == null || city.equals(m.getCity()))
				.filter(m -> district == null || district.equals(m.getDistrict()))
				.filter(m -> occupation == null || (m.getOccupation() != null && m.getOccupation().toLowerCase().contains(occupation.toLowerCase())))
				.filter(m -> gender == null || gender.equals(m.getGender()))
				.filter(m -> category == null || category.equals(m.getCategory()))
				.filter(m -> deathCause == null || (m.getDeathCause() != null && m.getDeathCause().toLowerCase().contains(deathCause.toLowerCase())))
				.filter(m -> {
					if (ageMin == null && ageMax == null) return true;
					if (m.getBirthYear() == null || m.getDeathYear() == null) return false;
					int age = m.getDeathYear() - m.getBirthYear();
					if (ageMin != null && age < ageMin) return false;
					if (ageMax != null && age > ageMax) return false;
					return true;
				})
				.map(this::toDto)
				.collect(Collectors.toList());
	}

	@Override
	public List<SearchResultDto> searchMemorials(String query) {
		if (query == null || query.trim().length() < 2) return List.of();

		List<Memorial> results = new java.util.ArrayList<>(memorialRepository.searchByName(MemorialStatus.APPROVED, query.trim()));
		try {
			String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
			if (username != null && !"anonymousUser".equals(username)) {
				java.util.Optional<com.dijitalanit.model.User> currentUser = userRepository.findByUsername(username);
				if (currentUser.isPresent()) {
					java.util.Optional<Memorial> ownMemorial = memorialRepository.findByUserId(currentUser.get().getId());
					if (ownMemorial.isPresent() && ownMemorial.get().getStatus() != MemorialStatus.APPROVED) {
						if (ownMemorial.get().getName().toLowerCase().contains(query.trim().toLowerCase())) {
							results.add(ownMemorial.get());
						}
					}
				}
			}
		} catch (Exception e) {
			// ignore
		}

		return results.stream().limit(5).map(m -> {
			String imgUrl = "/uploads/images/default.jpg";
			if (m.getMedia() != null) {
				for (Media media : m.getMedia()) {
					if ("image".equals(media.getFileType()) && Boolean.TRUE.equals(media.getIsApproved())) {
						imgUrl = "/uploads/" + media.getFilePath();
						break;
					}
				}
			}
			String dates = "(" + (m.getBirthYear() != null ? m.getBirthYear() : "?") +
					" - " + (m.getDeathYear() != null ? m.getDeathYear() : "Hayatta") + ")";
			return new SearchResultDto(m.getName(), m.getSlug(), dates, imgUrl);
		}).collect(Collectors.toList());
	}

	@Override
	@Transactional
	public ActionResponse handleAction(Long memorialId, String actionType) {
		Memorial memorial = memorialRepository.findById(memorialId)
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MEMORIAL_NOT_FOUND, memorialId.toString())));

		Integer counter;
		switch (actionType) {
			case "fatiha":
				memorial.setFatihaCount((memorial.getFatihaCount() != null ? memorial.getFatihaCount() : 0) + 1);
				counter = memorial.getFatihaCount();
				break;
			case "helallik":
				memorial.setHelallikCount((memorial.getHelallikCount() != null ? memorial.getHelallikCount() : 0) + 1);
				counter = memorial.getHelallikCount();
				break;
			case "flower":
				memorial.setFlowerCount((memorial.getFlowerCount() != null ? memorial.getFlowerCount() : 0) + 1);
				counter = memorial.getFlowerCount();
				break;
			case "dua":
				memorial.setDuaCount((memorial.getDuaCount() != null ? memorial.getDuaCount() : 0) + 1);
				counter = memorial.getDuaCount();
				break;
			default:
				throw new BaseException(new ErrorMessage(MessageType.INVALID_ACTION_TYPE, actionType));
		}

		memorialRepository.save(memorial);
		return new ActionResponse(true, counter);
	}

	@Override
	@Transactional
	public DtoComment addComment(Long memorialId, DtoCommentIU input) {
		Memorial memorial = memorialRepository.findById(memorialId)
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MEMORIAL_NOT_FOUND, memorialId.toString())));

		if (input.getContent() == null || input.getContent().trim().isEmpty()) {
			throw new BaseException(new ErrorMessage(MessageType.COMMENT_EMPTY, null));
		}

		Comment comment = new Comment();
		comment.setMemorial(memorial);
		
		// XSS Koruması (JSoup ile temizleme)
		String safeName = input.getName() != null && !input.getName().isBlank() ? sanitize(input.getName()) : "İsimsiz Ziyaretçi";
		if (safeName.isBlank()) safeName = "İsimsiz Ziyaretçi";
		
		comment.setCommenterName(safeName);
		comment.setContent(sanitize(input.getContent()));
		comment.setIsApproved(false);
		comment.setCreatedAt(new Date());
		comment.setCreateTime(new Date());

		Comment saved = commentRepository.save(comment);
		return toCommentDto(saved);
	}

	@Override
	@Transactional
	public void approveMemorial(Long memorialId) {
		Memorial memorial = memorialRepository.findById(memorialId)
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MEMORIAL_NOT_FOUND, memorialId.toString())));
		memorial.setStatus(MemorialStatus.APPROVED);
		if (memorial.getMedia() != null) {
			memorial.getMedia().forEach(m -> m.setIsApproved(true));
		}
		memorialRepository.save(memorial);
	}

	@Override
	@Transactional
	public void rejectMemorial(Long memorialId) {
		Memorial memorial = memorialRepository.findById(memorialId)
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MEMORIAL_NOT_FOUND, memorialId.toString())));
		memorial.setStatus(MemorialStatus.REJECTED);
		memorialRepository.save(memorial);
	}

	@Override
	@Transactional
	public void pendingMemorial(Long memorialId) {
		Memorial memorial = memorialRepository.findById(memorialId)
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MEMORIAL_NOT_FOUND, memorialId.toString())));
		memorial.setStatus(MemorialStatus.PENDING);
		memorialRepository.save(memorial);
	}

	@Override
	@Transactional
	public void moderateComment(Long commentId, String action, Long currentUserId) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, commentId.toString())));

		User user = userRepository.findById(currentUserId).orElseThrow();
		if (!comment.getMemorial().getUser().getId().equals(currentUserId) && user.getRole() != UserRole.ADMIN) {
			throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, null));
		}

		if ("approve".equals(action)) {
			comment.setIsApproved(true);
			commentRepository.save(comment);
		} else if ("reject".equals(action)) {
			commentRepository.delete(comment);
		}
	}

	@Override
	@Transactional
	public void moderateMedia(Long mediaId, String action, Long currentUserId) {
		Media media = mediaRepository.findById(mediaId)
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, mediaId.toString())));

		User user = userRepository.findById(currentUserId).orElseThrow();
		if (!media.getMemorial().getUser().getId().equals(currentUserId) && user.getRole() != UserRole.ADMIN) {
			throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, null));
		}

		if ("approve".equals(action)) {
			media.setIsApproved(true);
			mediaRepository.save(media);
		} else if ("reject".equals(action)) {
			mediaRepository.delete(media);
		}
	}

	@Override
	@Transactional
	public void deleteMyMemorial(Long userId) {
		Memorial memorial = memorialRepository.findByUserId(userId)
				.orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "User ID: " + userId)));
		
		memorialRepository.delete(memorial);
	}
}
