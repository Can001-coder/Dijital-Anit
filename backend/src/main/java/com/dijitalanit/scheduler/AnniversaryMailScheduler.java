package com.dijitalanit.scheduler;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.dijitalanit.model.Memorial;
import com.dijitalanit.repository.MemorialRepository;
import com.dijitalanit.service.IMailService;

@Component
public class AnniversaryMailScheduler {

	private static final Logger log = LoggerFactory.getLogger(AnniversaryMailScheduler.class);

	@Autowired
	private MemorialRepository memorialRepository;

	@Autowired
	private IMailService mailService;

	// Runs every day at 9:00 AM
	@Scheduled(cron = "0 0 9 * * ?")
	public void checkAndSendAnniversaryMails() {
		log.info("Anniversary mail check started.");
		try {
			// Anniversary is tomorrow, so we check for tomorrow's month and day
			LocalDate tomorrow = LocalDate.now().plusDays(1);
			int month = tomorrow.getMonthValue();
			int day = tomorrow.getDayOfMonth();
			int year = tomorrow.getYear();

			List<Memorial> memorials = memorialRepository.findMemorialsForAnniversaryEmail(month, day, year);
			log.info("Found {} memorials with anniversary on {}/{}", memorials.size(), day, month);

			for (Memorial memorial : memorials) {
				if (memorial.getUser() != null && memorial.getUser().getEmail() != null) {
					String recipientEmail = memorial.getUser().getEmail();
					String username = memorial.getUser().getUsername();
					String memorialName = memorial.getName();
					String memorialSlug = memorial.getSlug();

					try {
						mailService.sendAnniversaryEmail(recipientEmail, username, memorialName, memorialSlug);
						log.info("Anniversary mail sent successfully to {} for memorial {}", recipientEmail, memorialName);
					} catch (Exception e) {
						log.error("Failed to send anniversary mail to {} for memorial {}: {}", recipientEmail, memorialName, e.getMessage(), e);
					}
				}
			}
		} catch (Exception e) {
			log.error("Error occurred in checkAndSendAnniversaryMails: {}", e.getMessage(), e);
		}
		log.info("Anniversary mail check completed.");
	}
}
