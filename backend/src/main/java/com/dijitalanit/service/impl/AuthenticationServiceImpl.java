package com.dijitalanit.service.impl;

import java.util.Date;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.dijitalanit.dto.AuthRequest;
import com.dijitalanit.dto.AuthResponse;
import com.dijitalanit.dto.DtoUser;
import com.dijitalanit.dto.RefreshTokenRequest;
import com.dijitalanit.dto.RegisterRequest;
import com.dijitalanit.dto.TwoFactorSendRequest;
import com.dijitalanit.dto.TwoFactorVerifyRequest;
import com.dijitalanit.dto.ForgotPasswordRequest;
import com.dijitalanit.dto.ForgotPasswordResponse;
import com.dijitalanit.dto.ResetCodeSendRequest;
import com.dijitalanit.dto.ResetCodeVerifyRequest;
import com.dijitalanit.dto.ResetPasswordRequest;
import com.dijitalanit.enums.UserRole;
import com.dijitalanit.exception.BaseException;
import com.dijitalanit.exception.ErrorMessage;
import com.dijitalanit.exception.MessageType;
import com.dijitalanit.jwt.JWTService;
import com.dijitalanit.model.RefreshToken;
import com.dijitalanit.model.User;
import com.dijitalanit.repository.RefreshTokenRepository;
import com.dijitalanit.repository.UserRepository;
import com.dijitalanit.service.IAuthenticationService;
import com.dijitalanit.service.IMailService;
import com.dijitalanit.utils.InputSanitizer;

