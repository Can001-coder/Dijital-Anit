package com.dijitalanit.dto;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DtoComment extends DtoBase {

	private Long memorialId;
	private String commenterName;
	private String content;
	private Boolean isApproved;
	private Date createdAt;
}
