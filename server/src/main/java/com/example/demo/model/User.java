package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    
    @Builder.Default
    @Column(nullable = false)
    private boolean isEmailVerified = false;

    @Column(nullable = false)
    private String password;

    @Builder.Default
    @Column(name = "auth_provider")
    private String provider = "LOCAL";

    @Column(unique = true)
    private String providerId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public String getProvider() {
        return provider == null ? "LOCAL" : provider;
    }
}