@Service
public class AuthenticationServiceImpl implements IAuthenticationService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	@Autowired
	private AuthenticationProvider authenticationProvider;

	@Autowired
	private JWTService jwtService;

	@Autowired
	private RefreshTokenRepository refreshTokenRepository;

	@Autowired
	private IMailService mailService;

	@Autowired
	private RateLimitingService rateLimitingService;

	@Value("${app.jwt.refresh-token-expiration}")
	private long refreshTokenExpiration;

	private User createUser(RegisterRequest input) {
		User user = new User();
		user.setCreateTime(new Date());
		user.setUsername(InputSanitizer.sanitize(input.getUsername()));
		user.setEmail(InputSanitizer.sanitizeEmail(input.getEmail()));
		user.setPhoneNumber(input.getPhoneNumber()); // Already validated by @Pattern
		user.setPassword(passwordEncoder.encode(input.getPassword()));
		user.setRole(UserRole.USER);
		user.setIsVerified(true);
		return user;
	}

	private RefreshToken createRefreshToken(User user) {
		RefreshToken refreshToken = new RefreshToken();
		refreshToken.setCreateTime(new Date());
		refreshToken.setExpiredDate(new Date(System.currentTimeMillis() + refreshTokenExpiration));
		refreshToken.setRefreshToken(UUID.randomUUID().toString());
		refreshToken.setUser(user);
		return refreshToken;
	}

	@Override
	public DtoUser register(RegisterRequest input) {
		if (userRepository.existsByUsername(input.getUsername())) {
			throw new BaseException(new ErrorMessage(MessageType.USERNAME_ALREADY_EXISTS, input.getUsername()));
		}
		if (userRepository.existsByEmail(input.getEmail())) {
			throw new BaseException(new ErrorMessage(MessageType.EMAIL_ALREADY_EXISTS, input.getEmail()));
		}

		DtoUser dtoUser = new DtoUser();
		User savedUser = userRepository.save(createUser(input));
		BeanUtils.copyProperties(savedUser, dtoUser);
		dtoUser.setRole(savedUser.getRole().getValue());
		return dtoUser;
	}

	@Override
	public AuthResponse authenticate(AuthRequest input) {
		try {
			UsernamePasswordAuthenticationToken authenticationToken =
					new UsernamePasswordAuthenticationToken(input.getUsername(), input.getPassword());
			authenticationProvider.authenticate(authenticationToken);

			Optional<User> optUser = userRepository.findByUsername(input.getUsername());
			User user = optUser.get();

			// Generate 2FA Token instead of JWT
			String twoFactorToken = UUID.randomUUID().toString();
			user.setTwoFactorToken(twoFactorToken);
			userRepository.save(user);

			AuthResponse response = new AuthResponse();
			response.setRequiresTwoFactor(true);
			response.setTwoFactorToken(twoFactorToken);
			
			if (user.getEmail() != null) {
				response.setMaskedEmail(maskEmail(user.getEmail()));
			}
			if (user.getPhoneNumber() != null) {
				response.setMaskedPhone(maskPhone(user.getPhoneNumber()));
			}

			return response;
		} catch (Exception e) {
			throw new BaseException(new ErrorMessage(MessageType.USERNAME_OR_PASSWORD_INVALID, null));
		}
	}

	@Override
	public void sendTwoFactorCode(TwoFactorSendRequest request) throws Exception {
		Optional<User> optUser = userRepository.findAll().stream()
				.filter(u -> request.getTwoFactorToken().equals(u.getTwoFactorToken()))
				.findFirst();

		if (optUser.isEmpty()) {
			throw new RuntimeException("Geçersiz veya süresi dolmuş işlem.");
		}

		User user = optUser.get();
		String code = String.format("%06d", new Random().nextInt(999999));
		user.setTwoFactorCode(code);
		user.setTwoFactorExpiry(new Date(System.currentTimeMillis() + 3 * 60 * 1000)); // 3 mins validity
		userRepository.save(user);

		if ("EMAIL".equalsIgnoreCase(request.getMethod())) {
			mailService.sendTwoFactorEmail(user.getEmail(), user.getUsername(), code);
		} else if ("SMS".equalsIgnoreCase(request.getMethod())) {
			// Simulate SMS
			System.out.println("SMS GÖNDERİLDİ: " + user.getPhoneNumber() + " -> KOD: " + code);
		} else {
			throw new RuntimeException("Geçersiz doğrulama yöntemi.");
		}
	}

	@Override
	public AuthResponse verifyTwoFactorCode(TwoFactorVerifyRequest request) {
		// ── RATE LIMITING: Brute-force koruması ──
		String rateLimitKey = "2fa_" + request.getTwoFactorToken();
		if (!rateLimitingService.tryConsume(rateLimitKey)) {
			throw new BaseException(new ErrorMessage(MessageType.RATE_LIMIT_EXCEEDED,
				"3 hatalı deneme sonrası hesap 15 dakika kilitlenmiştir."));
		}

		Optional<User> optUser = userRepository.findAll().stream()
				.filter(u -> request.getTwoFactorToken().equals(u.getTwoFactorToken()))
				.findFirst();

		if (optUser.isEmpty()) {
			throw new RuntimeException("Geçersiz veya süresi dolmuş işlem.");
		}

		User user = optUser.get();
		
		if (user.getTwoFactorExpiry() == null || new Date().after(user.getTwoFactorExpiry())) {
			throw new RuntimeException("Doğrulama kodunun süresi dolmuş.");
		}
		
		if (!request.getCode().equals(user.getTwoFactorCode())) {
			long remaining = rateLimitingService.getRemainingAttempts(rateLimitKey);
			throw new RuntimeException("Hatalı doğrulama kodu. Kalan deneme hakkı: " + remaining);
		}

		// Success! Clear 2FA data, reset rate limit, and generate real tokens
		rateLimitingService.resetLimit(rateLimitKey);
		user.setTwoFactorCode(null);
		user.setTwoFactorExpiry(null);
		user.setTwoFactorToken(null);
		userRepository.save(user);

		String accessToken = jwtService.generateToken(user);
		RefreshToken savedRefreshToken = refreshTokenRepository.save(createRefreshToken(user));

		AuthResponse response = new AuthResponse();
		response.setAccessToken(accessToken);
		response.setRefreshToken(savedRefreshToken.getRefreshToken());
		response.setRequiresTwoFactor(false);
		
		return response;
	}

	@Override
	public AuthResponse refreshToken(RefreshTokenRequest input) {
		Optional<RefreshToken> optRefreshToken = refreshTokenRepository.findByRefreshToken(input.getRefreshToken());
		if (optRefreshToken.isEmpty()) {
			throw new BaseException(new ErrorMessage(MessageType.REFRESH_TOKEN_NOT_FOUND, input.getRefreshToken()));
		}
		if (!new Date().before(optRefreshToken.get().getExpiredDate())) {
			throw new BaseException(new ErrorMessage(MessageType.REFRESH_TOKEN_IS_EXPIRED, input.getRefreshToken()));
		}

		User user = optRefreshToken.get().getUser();
		String accessToken = jwtService.generateToken(user);
		RefreshToken savedRefreshToken = refreshTokenRepository.save(createRefreshToken(user));

		AuthResponse response = new AuthResponse();
		response.setAccessToken(accessToken);
		response.setRefreshToken(savedRefreshToken.getRefreshToken());
		return response;
	}

	private String maskEmail(String email) {
		int atIndex = email.indexOf("@");
		if (atIndex <= 1) return email;
		String name = email.substring(0, atIndex);
		String domain = email.substring(atIndex);
		return name.charAt(0) + "***" + name.charAt(name.length() - 1) + domain;
	}

	private String maskPhone(String phone) {
		if (phone.length() < 6) return phone;
		return phone.substring(0, 3) + "***" + phone.substring(phone.length() - 2);
	}

	@Override
	public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest input) {
		Optional<User> optUser = userRepository.findAll().stream()
				.filter(u -> input.getEmail().equalsIgnoreCase(u.getEmail()))
				.findFirst();

		if (optUser.isEmpty()) {
			// Do not leak if user exists or not
			throw new BaseException(new ErrorMessage(MessageType.GENERAL_EXCEPTION, "Geçersiz işlem."));
		}

		User user = optUser.get();
		String resetToken = UUID.randomUUID().toString();
		user.setResetPasswordToken(resetToken);
		userRepository.save(user);

		ForgotPasswordResponse response = new ForgotPasswordResponse();
		response.setResetToken(resetToken);
		if (user.getEmail() != null) response.setMaskedEmail(maskEmail(user.getEmail()));
		if (user.getPhoneNumber() != null) response.setMaskedPhone(maskPhone(user.getPhoneNumber()));
		
		return response;
	}

	@Override
	public void sendResetCode(ResetCodeSendRequest request) throws Exception {
		Optional<User> optUser = userRepository.findAll().stream()
				.filter(u -> request.getResetToken().equals(u.getResetPasswordToken()))
				.findFirst();

		if (optUser.isEmpty()) {
			throw new RuntimeException("Geçersiz veya süresi dolmuş işlem.");
		}

		User user = optUser.get();
		String code = String.format("%06d", new Random().nextInt(999999));
		user.setResetPasswordCode(code);
		user.setResetPasswordExpiry(new Date(System.currentTimeMillis() + 3 * 60 * 1000)); // 3 mins validity
		userRepository.save(user);

		if ("EMAIL".equalsIgnoreCase(request.getMethod())) {
			mailService.sendTwoFactorEmail(user.getEmail(), user.getUsername(), code);
		} else if ("SMS".equalsIgnoreCase(request.getMethod())) {
			System.out.println("ŞİFRE SIFIRLAMA SMS GÖNDERİLDİ: " + user.getPhoneNumber() + " -> KOD: " + code);
		} else {
			throw new RuntimeException("Geçersiz doğrulama yöntemi.");
		}
	}

	@Override
	public void verifyResetCode(ResetCodeVerifyRequest request) {
		String rateLimitKey = "reset_" + request.getResetToken();
		if (!rateLimitingService.tryConsume(rateLimitKey)) {
			throw new BaseException(new ErrorMessage(MessageType.RATE_LIMIT_EXCEEDED,
				"3 hatalı deneme sonrası işlem 15 dakika kilitlenmiştir."));
		}

		Optional<User> optUser = userRepository.findAll().stream()
				.filter(u -> request.getResetToken().equals(u.getResetPasswordToken()))
				.findFirst();

		if (optUser.isEmpty()) {
			throw new RuntimeException("Geçersiz veya süresi dolmuş işlem.");
		}

		User user = optUser.get();
		
		if (user.getResetPasswordExpiry() == null || new Date().after(user.getResetPasswordExpiry())) {
			throw new RuntimeException("Doğrulama kodunun süresi dolmuş.");
		}
		
		if (!request.getCode().equals(user.getResetPasswordCode())) {
			long remaining = rateLimitingService.getRemainingAttempts(rateLimitKey);
			throw new RuntimeException("Hatalı doğrulama kodu. Kalan deneme hakkı: " + remaining);
		}

		rateLimitingService.resetLimit(rateLimitKey);
		// Do not clear token yet, it will be used for setting new password
		user.setResetPasswordCode(null);
		user.setResetPasswordExpiry(null);
		userRepository.save(user);
	}

	@Override
	public void resetPassword(ResetPasswordRequest request) {
		Optional<User> optUser = userRepository.findAll().stream()
				.filter(u -> request.getResetToken().equals(u.getResetPasswordToken()))
				.findFirst();

		if (optUser.isEmpty()) {
			throw new RuntimeException("Geçersiz veya süresi dolmuş işlem.");
		}

		User user = optUser.get();
		// If verification code is still there, it means it wasn't verified
		if (user.getResetPasswordExpiry() != null) {
			throw new RuntimeException("Önce doğrulama yapmalısınız.");
		}

		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		user.setResetPasswordToken(null); // Clear the token completely
		userRepository.save(user);
	}
}
