package com.dijitalanit.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
	@Size(max = 100, message = "E-posta en fazla 100 karakter olabilir")
	private String email;

	@Size(max = 20, message = "Telefon numarası en fazla 20 karakter olabilir")
	private String phoneNumber;
}
