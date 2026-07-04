package com.dijitalanit.enums;

import lombok.Getter;

@Getter
public enum UserRole {

	USER("user"),
	ADMIN("admin");

	private String value;

	UserRole(String value) {
		this.value = value;
	}
}
