package com.dijitalanit.service.impl;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.dijitalanit.dto.DtoUser;
import com.dijitalanit.model.User;
import com.dijitalanit.repository.UserRepository;
import com.dijitalanit.service.IUserService;

@Service
public class UserServiceImpl implements IUserService {

	@Autowired
	private UserRepository userRepository;

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
	public DtoUser updateProfile(com.dijitalanit.dto.UpdateProfileRequest request) {
		User user = getCurrentUser();
		
		// Eğer email değişiyorsa ve yeni email başkası tarafından kullanılıyorsa hata fırlat
		if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
			if (userRepository.existsByEmail(request.getEmail())) {
				throw new RuntimeException("Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.");
			}
			user.setEmail(request.getEmail());
		}

		if (request.getPhoneNumber() != null) {
			user.setPhoneNumber(request.getPhoneNumber());
		}

		User saved = userRepository.save(user);
		DtoUser dto = new DtoUser();
		BeanUtils.copyProperties(saved, dto);
		dto.setRole(saved.getRole().getValue());
		return dto;
	}
}
