package com.dijitalanit.model;

import java.time.LocalDate;
import java.util.List;

import com.dijitalanit.enums.MemorialStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "memorial")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Memorial extends BaseEntity {

	// ==================== İLİŞKİ ====================
	// Python: user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	@JsonIgnore
	private User user;

	// ==================== KİMLİK BİLGİLERİ ====================
	@Column(name = "first_name", length = 50)
	private String firstName;

	@Column(name = "last_name", length = 50)
	private String lastName;

	@Column(name = "name", nullable = false, length = 100)
	private String name;

	// Python: slug = db.Column(db.String(100), unique=True)
	@Column(name = "slug", unique = true, nullable = false, length = 100)
	private String slug;

	@Column(name = "bio", columnDefinition = "TEXT")
	private String bio;

	// ==================== KONUM ====================
	@Column(name = "lat")
	private Double lat;

	@Column(name = "lng")
	private Double lng;

	// ==================== DURUM ====================
	@Column(name = "status")
	@Enumerated(EnumType.STRING)
	private MemorialStatus status = MemorialStatus.PENDING;

	// ==================== FİLTRELEME ALANLARI ====================
	@Column(name = "city", length = 50)
	private String city;

	@Column(name = "district", length = 50)
	private String district;

	@Column(name = "occupation", length = 100)
	private String occupation;

	// Python: gender = db.Column(db.String(20)) → 'male', 'female', 'other'
	@Column(name = "gender", length = 20)
	private String gender;

	// Python: category = db.Column(db.String(100)) → 'sehit', 'kadin_cinayeti', etc.
	@Column(name = "category", length = 100)
	private String category;

	// Python: death_cause = db.Column(db.String(100))
	@Column(name = "death_cause", length = 100)
	private String deathCause;

	// Python: lifestyle_tags = db.Column(db.Text)
	@Column(name = "lifestyle_tags", columnDefinition = "TEXT")
	private String lifestyleTags;

	@Column(name = "birth_year")
	private Integer birthYear;

	@Column(name = "death_year")
	private Integer deathYear;

	@Column(name = "birth_date")
	private LocalDate birthDate;

	@Column(name = "death_date")
	private LocalDate deathDate;

	// ==================== KONFİGÜRASYON ====================
	// Python: section_config = db.Column(db.Text) → JSON string
	@Column(name = "section_config", columnDefinition = "TEXT")
	private String sectionConfig;

	// Python: extra_data = db.Column(db.Text) → JSON string (subtitle, quote, timeline, vs.)
	@Column(name = "extra_data", columnDefinition = "TEXT")
	private String extraData;

	// ==================== ETKİLEŞİM SAYAÇLARI ====================
	@Column(name = "fatiha_count")
	private Integer fatihaCount = 0;

	@Column(name = "helallik_count")
	private Integer helallikCount = 0;

	@Column(name = "flower_count")
	private Integer flowerCount = 0;

	@Column(name = "dua_count")
	private Integer duaCount = 0;

	// ==================== İLİŞKİLER ====================
	// Python: media = db.relationship('Media', backref='memorial', cascade="all, delete-orphan")
	@OneToMany(mappedBy = "memorial", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Media> media;

	// Python: comments = db.relationship('Comment', ..., order_by="desc(Comment.created_at)")
	@OneToMany(mappedBy = "memorial", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("createdAt DESC")
	private List<Comment> comments;
}
