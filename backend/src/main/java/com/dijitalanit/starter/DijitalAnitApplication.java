package com.dijitalanit.starter;

import java.io.File;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EntityScan(basePackages = "com.dijitalanit")
@ComponentScan(basePackages = "com.dijitalanit")
@EnableJpaRepositories(basePackages = "com.dijitalanit")
@EnableScheduling
public class DijitalAnitApplication {

	@Value("${app.upload.dir}")
	private String uploadDir;

	@org.springframework.beans.factory.annotation.Autowired
	private com.dijitalanit.repository.UserRepository userRepository;

	@org.springframework.beans.factory.annotation.Autowired
	private com.dijitalanit.repository.MemorialRepository memorialRepository;

	public static void main(String[] args) {
		SpringApplication.run(DijitalAnitApplication.class, args);
	}

	@Bean
	public CommandLineRunner init() {
		return args -> {
			new File(uploadDir + "/images").mkdirs();
			new File(uploadDir + "/audio").mkdirs();
			new File(uploadDir + "/video").mkdirs();
			System.out.println("Upload dizinleri oluşturuldu: " + new File(uploadDir).getAbsolutePath());

			// melih kullanıcısını kontrol et, yoksa oluştur
			java.util.Optional<com.dijitalanit.model.User> optUser = userRepository.findByUsername("melih");
			if (optUser.isEmpty()) {
				com.dijitalanit.model.User user = new com.dijitalanit.model.User();
				user.setUsername("melih");
				user.setEmail("dijitalanit.info@gmail.com");
				user.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("308233"));
				user.setRole(com.dijitalanit.enums.UserRole.USER);
				user.setIsVerified(true);
				user = userRepository.save(user);
				optUser = java.util.Optional.of(user);
				System.out.println("melih kullanıcısı veritabanında olmadığı için otomatik olarak oluşturuldu.");
			}

			if (optUser.isPresent()) {
				com.dijitalanit.model.User user = optUser.get();
				// Yıl dönümü testi için yarının tarihine denk gelen ölüm tarihi (yıl geçmiş bir yıl olmalı, örn 2020)
				java.time.LocalDate tomorrow = java.time.LocalDate.now().plusDays(1);
				java.time.LocalDate testDeathDate = java.time.LocalDate.of(2020, tomorrow.getMonthValue(), tomorrow.getDayOfMonth());

				boolean memorialExists = memorialRepository.findAll().stream()
						.anyMatch(m -> m.getUser() != null && m.getUser().getId().equals(user.getId()) && testDeathDate.equals(m.getDeathDate()));

				if (!memorialExists) {
					com.dijitalanit.model.Memorial memorial = new com.dijitalanit.model.Memorial();
					memorial.setUser(user);
					memorial.setFirstName("Test");
					memorial.setLastName("Yakını");
					memorial.setName("Test Yakını");
					memorial.setSlug("test-yakini-" + System.currentTimeMillis());
					memorial.setStatus(com.dijitalanit.enums.MemorialStatus.APPROVED);
					memorial.setDeathDate(testDeathDate);
					memorial.setDeathYear(2020);

					memorialRepository.save(memorial);
					System.out.println("Test anıtı başarıyla melih kullanıcısına eklendi (Ölüm tarihi: " + testDeathDate + ")");
				}
			}
		};
	}
}
