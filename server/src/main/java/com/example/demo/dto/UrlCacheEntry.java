package com.example.demo.dto;

import java.time.LocalDateTime;

public record UrlCacheEntry(
    Long id,
    Long userId,
    String originalUrl,
    boolean isActive,
    LocalDateTime expiresAt
) {}
