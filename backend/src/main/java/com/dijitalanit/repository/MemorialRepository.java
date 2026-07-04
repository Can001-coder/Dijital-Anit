package com.dijitalanit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dijitalanit.enums.MemorialStatus;
import com.dijitalanit.model.Memorial;

@Repository
public interface MemorialRepository extends JpaRepository<Memorial, Long>, JpaSpecificationExecutor<Memorial> {

	// Python: Memorial.query.filter_by(user_id=current_user.id).first()
	Optional<Memorial> findByUserId(Long userId);

	// Python: Memorial.query.filter_by(slug=slug).first_or_404()
	Optional<Memorial> findBySlug(String slug);

	// Python: Memorial.query.filter_by(status='pending')
	List<Memorial> findByStatusOrderByIdDesc(MemorialStatus status);

	// Python: Memorial.query.filter_by(status='approved')
	List<Memorial> findByStatus(MemorialStatus status);

	// Python: Memorial.query.filter(Memorial.status == 'approved', Memorial.name.ilike(f'%{q}%'))
	@Query("SELECT m FROM Memorial m WHERE m.status = :status AND LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%'))")
	List<Memorial> searchByName(@Param("status") MemorialStatus status, @Param("query") String query);

	// İstatistik: distinct kategori, şehir, meslek, ölüm nedeni
	@Query("SELECT DISTINCT m.category FROM Memorial m WHERE m.category IS NOT NULL AND m.status = 'APPROVED'")
	List<String> findDistinctCategories();

	@Query("SELECT DISTINCT m.city FROM Memorial m WHERE m.city IS NOT NULL AND m.status = 'APPROVED'")
	List<String> findDistinctCities();

	@Query("SELECT DISTINCT m.occupation FROM Memorial m WHERE m.occupation IS NOT NULL AND m.status = 'APPROVED'")
	List<String> findDistinctOccupations();

	@Query("SELECT DISTINCT m.deathCause FROM Memorial m WHERE m.deathCause IS NOT NULL AND m.status = 'APPROVED'")
	List<String> findDistinctDeathCauses();

	// İstatistik: toplam etkileşim sayaçları
	@Query("SELECT COALESCE(SUM(m.fatihaCount), 0) FROM Memorial m")
	Long sumFatihaCount();

	@Query("SELECT COALESCE(SUM(m.flowerCount), 0) FROM Memorial m")
	Long sumFlowerCount();

	@Query("SELECT COALESCE(SUM(m.duaCount), 0) FROM Memorial m")
	Long sumDuaCount();

	@Query("SELECT COALESCE(SUM(m.helallikCount), 0) FROM Memorial m")
	Long sumHelallikCount();

	@Query("SELECT m FROM Memorial m JOIN m.user u WHERE m.deathDate IS NOT NULL " +
		   "AND EXTRACT(MONTH FROM m.deathDate) = :month " +
		   "AND EXTRACT(DAY FROM m.deathDate) = :day " +
		   "AND EXTRACT(YEAR FROM m.deathDate) < :year " +
		   "AND m.status = 'APPROVED' " +
		   "AND (u.anniversaryNotificationsEnabled IS NULL OR u.anniversaryNotificationsEnabled = true)")
	List<Memorial> findMemorialsForAnniversaryEmail(@Param("month") int month, @Param("day") int day, @Param("year") int year);
}
