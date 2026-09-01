package com.example.demo.dto;

import java.time.LocalDateTime;

public record UrlCacheEntry(
    Long id,
    Long userId,
    String originalUrl,
    String iosUrl,
    String androidUrl,
    boolean isActive,
    boolean isPasswordProtected,
    LocalDateTime expiresAt,
    Integer maxClicks
) {}
