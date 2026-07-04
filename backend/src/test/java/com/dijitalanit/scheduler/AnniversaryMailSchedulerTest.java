package com.dijitalanit.scheduler;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.time.LocalDate;
import java.util.Date;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.transaction.annotation.Transactional;

import com.dijitalanit.enums.MemorialStatus;
import com.dijitalanit.enums.UserRole;
import com.dijitalanit.model.Memorial;
import com.dijitalanit.model.User;
import com.dijitalanit.repository.MemorialRepository;
import com.dijitalanit.repository.UserRepository;
import com.dijitalanit.service.IMailService;

@SpringBootTest(classes = com.dijitalanit.starter.DijitalAnitApplication.class)
@Transactional
public class AnniversaryMailSchedulerTest {

	@Autowired
	private AnniversaryMailScheduler scheduler;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private MemorialRepository memorialRepository;

	@Autowired
	private com.dijitalanit.repository.RefreshTokenRepository refreshTokenRepository;

	@MockBean
	private IMailService mailService;

	private User activeUser;
	private User optedOutUser;

	@BeforeEach
	void setUp() {
		// Clean up database for transaction
		memorialRepository.deleteAll();
		refreshTokenRepository.deleteAll();
		userRepository.deleteAll();

		// Create user with email notifications enabled
		activeUser = new User();
		activeUser.setUsername("testuser1");
		activeUser.setEmail("test1@dijitalanit.com");
		activeUser.setPassword("password");
		activeUser.setRole(UserRole.USER);
		activeUser.setIsVerified(true);
		activeUser.setAnniversaryNotificationsEnabled(true);
		activeUser.setCreateTime(new Date());
		activeUser = userRepository.save(activeUser);

		// Create user with email notifications disabled (opt-out)
		optedOutUser = new User();
		optedOutUser.setUsername("testuser2");
		optedOutUser.setEmail("test2@dijitalanit.com");
		optedOutUser.setPassword("password");
		optedOutUser.setRole(UserRole.USER);
		optedOutUser.setIsVerified(true);
		optedOutUser.setAnniversaryNotificationsEnabled(false);
		optedOutUser.setCreateTime(new Date());
		optedOutUser = userRepository.save(optedOutUser);
	}

	@Test
	void testSchedulerSendsMailForTomorrowAnniversary() throws Exception {
		// Case 1: Memorial with anniversary tomorrow, notifications enabled -> SHOULD SEND
		Memorial memorialSend = new Memorial();
		memorialSend.setUser(activeUser);
		memorialSend.setName("Ahmet Yilmaz");
		memorialSend.setSlug("ahmet-yilmaz");
		memorialSend.setStatus(MemorialStatus.APPROVED);
		memorialSend.setDeathDate(LocalDate.now().plusDays(1).minusYears(3)); // 3 years ago tomorrow
		memorialRepository.save(memorialSend);

		// Case 2: Memorial with anniversary tomorrow, but notifications disabled -> SHOULD NOT SEND
		Memorial memorialOptOut = new Memorial();
		memorialOptOut.setUser(optedOutUser);
		memorialOptOut.setName("Mehmet Yilmaz");
		memorialOptOut.setSlug("mehmet-yilmaz");
		memorialOptOut.setStatus(MemorialStatus.APPROVED);
		memorialOptOut.setDeathDate(LocalDate.now().plusDays(1).minusYears(3));
		memorialRepository.save(memorialOptOut);

		// Case 3: Memorial with anniversary in 2 days, notifications enabled -> SHOULD NOT SEND
		Memorial memorialNotTomorrow = new Memorial();
		memorialNotTomorrow.setUser(activeUser);
		memorialNotTomorrow.setName("Can Yilmaz");
		memorialNotTomorrow.setSlug("can-yilmaz");
		memorialNotTomorrow.setStatus(MemorialStatus.APPROVED);
		memorialNotTomorrow.setDeathDate(LocalDate.now().plusDays(2).minusYears(2));
		memorialRepository.save(memorialNotTomorrow);

		// Case 4: Memorial whose death was tomorrow in the current year -> SHOULD NOT SEND (not an anniversary yet)
		Memorial memorialDiedToday = new Memorial();
		memorialDiedToday.setUser(activeUser);
		memorialDiedToday.setName("Yeni Vefat");
		memorialDiedToday.setSlug("yeni-vefat");
		memorialDiedToday.setStatus(MemorialStatus.APPROVED);
		memorialDiedToday.setDeathDate(LocalDate.now().plusDays(1)); // died tomorrow (this year)
		memorialRepository.save(memorialDiedToday);

		// Run the scheduler task
		scheduler.checkAndSendAnniversaryMails();

		// Verify that mail is sent exactly once to test1@dijitalanit.com for Ahmet Yilmaz
		verify(mailService, times(1)).sendAnniversaryEmail(
				eq("test1@dijitalanit.com"),
				eq("testuser1"),
				eq("Ahmet Yilmaz"),
				eq("ahmet-yilmaz")
		);

		// Verify that no emails were sent to test2@dijitalanit.com
		verify(mailService, never()).sendAnniversaryEmail(
				eq("test2@dijitalanit.com"),
				anyString(),
				anyString(),
				anyString()
		);
	}
}
