package com.dijitalanit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dijitalanit.model.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

	// Python: Comment.query.filter_by(memorial_id=memorial.id, is_approved=False)
	List<Comment> findByMemorialIdAndIsApprovedOrderByCreatedAtDesc(Long memorialId, Boolean isApproved);

	List<Comment> findByMemorialIdOrderByCreatedAtDesc(Long memorialId);

	// Admin: tüm onay bekleyen yorumlar
	List<Comment> findByIsApprovedOrderByCreatedAtDesc(Boolean isApproved);
}
