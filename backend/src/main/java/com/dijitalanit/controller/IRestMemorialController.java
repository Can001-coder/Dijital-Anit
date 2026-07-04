package com.dijitalanit.controller;

import java.util.List;

import com.dijitalanit.dto.DtoMemorial;
import com.dijitalanit.dto.DtoMemorialIU;
import com.dijitalanit.dto.SearchResultDto;

public interface IRestMemorialController {

	// Dashboard
	RootEntity<DtoMemorial> getMyMemorial();

	// Anıt oluştur/güncelle
	RootEntity<DtoMemorial> createOrUpdateMemorial(DtoMemorialIU input);

	// Public: slug ile anıt getir
	RootEntity<DtoMemorial> getMemorialBySlug(String slug, boolean preview);

	// Public: anıt arama
	RootEntity<List<SearchResultDto>> searchMemorials(String query);

	// Public: filtreleme ile anıt listesi
	RootEntity<List<DtoMemorial>> getApprovedMemorials(
			String firstName, String lastName, String city, String district,
			String occupation, String gender, String category, String deathCause,
			Integer ageMin, Integer ageMax);
			
	// Anıt Silme
	RootEntity<String> deleteMyMemorial();
}
