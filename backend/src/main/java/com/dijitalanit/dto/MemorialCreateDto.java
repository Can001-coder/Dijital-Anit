package com.dijitalanit.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Şehitler kategorisi anıt ekleme/ziyaretçi defteri formu için
 * güvenli DTO. Jakarta Validation ile backend doğrulaması sağlar.
 * 
 * Frontend'den gelen her alan burada beyaz-liste mantığıyla kontrol edilir.
 */
@Getter
@Setter
public class MemorialCreateDto {

	// ==================== ZORUNLU ALANLAR (Validated) ====================

	@NotBlank(message = "Ad alanı boş bırakılamaz")
	@Size(max = 50, message = "Ad en fazla 50 karakter olabilir")
	private String firstName;

	@NotBlank(message = "Soyad alanı boş bırakılamaz")
	@Size(max = 50, message = "Soyad en fazla 50 karakter olabilir")
	private String lastName;

	@NotBlank(message = "Biyografi alanı boş bırakılamaz")
	@Size(max = 1000, message = "Biyografi en fazla 1000 karakter olabilir")
	private String bio;

	@jakarta.validation.constraints.NotNull(message = "Doğum tarihi boş bırakılamaz")
	private LocalDate birthDate;

	@jakarta.validation.constraints.NotNull(message = "Ölüm tarihi boş bırakılamaz")
	private LocalDate deathDate;

	@NotBlank(message = "Şehir alanı boş bırakılamaz")
	@Size(max = 50, message = "Şehir en fazla 50 karakter olabilir")
	private String city;

	@NotBlank(message = "İlçe alanı boş bırakılamaz")
	@Size(max = 50, message = "İlçe en fazla 50 karakter olabilir")
	private String district;

	@NotBlank(message = "Meslek alanı boş bırakılamaz")
	@Size(max = 80, message = "Meslek en fazla 80 karakter olabilir")
	private String occupation;

	@NotBlank(message = "Cinsiyet alanı boş bırakılamaz")
	@Size(max = 20, message = "Cinsiyet en fazla 20 karakter olabilir")
	private String gender;

	@NotBlank(message = "Ölüm nedeni boş bırakılamaz")
	@Size(max = 80, message = "Ölüm nedeni en fazla 80 karakter olabilir")
	private String deathCause;

	@NotBlank(message = "Kişilik özellikleri boş bırakılamaz")
	@Size(max = 100, message = "Kişilik özellikleri en fazla 100 karakter olabilir")
	private String traits;

	@NotBlank(message = "Konuştuğu diller boş bırakılamaz")
	@Size(max = 100, message = "Konuştuğu diller en fazla 100 karakter olabilir")
	private String langAna;

	// ==================== OPSİYONEL ALANLAR ====================

	@Size(max = 80, message = "Alt başlık en fazla 80 karakter olabilir")
	private String subtitle;

	@Size(max = 150, message = "Alıntı en fazla 150 karakter olabilir")
	private String quote;

	// Konum
	private Double lat;
	private Double lng;

	@Size(max = 100, message = "Kategori en fazla 100 karakter olabilir")
	private String category;

	// Bölüm konfigürasyonu (JSON string)
	private String sectionOrder;

	// Extra data alanları
	private String langIleri;

	@Size(max = 100, message = "Uzmanlık dilleri en fazla 100 karakter olabilir")
	private String langUzmanlik;

	@Size(max = 100, message = "Fiziksel özellik en fazla 100 karakter olabilir")
	private String physical;

	@Size(max = 100, message = "En büyük korkusu en fazla 100 karakter olabilir")
	private String biggestFear;

	@Size(max = 100, message = "Onu ağlatan en fazla 100 karakter olabilir")
	private String makesCry;

	@Size(max = 300, message = "En mutlu anısı en fazla 300 karakter olabilir")
	private String happiestMemory;

	@Size(max = 100, message = "Onu güldüren en fazla 100 karakter olabilir")
	private String makesLaugh;

	@Size(max = 300, message = "Vasiyet en fazla 300 karakter olabilir")
	private String will;

	private String viewsLikes;
	private String titles;
	private String zodiac;

	private String countdown;
	private String education;
	private String certifications;
	private String socialProjects;
	
	@Size(max = 2000, message = "Kronolojik olaylar çok uzun")
	private String timeline;
	@Size(max = 2000, message = "Eserler listesi çok uzun")
	private String works;
	
	private String friends;
	private String pets;
	private String books;
	
	@Size(max = 50)
	private String food;
	private String colorSeason;
	@Size(max = 50)
	private String flower;
	@Size(max = 50)
	private String scent;
	@Size(max = 100)
	private String sports;
	@Size(max = 100)
	private String museums;
	private String historicalPlaces;
	@Size(max = 100)
	private String movies;
	
	private String graveCity;
	
	@NotBlank(message = "Mezarlık mevkisi boş bırakılamaz")
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
