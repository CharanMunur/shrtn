package com.example.demo.dto;

import java.util.List;
import java.util.Map;

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
public class UrlAnalyticsResponse {
    private String shortCode;
    private String originalUrl;
    private long totalClicks;
    private List<ClickDetailDTO> lastClicks;
    private Map<String, Long> browserBreakdown;
    private Map<String, Long> osBreakdown;
    private Map<String, Long> clicksByDate;
    private Map<String, Long> referrerBreakdown;
    private Map<String, Long> deviceBreakdown;
    private Map<String, Long> countryBreakdown;
    private Map<String, Long> regionBreakdown;
    private Map<String, Long> cityBreakdown;
    private int[][] trafficHeatmap;
    private Double clickGrowthPercent;
    private String peakTime;
    private Double avgDailyClicks;
    private Map<String, Long> referrerCategories;
    private Map<String, Long> utmSources;
    private Map<String, Long> utmCampaigns;
}
