package com.dijitalanit.service;

public interface IQrCodeService {

	// Python: generate_qr(slug) → QR code PNG byte array
	byte[] generateQrCode(String slug, String baseUrl);
}
