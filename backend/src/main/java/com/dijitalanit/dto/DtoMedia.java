package com.dijitalanit.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DtoMedia extends DtoBase {

	private Long memorialId;
	private String filePath;
	private String fileType;
	private String source;
	private Boolean isApproved;
}
