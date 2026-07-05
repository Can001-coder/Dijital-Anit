package com.dijitalanit.service.impl;

import java.util.Date;
import java.util.Random;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.dijitalanit.dto.DtoUser;
import com.dijitalanit.dto.UpdateProfileRequest;
import com.dijitalanit.exception.BaseException;
import com.dijitalanit.exception.ErrorMessage;
import com.dijitalanit.exception.MessageType;
import com.dijitalanit.model.User;
import com.dijitalanit.repository.UserRepository;
import com.dijitalanit.service.IMailService;
import com.dijitalanit.service.IUserService;
import com.dijitalanit.utils.InputSanitizer;

@Service
public class UserServiceImpl implements IUserService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private IMailService mailService;

	private User getCurrentUser() {
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
	}

	@Override
	public DtoUser getProfile() {
		User user = getCurrentUser();
		DtoUser dto = new DtoUser();
		BeanUtils.copyProperties(user, dto);
		dto.setRole(user.getRole().getValue());
		return dto;
	}

	@Override
	public DtoUser updateAnniversaryPreference(Boolean enabled) {
		User user = getCurrentUser();
		user.setAnniversaryNotificationsEnabled(enabled);
		User saved = userRepository.save(user);
		DtoUser dto = new DtoUser();
		BeanUtils.copyProperties(saved, dto);
		dto.setRole(saved.getRole().getValue());
		return dto;
	}

	@Override
	public DtoUser updateProfile(UpdateProfileRequest request) {
		User user = getCurrentUser();
		
		boolean emailChanged = request.getEmail() != null && !request.getEmail().isBlank()
				&& !request.getEmail().equals(user.getEmail());
		boolean phoneChanged = request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()
				&& !request.getPhoneNumber().equals(user.getPhoneNumber());


		// ── E-posta güncelleme ──
		if (emailChanged) {
			String sanitizedEmail = InputSanitizer.sanitizeEmail(request.getEmail());
			if (userRepository.existsByEmail(sanitizedEmail)) {
				throw new RuntimeException("Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.");
			}
			user.setEmail(sanitizedEmail);
		}

		// ── Telefon güncelleme ──
		if (phoneChanged) {
			user.setPhoneNumber(request.getPhoneNumber()); // @Pattern ile doğrulanmış
		}

		User saved = userRepository.save(user);
		DtoUser dto = new DtoUser();
		BeanUtils.copyProperties(saved, dto);
		dto.setRole(saved.getRole().getValue());
		return dto;
	}
}
