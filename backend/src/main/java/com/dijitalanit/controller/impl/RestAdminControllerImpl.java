package com.dijitalanit.controller.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dijitalanit.controller.RestBaseController;
import com.dijitalanit.controller.RootEntity;
import com.dijitalanit.dto.DtoComment;
import com.dijitalanit.dto.DtoMedia;
import com.dijitalanit.dto.DtoMemorial;
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

@RestController
@RequestMapping("/rest/api/admin")
public class RestAdminControllerImpl extends RestBaseController {

	@Autowired
	private IMemorialService memorialService;

	@Autowired
	private MemorialRepository memorialRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private MediaRepository mediaRepository;

	@Autowired
	private CommentRepository commentRepository;

	private User getCurrentAdmin() {
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		String username;
		if (principal instanceof UserDetails) {
			username = ((UserDetails) principal).getUsername();
		} else {
			username = principal.toString();
		}
		User user = userRepository.findByUsername(username).orElseThrow();
		if (user.getRole() != UserRole.ADMIN) {
			throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "admin yetkisi gerekli"));
		}
		return user;
	}

	private DtoMemorial toDto(Memorial m) {
		DtoMemorial dto = new DtoMemorial();
		BeanUtils.copyProperties(m, dto);
		dto.setUserId(m.getUser() != null ? m.getUser().getId() : null);
		dto.setStatus(m.getStatus() != null ? m.getStatus().getValue() : "pending");
		if (m.getMedia() != null) {
			dto.setMedia(m.getMedia().stream().map(media -> {
				DtoMedia dm = new DtoMedia();
				BeanUtils.copyProperties(media, dm);
				dm.setMemorialId(m.getId());
				return dm;
			}).collect(Collectors.toList()));
		}
		return dto;
	}

	private DtoMedia toMediaDto(Media media) {
		DtoMedia dm = new DtoMedia();
		BeanUtils.copyProperties(media, dm);
		dm.setMemorialId(media.getMemorial() != null ? media.getMemorial().getId() : null);
		return dm;
	}

	private DtoComment toCommentDto(Comment comment) {
		DtoComment dc = new DtoComment();
		BeanUtils.copyProperties(comment, dc);
		dc.setMemorialId(comment.getMemorial() != null ? comment.getMemorial().getId() : null);
		return dc;
	}

	@GetMapping("/dashboard")
	@Transactional(readOnly = true)
	public RootEntity<Map<String, Object>> getAdminDashboard() {
		getCurrentAdmin();

		List<DtoMemorial> pendingDtos = memorialRepository
				.findByStatusOrderByIdDesc(MemorialStatus.PENDING)
				.stream().map(this::toDto).collect(Collectors.toList());

		List<DtoMemorial> approvedDtos = memorialRepository
				.findByStatusOrderByIdDesc(MemorialStatus.APPROVED)
				.stream().map(this::toDto).collect(Collectors.toList());

		// Onay bekleyen medyalar (ziyaretçi yüklemeleri dahil)
		List<DtoMedia> pendingMediaDtos = mediaRepository
				.findByIsApprovedOrderByIdDesc(false)
				.stream().map(this::toMediaDto).collect(Collectors.toList());

		// Onay bekleyen yorumlar
		List<DtoComment> pendingCommentDtos = commentRepository
				.findByIsApprovedOrderByCreatedAtDesc(false)
				.stream().map(this::toCommentDto).collect(Collectors.toList());

		Map<String, Object> data = new HashMap<>();
		data.put("pendingMemorials", pendingDtos);
		data.put("approvedMemorials", approvedDtos);
		data.put("pendingMedia", pendingMediaDtos);
		data.put("pendingComments", pendingCommentDtos);
		data.put("totalUsers", userRepository.count());
		data.put("totalFatiha", memorialRepository.sumFatihaCount());
		data.put("totalFlower", memorialRepository.sumFlowerCount());
		data.put("totalDua", memorialRepository.sumDuaCount());
		data.put("totalHelallik", memorialRepository.sumHelallikCount());

		return ok(data);
	}

	@PostMapping("/approve/{memorialId}")
	public RootEntity<String> approveMemorial(@PathVariable Long memorialId) {
		getCurrentAdmin();
		memorialService.approveMemorial(memorialId);
		return ok("Anıt onaylandı");
	}

	@PostMapping("/reject/{memorialId}")
	public RootEntity<String> rejectMemorial(@PathVariable Long memorialId) {
		getCurrentAdmin();
		memorialService.rejectMemorial(memorialId);
		return ok("Anıt reddedildi");
	}

	@PostMapping("/pending/{memorialId}")
	public RootEntity<String> pendingMemorial(@PathVariable Long memorialId) {
		getCurrentAdmin();
		memorialService.pendingMemorial(memorialId);
		return ok("Anıt tekrar onaya çekildi");
	}

	@GetMapping("/memorial/{memorialId}")
	public RootEntity<DtoMemorial> getMemorialForEdit(@PathVariable Long memorialId) {
		getCurrentAdmin();
		return ok(memorialService.getMemorialById(memorialId));
	}

	@PostMapping("/moderate/{itemType}/{itemId}/{action}")
	public RootEntity<String> moderateItem(
			@PathVariable String itemType,
			@PathVariable Long itemId,
			@PathVariable String action) {
		User admin = getCurrentAdmin();
		if ("comment".equals(itemType)) {
			memorialService.moderateComment(itemId, action, admin.getId());
		} else if ("media".equals(itemType)) {
			memorialService.moderateMedia(itemId, action, admin.getId());
		} else {
			throw new BaseException(new ErrorMessage(MessageType.INVALID_ACTION_TYPE, itemType));
		}
		return ok("İşlem başarılı");
	}
}

