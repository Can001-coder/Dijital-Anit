package com.dijitalanit.controller;

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

public interface IRestAuthController {

	RootEntity<DtoUser> register(RegisterRequest input);

	RootEntity<AuthResponse> authenticate(AuthRequest input);

	RootEntity<AuthResponse> refreshToken(RefreshTokenRequest input);

	RootEntity<Boolean> sendTwoFactorCode(com.dijitalanit.dto.TwoFactorSendRequest input) throws Exception;

	RootEntity<AuthResponse> verifyTwoFactorCode(com.dijitalanit.dto.TwoFactorVerifyRequest input);

	RootEntity<ForgotPasswordResponse> forgotPassword(ForgotPasswordRequest input);

	RootEntity<Boolean> sendResetCode(ResetCodeSendRequest input) throws Exception;

	RootEntity<Boolean> verifyResetCode(ResetCodeVerifyRequest input);

	RootEntity<Boolean> resetPassword(ResetPasswordRequest input);
}
