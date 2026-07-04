package com.dijitalanit.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDto {

	private String name;
	private String slug;
	private String dates;
	private String image;
}
