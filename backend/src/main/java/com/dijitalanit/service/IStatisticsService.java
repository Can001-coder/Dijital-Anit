package com.dijitalanit.service;

import com.dijitalanit.dto.StatsResponse;

public interface IStatisticsService {

	// Python: api/stats endpoint — Pandas aggregation → Java Stream/SQL
	StatsResponse getStatistics(String gender, String city, String category, String cause);
}
