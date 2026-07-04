package com.dijitalanit.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TwoFactorSendRequest {
	@NotNull
	private String twoFactorToken;
	@NotNull
	private String method; // "EMAIL" or "SMS"
}
