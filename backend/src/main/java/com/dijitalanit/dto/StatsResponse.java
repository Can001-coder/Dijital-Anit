package com.dijitalanit.dto;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatsResponse {

	private Integer totalMemorials;
	private Double averageAge;
	private Map<String, Long> genders;
	private Map<String, Long> categories;
	private Map<String, Long> cities;
	private Map<String, Double> occupationsAge;
	private Map<String, Long> causes;
	private Map<Integer, Long> trend;
	private Map<String, Map<String, Long>> extras;
}
