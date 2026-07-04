package com.dijitalanit.service;

import com.dijitalanit.dto.DtoUser;

public interface IUserService {
	DtoUser getProfile();
	DtoUser updateAnniversaryPreference(Boolean enabled);
	DtoUser updateProfile(com.dijitalanit.dto.UpdateProfileRequest request);
}
