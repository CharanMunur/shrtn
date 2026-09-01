package com.example.demo.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UrlRequest {
    private String originalUrl;
    private String customCode;
    private LocalDateTime expiresAt;
    private String password;
    private String iosUrl;
    private String androidUrl;
    private Integer maxClicks;
}
