package com.dijitalanit.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
	@Pattern(regexp = "^[a-zA-Z0-9.]+@gmail\\.com$", message = "Geçerli bir e-posta adresi giriniz")
	private String email;

	@NotNull
	@Size(max = 20, message = "Şifre en fazla 20 karakter olabilir")
	private String password;

	@Pattern(regexp = "^[1-9][0-9]{9}$", message = "Telefon numarası başında 0 olmadan 10 haneli olmalıdır (Örn: 5551234567)")
	private String phoneNumber;
}
