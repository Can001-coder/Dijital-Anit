package com.dijitalanit.controller.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dijitalanit.controller.RestBaseController;
import com.dijitalanit.controller.RootEntity;
import com.dijitalanit.dto.DtoUser;
import com.dijitalanit.model.User;
import com.dijitalanit.repository.UserRepository;
import com.dijitalanit.service.IMailService;
import com.dijitalanit.service.IUserService;

@RestController
public class RestUserControllerImpl extends RestBaseController {

	@Autowired
	private IUserService userService;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private IMailService mailService;

	@GetMapping("/rest/api/user/settings")
	public RootEntity<DtoUser> getUserSettings() {
		return ok(userService.getProfile());
	}

	@PostMapping("/rest/api/user/settings")
	public RootEntity<DtoUser> updateUserSettings(@RequestParam Boolean enabled) {
		return ok(userService.updateAnniversaryPreference(enabled));
	}

	@org.springframework.beans.factory.annotation.Autowired
	private com.dijitalanit.scheduler.AnniversaryMailScheduler anniversaryMailScheduler;

	@PostMapping("/rest/api/user/update-profile")
	public RootEntity<DtoUser> updateProfile(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.dijitalanit.dto.UpdateProfileRequest request) {
		return ok(userService.updateProfile(request));
	}

	@PostMapping("/rest/api/user/test-anniversary-mail")
	public RootEntity<String> testAnniversaryMail() {
		try {
			String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
			User user = userRepository.findByUsername(username)
					.orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

			mailService.sendAnniversaryEmail(user.getEmail(), user.getUsername(), "Örnek Yakın Adı", "ornek-yakin-slug");
			return ok("Test e-postası başarıyla gönderildi: " + user.getEmail());
		} catch (Exception e) {
			return error("E-posta gönderimi başarısız: " + e.getMessage());
		}
	}

	@GetMapping("/rest/api/public/trigger-anniversary-scheduler")
	public RootEntity<String> triggerAnniversaryScheduler() {
		try {
			anniversaryMailScheduler.checkAndSendAnniversaryMails();
			return ok("Yıl dönümü e-posta kontrolü tetiklendi.");
		} catch (Exception e) {
			return error("Tetikleme başarısız: " + e.getMessage());
		}
	}
}
