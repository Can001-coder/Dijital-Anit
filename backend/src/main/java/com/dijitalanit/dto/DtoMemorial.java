package com.dijitalanit.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DtoMemorial extends DtoBase {

	private Long userId;
	private String firstName;
	private String lastName;
	private String name;
	private String slug;
	private String bio;
	private Double lat;
	private Double lng;
	private String status;

	private String city;
	private String district;
	private String occupation;
	private String gender;
	private String category;
	private String deathCause;
	private String lifestyleTags;

	private Integer birthYear;
	private Integer deathYear;
	private LocalDate birthDate;
	private LocalDate deathDate;

	private String sectionConfig;
	private String extraData;

	private Integer fatihaCount;
	private Integer helallikCount;
	private Integer flowerCount;
	private Integer duaCount;

	private List<DtoMedia> media;
	private List<DtoComment> comments;
}
