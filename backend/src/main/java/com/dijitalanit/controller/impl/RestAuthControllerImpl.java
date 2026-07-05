package com.dijitalanit.controller.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dijitalanit.controller.IRestAuthController;
import com.dijitalanit.controller.RestBaseController;
import com.dijitalanit.controller.RootEntity;
import com.dijitalanit.dto.AuthRequest;
import com.dijitalanit.dto.AuthResponse;
import com.dijitalanit.dto.DtoUser;
import com.dijitalanit.dto.RefreshTokenRequest;
import com.dijitalanit.dto.RegisterRequest;
import com.dijitalanit.dto.ForgotPasswordRequest;
import com.dijitalanit.dto.ForgotPasswordResponse;
import com.dijitalanit.dto.ResetCodeSendRequest;
import com.dijitalanit.dto.ResetCodeVerifyRequest;
import com.dijitalanit.dto.ResetPasswordRequest;
import com.dijitalanit.service.IAuthenticationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/rest/api/auth")
public class RestAuthControllerImpl extends RestBaseController implements IRestAuthController {

	@Autowired
	private IAuthenticationService authenticationService;

	@PostMapping("/register")
	@Override
	public RootEntity<DtoUser> register(@Valid @RequestBody RegisterRequest input) {
		return ok(authenticationService.register(input));
	}

	@PostMapping("/authenticate")
	@Override
	public RootEntity<AuthResponse> authenticate(@Valid @RequestBody AuthRequest input) {
		return ok(authenticationService.authenticate(input));
	}

	@PostMapping("/refresh-token")
	@Override
	public RootEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest input) {
		return ok(authenticationService.refreshToken(input));
	}

	@PostMapping("/send-2fa")
	@Override
	public RootEntity<Boolean> sendTwoFactorCode(@Valid @RequestBody com.dijitalanit.dto.TwoFactorSendRequest input) throws Exception {
		authenticationService.sendTwoFactorCode(input);
		return ok(true);
	}

	@PostMapping("/verify-2fa")
	@Override
	public RootEntity<AuthResponse> verifyTwoFactorCode(@Valid @RequestBody com.dijitalanit.dto.TwoFactorVerifyRequest input) {
		return ok(authenticationService.verifyTwoFactorCode(input));
	}

	@PostMapping("/forgot-password")
	@Override
	public RootEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest input) {
		return ok(authenticationService.forgotPassword(input));
	}

	@PostMapping("/send-reset-code")
	@Override
	public RootEntity<Boolean> sendResetCode(@Valid @RequestBody ResetCodeSendRequest input) throws Exception {
		authenticationService.sendResetCode(input);
		return ok(true);
	}

	@PostMapping("/verify-reset-code")
	@Override
	public RootEntity<Boolean> verifyResetCode(@Valid @RequestBody ResetCodeVerifyRequest input) {
		authenticationService.verifyResetCode(input);
		return ok(true);
	}

	@PostMapping("/reset-password")
	@Override
	public RootEntity<Boolean> resetPassword(@Valid @RequestBody ResetPasswordRequest input) {
		authenticationService.resetPassword(input);
		return ok(true);
	}
}
