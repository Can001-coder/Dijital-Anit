package com.dijitalanit.service;

import java.util.List;

import com.dijitalanit.dto.ActionResponse;
import com.dijitalanit.dto.DtoCommentIU;
import com.dijitalanit.dto.DtoComment;
import com.dijitalanit.dto.DtoMemorial;
import com.dijitalanit.dto.DtoMemorialIU;
import com.dijitalanit.dto.SearchResultDto;

public interface IMemorialService {

	// Dashboard: kullanıcının kendi anıtını getir
	DtoMemorial getMemorialByUserId(Long userId);

	// Dashboard: belirli bir anıtı getir (admin)
	DtoMemorial getMemorialById(Long memorialId);

	// Anıt oluştur veya güncelle (Python: update_memorial)
	DtoMemorial createOrUpdateMemorial(Long userId, DtoMemorialIU input);

	// Public: slug ile anıt getir (Python: profile/<slug>)
	DtoMemorial getMemorialBySlug(String slug, boolean preview);

	// Public: ana sayfa filtreleme (Python: index route)
	List<DtoMemorial> getApprovedMemorials(String firstName, String lastName, String city,
			String district, String occupation, String gender, String category,
			String deathCause, Integer ageMin, Integer ageMax);

	// Arama (Python: api/search_memorial)
	List<SearchResultDto> searchMemorials(String query);

	// Etkileşim (Python: action/<id>/<action_type>)
	ActionResponse handleAction(Long memorialId, String actionType);

	// Yorum (Python: comment/<id>)
	DtoComment addComment(Long memorialId, DtoCommentIU input);

	// Admin: onay / red / beklet
	void approveMemorial(Long memorialId);
	void rejectMemorial(Long memorialId);
	void pendingMemorial(Long memorialId);

	// Moderasyon (Python: moderate/<item_id>/<item_type>/<action>)
	void moderateComment(Long commentId, String action, Long currentUserId);
	void moderateMedia(Long mediaId, String action, Long currentUserId);
	
	// Kullanıcının kendi anıtını silmesi (Profilim sayfasından)
	void deleteMyMemorial(Long userId);
}
