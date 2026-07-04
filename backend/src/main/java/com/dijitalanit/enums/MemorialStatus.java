package com.dijitalanit.enums;

import lombok.Getter;

@Getter
public enum MemorialStatus {

	PENDING("pending"),
	APPROVED("approved"),
	REJECTED("rejected");

	private String value;

	MemorialStatus(String value) {
		this.value = value;
	}
}
