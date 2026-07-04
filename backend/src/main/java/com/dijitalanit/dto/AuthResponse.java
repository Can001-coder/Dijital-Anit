package com.dijitalanit.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

	private String accessToken;
	private String refreshToken;

	// Two-Factor Authentication fields
	private Boolean requiresTwoFactor;
	private String twoFactorToken;
	private String maskedEmail;
	private String maskedPhone;

	public AuthResponse(String accessToken, String refreshToken) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}
}
