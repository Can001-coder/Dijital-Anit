package com.dijitalanit.service;

public interface IMailService {
	void sendAnniversaryEmail(String recipientEmail, String username, String memorialName, String memorialSlug) throws Exception;
	void sendTwoFactorEmail(String recipientEmail, String username, String code) throws Exception;
}
