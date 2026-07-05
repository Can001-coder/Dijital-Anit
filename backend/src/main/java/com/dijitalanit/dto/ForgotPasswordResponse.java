package com.dijitalanit.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordResponse {
    private String resetToken;
    private String maskedEmail;
    private String maskedPhone;
}
