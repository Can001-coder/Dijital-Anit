package com.dijitalanit.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DtoMemorialIU {

	// Kimlik
	@jakarta.validation.constraints.NotBlank(message = "Ad en fazla 50 karakter olabilir")
	@Size(max = 50, message = "Ad en fazla 50 karakter olabilir")
	private String firstName;
	@jakarta.validation.constraints.NotBlank(message = "Soyad en fazla 50 karakter olabilir")
	@Size(max = 50, message = "Soyad en fazla 50 karakter olabilir")
	private String lastName;
	@jakarta.validation.constraints.NotBlank(message = "Biyografi en fazla 1000 karakter olabilir")
	@Size(max = 1000, message = "Biyografi en fazla 1000 karakter olabilir")
	private String bio;

	// Konum
	private Double lat;
	private Double lng;

	// Filtreleme
	@jakarta.validation.constraints.NotBlank(message = "Şehir boş bırakılamaz")
	@Size(max = 50, message = "Şehir en fazla 50 karakter olabilir")
	private String city;
	@jakarta.validation.constraints.NotBlank(message = "İlçe boş bırakılamaz")
	@Size(max = 50, message = "İlçe en fazla 50 karakter olabilir")
	private String district;
	@jakarta.validation.constraints.NotBlank(message = "Meslek boş bırakılamaz")
	@Size(max = 80, message = "Meslek en fazla 80 karakter olabilir")
	private String occupation;
	@jakarta.validation.constraints.NotBlank(message = "Cinsiyet boş bırakılamaz")
	@Size(max = 20, message = "Cinsiyet en fazla 20 karakter olabilir")
	private String gender;
	@Size(max = 50, message = "Kategori en fazla 50 karakter olabilir")
	private String category;

	// Tarihler
	@jakarta.validation.constraints.NotNull(message = "Doğum tarihi boş bırakılamaz")
	private LocalDate birthDate;
	@jakarta.validation.constraints.NotNull(message = "Ölüm tarihi boş bırakılamaz")
	private LocalDate deathDate;

	// Bölüm konfigürasyonu (JSON string)
	@Size(max = 500)
	private String sectionOrder;

	// Extra data alanları (Python'daki extra_data_dict'in düzleştirilmiş hali)
	@Size(max = 80, message = "Alt başlık en fazla 80 karakter olabilir")
	private String subtitle;
	@Size(max = 150, message = "Alıntı söz en fazla 150 karakter olabilir")
	private String quote;
	@jakarta.validation.constraints.NotBlank(message = "Ana dil boş bırakılamaz")
	@Size(max = 100)
	private String langAna;
	@Size(max = 100)
	private String langIleri;
	@Size(max = 100)
	private String langUzmanlik;
	@jakarta.validation.constraints.NotBlank(message = "Kişilik özellikleri boş bırakılamaz")
	@Size(max = 100)
	private String traits;
	@Size(max = 100)
	private String physical;
	@Size(max = 100)
	private String biggestFear;
	@Size(max = 100)
	private String makesCry;
	@Size(max = 300)
	private String happiestMemory;
	@Size(max = 100)
	private String makesLaugh;
	@Size(max = 300)
	private String will;
	@Size(max = 100)
	private String viewsLikes;
	@Size(max = 100)
	private String titles;
	@Size(max = 50)
	private String zodiac;
	@jakarta.validation.constraints.NotBlank(message = "Ölüm nedeni boş bırakılamaz")
	@Size(max = 80)
	private String deathCause;
	@Size(max = 100)
	private String countdown;
	@Size(max = 250)
	private String education;
	@Size(max = 250)
	private String certifications;
	@Size(max = 500)
	private String socialProjects;
	@Size(max = 2000)
	private String timeline;
	@Size(max = 2000)
	private String works;
	@Size(max = 250)
	private String friends;
	@Size(max = 250)
	private String pets;
	@Size(max = 250)
	private String books;
	@Size(max = 50)
	private String food;
	@Size(max = 50)
	private String colorSeason;
	@Size(max = 50)
	private String flower;
	@Size(max = 50)
	private String scent;
	@Size(max = 100)
	private String sports;
	@Size(max = 100)
	private String museums;
	@Size(max = 100)
	private String historicalPlaces;
	@Size(max = 100)
	private String movies;
	@Size(max = 50)
	private String graveCity;
	@jakarta.validation.constraints.NotBlank(message = "Mezarlık mevkisi boş bırakılamaz")
	@Size(max = 150)
	private String graveLocation;
	@Size(max = 200)
	private String graveWill;

	// Checkbox alanları
	private Boolean aiVoiceActive;
	private Boolean arEnabled;
	private Boolean autoAnniversarySms;

	// Gizli alanlar (JSON string)
	private String hiddenFields;

	// Admin edit desteği
	private Long memorialIdToEdit;
}
