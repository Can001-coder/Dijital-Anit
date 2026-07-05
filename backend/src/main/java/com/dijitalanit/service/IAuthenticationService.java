package com.dijitalanit.service;

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

public interface IAuthenticationService {

	DtoUser register(RegisterRequest input);

	AuthResponse authenticate(AuthRequest input);

	AuthResponse refreshToken(RefreshTokenRequest input);

	void sendTwoFactorCode(com.dijitalanit.dto.TwoFactorSendRequest request) throws Exception;

	AuthResponse verifyTwoFactorCode(com.dijitalanit.dto.TwoFactorVerifyRequest request);

	ForgotPasswordResponse forgotPassword(ForgotPasswordRequest input);

	void sendResetCode(ResetCodeSendRequest request) throws Exception;

	void verifyResetCode(ResetCodeVerifyRequest request);

	void resetPassword(ResetPasswordRequest request);
}
