package com.dijitalanit.enums;

import lombok.Getter;

@Getter
public enum MediaFileType {

	IMAGE("image"),
	AUDIO("audio"),
	GALLERY("gallery"),
	AUDIO_FATIHA("audio_fatiha"),
	AUDIO_YASIN("audio_yasin"),
	AUDIO_VOICE("audio_voice"),
	AUDIO_MUSIC("audio_music"),
	VISITOR_IMAGE("visitor_image"),
	VISITOR_VIDEO("visitor_video"),
	VISITOR_AUDIO("visitor_audio");

	private String value;

	MediaFileType(String value) {
		this.value = value;
	}
}
