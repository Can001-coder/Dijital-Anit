package com.dijitalanit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dijitalanit.model.Media;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {

	// Python: Media.query.filter_by(memorial_id=memorial.id, file_type='image').first()
	Optional<Media> findByMemorialIdAndFileType(Long memorialId, String fileType);

	// Python: Media.query.filter_by(memorial_id=memorial.id, is_approved=False, source='visitor')
	List<Media> findByMemorialIdAndIsApprovedAndSource(Long memorialId, Boolean isApproved, String source);

	List<Media> findByMemorialId(Long memorialId);

	// Admin: tüm onay bekleyen medyalar (ziyaretçi yüklemeleri vb.)
	List<Media> findByIsApprovedOrderByIdDesc(Boolean isApproved);
}
