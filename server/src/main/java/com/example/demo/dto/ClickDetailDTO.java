package com.example.demo.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClickDetailDTO {
    private LocalDateTime clickedAt;
    private String ipAddress;
    private String userAgent;
    private String referrer;
    private String country;
    private String region;
    private String city;
    private String utmSource;
    private String utmMedium;
    private String utmCampaign;
}
