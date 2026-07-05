package com.dijitalanit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "Token boş olamaz")
    private String resetToken;

    @NotBlank(message = "Yeni şifre boş olamaz")
    private String newPassword;

}
