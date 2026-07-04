package com.dijitalanit.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dijitalanit.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByUsername(String username);

	Optional<User> findByEmail(String email);

	Optional<User> findByVerificationToken(String verificationToken);

	boolean existsByUsername(String username);

	boolean existsByEmail(String email);
}
