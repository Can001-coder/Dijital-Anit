package com.dijitalanit.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.dijitalanit.service.IMailService;

import jakarta.mail.internet.MimeMessage;

@Service
public class MailServiceImpl implements IMailService {

	@Autowired(required = false)
	private JavaMailSender mailSender;

	@Value("${app.mail.from:info@dijitalanit.com}")
	private String mailFrom;

	@Value("${app.frontend.url:http://localhost:5173}")
	private String frontendUrl;

	@Override
	public void sendAnniversaryEmail(String recipientEmail, String username, String memorialName, String memorialSlug) throws Exception {
		if (mailSender == null) {
			throw new IllegalStateException("JavaMailSender is not configured. Please enable mail configuration in application.properties.");
		}

		MimeMessage message = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

		helper.setTo(recipientEmail);
		helper.setFrom(mailFrom);
		helper.setSubject(memorialName + " - Anma Yıl Dönümü Hatırlatması");

		String profileUrl = frontendUrl + "/profile?slug=" + memorialSlug;
		String settingsUrl = frontendUrl + "/user-profile";

		String htmlContent = buildHtmlContent(username, memorialName, profileUrl, settingsUrl);
		helper.setText(htmlContent, true);

		mailSender.send(message);
	}

	private String buildHtmlContent(String username, String memorialName, String profileUrl, String settingsUrl) {
		return "<!DOCTYPE html>\n" +
				"<html>\n" +
				"<head>\n" +
				"    <meta charset=\"UTF-8\">\n" +
				"    <title>Yıl Dönümü Hatırlatması</title>\n" +
				"    <style>\n" +
				"        body {\n" +
				"            font-family: 'Lora', 'Georgia', serif;\n" +
				"            background-color: #F7F8F6;\n" +
				"            color: #353834;\n" +
				"            margin: 0;\n" +
				"            padding: 0;\n" +
				"        }\n" +
				"        .container {\n" +
				"            max-width: 600px;\n" +
				"            margin: 40px auto;\n" +
				"            background-color: #ffffff;\n" +
				"            border: 1px solid #DDE2DB;\n" +
				"            border-radius: 12px;\n" +
				"            overflow: hidden;\n" +
				"            box-shadow: 0 4px 15px rgba(93, 112, 93, 0.05);\n" +
				"        }\n" +
				"        .header {\n" +
				"            background-color: #5D705D;\n" +
				"            padding: 30px;\n" +
				"            text-align: center;\n" +
				"        }\n" +
				"        .header h1 {\n" +
				"            color: #ffffff;\n" +
				"            margin: 0;\n" +
				"            font-size: 24px;\n" +
				"            font-family: 'Playfair Display', 'Georgia', serif;\n" +
				"            font-weight: normal;\n" +
				"            letter-spacing: 1px;\n" +
				"        }\n" +
				"        .content {\n" +
				"            padding: 40px 30px;\n" +
				"            line-height: 1.6;\n" +
				"            font-size: 16px;\n" +
				"        }\n" +
				"        .candle {\n" +
				"            text-align: center;\n" +
				"            font-size: 40px;\n" +
				"            margin-bottom: 20px;\n" +
				"        }\n" +
				"        .button-container {\n" +
				"            text-align: center;\n" +
				"            margin: 30px 0;\n" +
				"        }\n" +
				"        .btn {\n" +
				"            background-color: #5D705D;\n" +
				"            color: #ffffff !important;\n" +
				"            text-decoration: none;\n" +
				"            padding: 12px 30px;\n" +
				"            border-radius: 8px;\n" +
				"            font-weight: bold;\n" +
				"            display: inline-block;\n" +
				"            font-family: sans-serif;\n" +
				"            font-size: 15px;\n" +
				"        }\n" +
				"        .footer {\n" +
				"            background-color: #F7F8F6;\n" +
				"            padding: 20px 30px;\n" +
				"            text-align: center;\n" +
				"            font-size: 12px;\n" +
				"            color: #8A928A;\n" +
				"            border-top: 1px solid #DDE2DB;\n" +
				"        }\n" +
				"        .footer a {\n" +
				"            color: #5D705D;\n" +
				"            text-decoration: underline;\n" +
				"        }\n" +
				"    </style>\n" +
				"</head>\n" +
				"<body>\n" +
				"    <div class=\"container\">\n" +
				"        <div class=\"header\">\n" +
				"            <h1>Dijital Anıt</h1>\n" +
				"        </div>\n" +
				"        <div class=\"content\">\n" +
				"            <div class=\"candle\">🕯️</div>\n" +
				"            <p>Sayın <strong>" + username + "</strong>,</p>\n" +
				"            <p>Oluşturmuş olduğunuz anıt sayfası sahibi olduğunuz vefat eden yakınınız <strong>" + memorialName + "</strong>'ın aramızdan ayrılışının yıl dönümü yarındır.</p>\n" +
				"            <p>Kendisini sevgi, saygı ve rahmetle anıyoruz. Anısını tazelemek, anıtına bırakılan mesajları incelemek veya sevdiklerinizle paylaşmak için anıt sayfasını ziyaret edebilirsiniz.</p>\n" +
				"            <div class=\"button-container\">\n" +
				"                <a href=\"" + profileUrl + "\" class=\"btn\">Anıt Sayfasını Ziyaret Et</a>\n" +
				"            </div>\n" +
				"            <p>Huzur ve saygıyla,</p>\n" +
				"            <p><em>Dijital Anıt Ekibi</em></p>\n" +
				"        </div>\n" +
				"        <div class=\"footer\">\n" +
				"            <p>Bu e-posta, Dijital Anıt platformu üzerinden yıl dönümü hatırlatma tercihiniz doğrultusunda gönderilmiştir.</p>\n" +
				"            <p>Bildirim ayarlarınızı değiştirmek için <a href=\"" + settingsUrl + "\">profil sayfanızı</a> ziyaret edebilirsiniz.</p>\n" +
				"        </div>\n" +
				"    </div>\n" +
				"</body>\n" +
				"</html>";
	}

