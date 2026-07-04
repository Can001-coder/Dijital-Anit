package com.dijitalanit.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DtoUser extends DtoBase {

	private String username;
	private String email;
	private String phoneNumber;
	private String role;
	private Boolean anniversaryNotificationsEnabled;
}
