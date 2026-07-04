package com.dijitalanit.model;

import java.util.Date;

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
@Table(name = "comment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Comment extends BaseEntity {

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "memorial_id", nullable = false)
	@JsonIgnore
	private Memorial memorial;

	// Python: name = db.Column(db.String(100), default="Ziyaretçi")
	@Column(name = "commenter_name", nullable = false, length = 100)
	private String commenterName = "Ziyaretçi";

	// Python: content = db.Column(db.Text)
	@Column(name = "content", nullable = false, columnDefinition = "TEXT")
	private String content;

	@Column(name = "is_approved")
	private Boolean isApproved = false;

	@Column(name = "created_at")
	private Date createdAt;
}