	@Override
	public void sendTwoFactorEmail(String recipientEmail, String username, String code) throws Exception {
		if (mailSender == null) {
			throw new IllegalStateException("JavaMailSender is not configured.");
		}

		MimeMessage message = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

		helper.setTo(recipientEmail);
		helper.setFrom(mailFrom);
		helper.setSubject("Dijital Anıt - Giriş Doğrulama Kodu");

		String htmlContent = build2FAHtmlContent(username, code);
		helper.setText(htmlContent, true);

		mailSender.send(message);
	}

	private String build2FAHtmlContent(String username, String code) {
		return "<!DOCTYPE html>\n" +
				"<html>\n" +
				"<head>\n" +
				"    <meta charset=\"UTF-8\">\n" +
				"    <title>Giriş Doğrulama</title>\n" +
				"    <style>\n" +
				"        body { font-family: 'Lora', 'Georgia', serif; background-color: #F7F8F6; color: #353834; margin: 0; padding: 0; }\n" +
				"        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #DDE2DB; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(93, 112, 93, 0.05); }\n" +
				"        .header { background-color: #5D705D; padding: 30px; text-align: center; }\n" +
				"        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-family: 'Playfair Display', 'Georgia', serif; font-weight: normal; letter-spacing: 1px; }\n" +
				"        .content { padding: 40px 30px; line-height: 1.6; font-size: 16px; text-align: center; }\n" +
				"        .code-box { background-color: #F7F8F6; border: 2px dashed #C2B69D; padding: 15px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #5D705D; margin: 20px auto; width: fit-content; border-radius: 8px; }\n" +
				"        .footer { background-color: #F7F8F6; padding: 20px 30px; text-align: center; font-size: 12px; color: #8A928A; border-top: 1px solid #DDE2DB; }\n" +
				"    </style>\n" +
				"</head>\n" +
				"<body>\n" +
				"    <div class=\"container\">\n" +
				"        <div class=\"header\">\n" +
				"            <h1>Dijital Anıt</h1>\n" +
				"        </div>\n" +
				"        <div class=\"content\">\n" +
				"            <p>Sayın <strong>" + username + "</strong>,</p>\n" +
				"            <p>Hesabınıza giriş yapmak için tek kullanımlık doğrulama kodunuz aşağıdadır:</p>\n" +
				"            <div class=\"code-box\">" + code + "</div>\n" +
				"            <p>Bu kod 3 dakika boyunca geçerlidir. Lütfen kodu kimseyle paylaşmayınız.</p>\n" +
				"        </div>\n" +
				"        <div class=\"footer\">\n" +
				"            <p>Eğer bu girişi siz yapmadıysanız lütfen hemen şifrenizi değiştiriniz.</p>\n" +
				"        </div>\n" +
				"    </div>\n" +
				"</body>\n" +
				"</html>";
	}
}
