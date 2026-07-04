package com.dijitalanit.service.impl;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.dijitalanit.exception.BaseException;
import com.dijitalanit.exception.ErrorMessage;
import com.dijitalanit.exception.MessageType;
import com.dijitalanit.service.IQrCodeService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

@Service
public class QrCodeServiceImpl implements IQrCodeService {

	/**
	 * Python karşılığı:
	 * qr = qrcode.QRCode(version=1, error_correction=ERROR_CORRECT_H, box_size=15, border=4)
	 * qr.add_data(url)
	 * img = qr.make_image(fill_color="#2c3e50", back_color="white")
	 */
	@Override
	public byte[] generateQrCode(String slug, String baseUrl) {
		try {
			String url = baseUrl + "/profile/" + slug;

			Map<EncodeHintType, Object> hints = new HashMap<>();
			hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
			hints.put(EncodeHintType.MARGIN, 4);

			QRCodeWriter writer = new QRCodeWriter();
			BitMatrix bitMatrix = writer.encode(url, BarcodeFormat.QR_CODE, 450, 450, hints);

			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

			return outputStream.toByteArray();
		} catch (Exception e) {
			throw new BaseException(new ErrorMessage(MessageType.GENERAL_EXCEPTION, null));
		}
	}
}
