package com.dijitalanit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetCodeVerifyRequest {

    @NotBlank(message = "Token boş olamaz")
    private String resetToken;

    @NotBlank(message = "Kod boş olamaz")
    private String code;

}
