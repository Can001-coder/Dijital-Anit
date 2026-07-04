package com.dijitalanit.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TwoFactorVerifyRequest {
	@NotNull
	private String twoFactorToken;
	@NotNull
	private String code;
}
