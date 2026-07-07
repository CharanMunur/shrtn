package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class UrlApplication {

	public static void main(String[] args) {
		SpringApplication.run(UrlApplication.class, args);
	}

	@Bean
	public CommandLineRunner schemaInitializer(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE url_mappings ADD COLUMN IF NOT EXISTS has_qr_code BOOLEAN DEFAULT FALSE NOT NULL");
				System.out.println("Schema migration successfully executed: added has_qr_code column if missing.");
			} catch (Exception e) {
				System.err.println("Schema migration failed: " + e.getMessage());
			}
		};
	}
}
