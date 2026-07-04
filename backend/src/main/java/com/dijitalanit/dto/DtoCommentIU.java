package com.dijitalanit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DtoCommentIU {

	@Size(max = 50, message = "İsim alanı en fazla 50 karakter olabilir")
	private String name;

	@NotBlank(message = "Mesaj alanı boş bırakılamaz")
	@Size(max = 1000, message = "Mesaj en fazla 1000 karakter olabilir")
	private String content;
}

