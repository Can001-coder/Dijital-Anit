package com.dijitalanit.service.impl;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dijitalanit.dto.StatsResponse;
import com.dijitalanit.enums.MemorialStatus;
import com.dijitalanit.model.Memorial;
import com.dijitalanit.repository.MemorialRepository;
import com.dijitalanit.service.IStatisticsService;

@Service
public class StatisticsServiceImpl implements IStatisticsService {

	@Autowired
	private MemorialRepository memorialRepository;

	@Override
	public StatsResponse getStatistics(String gender, String city, String category, String cause) {
		// Python: memorials = Memorial.query.filter_by(status='approved').all()
		List<Memorial> memorials = memorialRepository.findByStatus(MemorialStatus.APPROVED);

		// Python: df filtre mantığı → Java Stream filter
		var stream = memorials.stream();
		if (gender != null) stream = stream.filter(m -> gender.equals(m.getGender()));
		if (city != null) stream = stream.filter(m -> city.equals(m.getCity()));
		if (category != null) stream = stream.filter(m -> category.equals(m.getCategory()));
		if (cause != null) stream = stream.filter(m -> cause.equals(m.getDeathCause()));

		List<Memorial> filtered = stream.collect(Collectors.toList());

		StatsResponse response = new StatsResponse();
		response.setTotalMemorials(filtered.size());

		if (filtered.isEmpty()) return response;

		// Python: genders = df['gender'].value_counts().to_dict()
		Map<String, Long> genders = filtered.stream()
				.collect(Collectors.groupingBy(
						m -> m.getGender() != null ? m.getGender() : "Belirtilmemiş",
						Collectors.counting()));
		response.setGenders(genders);

		// Python: cats = df['category'].value_counts().to_dict()
		Map<String, Long> categories = filtered.stream()
				.collect(Collectors.groupingBy(
						m -> m.getCategory() != null ? m.getCategory() : "Diğer",
						Collectors.counting()));
		response.setCategories(categories);

		// Python: causes = df['death_cause'].value_counts().head(5).to_dict()
		Map<String, Long> causes = filtered.stream()
				.collect(Collectors.groupingBy(
						m -> m.getDeathCause() != null ? m.getDeathCause() : "Bilinmiyor",
						Collectors.counting()))
				.entrySet().stream()
				.sorted(Map.Entry.<String, Long>comparingByValue().reversed())
				.limit(5)
				.collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
		response.setCauses(causes);

		// Python: cities = df['city'].value_counts().head(10).to_dict()
		Map<String, Long> cities = filtered.stream()
				.collect(Collectors.groupingBy(
						m -> m.getCity() != null ? m.getCity() : "Bilinmiyor",
						Collectors.counting()))
				.entrySet().stream()
				.sorted(Map.Entry.<String, Long>comparingByValue().reversed())
				.limit(10)
				.collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
		response.setCities(cities);

		// Python: occ_stats = occ_age_df.groupby('occupation')['age'].mean()
		Map<String, Double> occupationsAge = filtered.stream()
				.filter(m -> m.getOccupation() != null && m.getBirthYear() != null && m.getDeathYear() != null)
				.collect(Collectors.groupingBy(
						Memorial::getOccupation,
						Collectors.averagingInt(m -> m.getDeathYear() - m.getBirthYear())))
				.entrySet().stream()
				.sorted(Map.Entry.<String, Double>comparingByValue().reversed())
				.limit(10)
				.collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
		response.setOccupationsAge(occupationsAge);

		// Python: trend = trend_df['death_year'].value_counts().sort_index().tail(15)
		Map<Integer, Long> trend = filtered.stream()
				.filter(m -> m.getDeathYear() != null)
				.collect(Collectors.groupingBy(Memorial::getDeathYear, Collectors.counting()))
				.entrySet().stream()
				.sorted(Map.Entry.comparingByKey())
				.collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
		// Sadece son 15 yıl
		if (trend.size() > 15) {
			List<Integer> keys = new java.util.ArrayList<>(trend.keySet());
			Map<Integer, Long> trimmed = new LinkedHashMap<>();
			for (int i = keys.size() - 15; i < keys.size(); i++) {
				trimmed.put(keys.get(i), trend.get(keys.get(i)));
			}
			trend = trimmed;
		}
		response.setTrend(trend);

		// Python: avg_age = round(df['age'].mean(), 1)
		double avgAge = filtered.stream()
				.filter(m -> m.getBirthYear() != null && m.getDeathYear() != null)
				.mapToInt(m -> m.getDeathYear() - m.getBirthYear())
				.average()
				.orElse(0.0);
		response.setAverageAge(Math.round(avgAge * 10.0) / 10.0);

		return response;
	}
}
