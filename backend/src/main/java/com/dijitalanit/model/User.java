package com.dijitalanit.model;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.dijitalanit.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity implements UserDetails {

	@Column(name = "username", unique = true, nullable = false, length = 50)
	private String username;

	@Column(name = "email", unique = true, nullable = false, length = 100)
	private String email;

	@Column(name = "password", nullable = false, length = 250)
	private String password;

	@Column(name = "role")
	@Enumerated(EnumType.STRING)
	private UserRole role = UserRole.USER;

	@Column(name = "is_verified")
	private Boolean isVerified = true;

	@Column(name = "verification_token", length = 100)
	private String verificationToken;

	@Column(name = "anniversary_notifications_enabled")
	private Boolean anniversaryNotificationsEnabled = true;

	@Column(name = "phone_number", length = 20)
	private String phoneNumber;

	@Column(name = "two_factor_token", length = 100)
	private String twoFactorToken;

	@Column(name = "two_factor_code", length = 10)
	private String twoFactorCode;

	@Column(name = "two_factor_expiry")
	private java.util.Date twoFactorExpiry;

	@Column(name = "reset_password_token", length = 100)
	private String resetPasswordToken;

	@Column(name = "reset_password_code", length = 10)
	private String resetPasswordCode;

	@Column(name = "reset_password_expiry")
	private java.util.Date resetPasswordExpiry;

	public Boolean getAnniversaryNotificationsEnabled() {
		return anniversaryNotificationsEnabled == null ? true : anniversaryNotificationsEnabled;
	}

	// Python: memorials = db.relationship('Memorial', backref='user', lazy=True)
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
	@JsonIgnore
	private List<Memorial> memorials;

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
	}
}
