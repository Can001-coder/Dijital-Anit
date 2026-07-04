package com.dijitalanit.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

	@NotNull
	@Size(max = 20, message = "Kullanıcı adı en fazla 20 karakter olabilir")
	private String username;

	@NotNull
	@Size(max = 100, message = "E-posta en fazla 100 karakter olabilir")
	private String email;

	@NotNull
	@Size(max = 20, message = "Şifre en fazla 20 karakter olabilir")
	private String password;

	@Size(max = 20, message = "Telefon numarası en fazla 20 karakter olabilir")
	private String phoneNumber;
}
