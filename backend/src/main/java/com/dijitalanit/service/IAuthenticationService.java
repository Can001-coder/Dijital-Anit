package com.dijitalanit.service;

import com.dijitalanit.dto.AuthRequest;
import com.dijitalanit.dto.AuthResponse;
import com.dijitalanit.dto.DtoUser;
import com.dijitalanit.dto.RefreshTokenRequest;
import com.dijitalanit.dto.RegisterRequest;

public interface IAuthenticationService {

	DtoUser register(RegisterRequest input);

	AuthResponse authenticate(AuthRequest input);

	AuthResponse refreshToken(RefreshTokenRequest input);

	void sendTwoFactorCode(com.dijitalanit.dto.TwoFactorSendRequest request) throws Exception;

	AuthResponse verifyTwoFactorCode(com.dijitalanit.dto.TwoFactorVerifyRequest request);
}
