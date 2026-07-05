package com.dijitalanit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetCodeSendRequest {

    @NotBlank(message = "Token boş olamaz")
    private String resetToken;

    @NotBlank(message = "Yöntem boş olamaz")
    private String method; // EMAIL or SMS

}
