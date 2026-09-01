package com.example.demo.dto;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UrlResponse {
    private String shortCode;
    private String originalUrl;
    private long totalClicks;
    
    @Getter(onMethod_ = {@JsonProperty("isActive")})
    private boolean isActive;

    @Getter(onMethod_ = {@JsonProperty("hasQrCode")})
    private boolean hasQrCode;

    @Getter(onMethod_ = {@JsonProperty("isPasswordProtected")})
    private boolean isPasswordProtected;
    
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private String iosUrl;
    private String androidUrl;
    private Integer maxClicks;
}
