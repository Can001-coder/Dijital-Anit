package com.dijitalanit.controller;

import com.dijitalanit.dto.AuthRequest;
import com.dijitalanit.dto.AuthResponse;
import com.dijitalanit.dto.DtoUser;
import com.dijitalanit.dto.RefreshTokenRequest;
import com.dijitalanit.dto.RegisterRequest;

public interface IRestAuthController {

	RootEntity<DtoUser> register(RegisterRequest input);

	RootEntity<AuthResponse> authenticate(AuthRequest input);

	RootEntity<AuthResponse> refreshToken(RefreshTokenRequest input);

	RootEntity<Boolean> sendTwoFactorCode(com.dijitalanit.dto.TwoFactorSendRequest input) throws Exception;

	RootEntity<AuthResponse> verifyTwoFactorCode(com.dijitalanit.dto.TwoFactorVerifyRequest input);
}
