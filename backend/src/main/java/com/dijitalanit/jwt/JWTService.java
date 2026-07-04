package com.dijitalanit.jwt;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JWTService {

	@Value("${app.jwt.secret-key}")
	private String secretKey;

	@Value("${app.jwt.access-token-expiration}")
	private long accessTokenExpiration;

	public String generateToken(UserDetails userDetails) {
		var builder = Jwts.builder()
				.setSubject(userDetails.getUsername())
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration));
		if (userDetails instanceof com.dijitalanit.model.User user) {
			builder.claim("role", user.getRole().name());
		}
		return builder.signWith(getKey(), SignatureAlgorithm.HS256)
				.compact();
	}

	public <T> T exportToken(String token, Function<Claims, T> claimsFunc) {
		Claims claims = getClaims(token);
		return claimsFunc.apply(claims);
	}

	public Claims getClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(getKey())
				.build()
				.parseClaimsJws(token).getBody();
	}

	public String getUsernameByToken(String token) {
		return exportToken(token, Claims::getSubject);
	}

	public boolean isTokenValid(String token) {
		Date expireDate = exportToken(token, Claims::getExpiration);
		return new Date().before(expireDate);
	}

	public Key getKey() {
		byte[] bytes = Decoders.BASE64.decode(secretKey);
		return Keys.hmacShaKeyFor(bytes);
	}
}
