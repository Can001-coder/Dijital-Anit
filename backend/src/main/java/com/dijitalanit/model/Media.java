package com.dijitalanit.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Media extends BaseEntity {

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "memorial_id", nullable = false)
	@JsonIgnore
	private Memorial memorial;

	// Python: file_path = db.Column(db.String(200))
	@Column(name = "file_path", nullable = false, length = 200)
	private String filePath;

	// Python: file_type = db.Column(db.String(10)) → 'image', 'audio', 'gallery'
	@Column(name = "file_type", nullable = false, length = 20)
	private String fileType;

	// Python: source = db.Column(db.String(20), default='owner') → 'owner' or 'visitor'
	@Column(name = "source", length = 20)
	private String source = "owner";

	@Column(name = "is_approved")
	private Boolean isApproved = false;
}
