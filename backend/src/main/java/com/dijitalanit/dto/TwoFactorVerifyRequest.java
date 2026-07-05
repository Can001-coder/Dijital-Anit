package com.dijitalanit.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TwoFactorVerifyRequest {
	@NotNull
	private String twoFactorToken;
	@NotNull
	@Pattern(regexp = "^[0-9]{6}$", message = "Doğrulama kodu 6 haneli rakamdan oluşmalıdır")
	private String code;
}
