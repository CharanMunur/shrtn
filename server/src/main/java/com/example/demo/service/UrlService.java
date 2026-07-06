package com.example.demo.service;

import com.example.demo.dto.ClickDetailDTO;
import com.example.demo.dto.UrlAnalyticsResponse;
import com.example.demo.dto.UrlCacheEntry;
import com.example.demo.dto.UrlRequest;
import com.example.demo.dto.UrlResponse;
import com.example.demo.model.Click;
import com.example.demo.model.Url;
import com.example.demo.model.User;
import com.example.demo.repository.ClickRepository;
import com.example.demo.repository.UrlRepository;
import com.example.demo.utils.AuthUtils;
import com.example.demo.utils.Base62Encoder;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import ua_parser.Client;
import ua_parser.Parser;

@Service
public class UrlService {

    private static final Parser USER_AGENT_PARSER = new Parser();

    private final UrlRepository urlRepository;
    private final ClickRepository clickRepository;
    private final StringRedisTemplate redisTemplate;
    private final AuthUtils authUtils;
    private final ObjectMapper objectMapper;

    public UrlService(
        UrlRepository urlRepository,
        AuthUtils authUtils,
        ClickRepository clickRepository,
        StringRedisTemplate redisTemplate,
        ObjectMapper objectMapper
    ) {
        this.urlRepository = urlRepository;
        this.authUtils = authUtils;
        this.clickRepository = clickRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    // Creates a short URL for the authenticated user and stores the mapping in Postgres.
    @Transactional
    public UrlResponse shortenUrl(UrlRequest request) {
        User user = authUtils.getCurrentUser();

        long count = urlRepository.countByUser(user);

        if (count >= 25) {
            throw new RuntimeException("You have reached the maximum number of URLs");
        }

        String originalUrl = request.getOriginalUrl();

        Url url = Url.builder()
            .originalUrl(originalUrl)
            .user(user)
            .createdAt(LocalDateTime.now())
            .expiresAt(LocalDateTime.now().plusDays(30))
            .build();

        Url saved = urlRepository.save(url);

        Long id = saved.getId();
        String shortCode = Base62Encoder.encode(id);

        saved.setShortCode(shortCode);

        urlRepository.save(saved);
        redisTemplate.delete(userUrlsCacheKey(user.getId()));

        return new UrlResponse(shortCode, originalUrl, 0, saved.isActive(), saved.getExpiresAt());
    }

    // Resolves a short code to its destination URL, preferring Redis before falling back to DB.
    public String redirectUrl(String shortCode, String ipAddress, String userAgent) {
        String cacheKey = "url:" + shortCode;
        String cachedJson = redisTemplate.opsForValue().get(cacheKey);

        UrlCacheEntry cachedEntry = null;
        if (cachedJson != null) {
            cachedEntry = readCacheEntry(cachedJson);
        }

        String originalUrl;
        Long urlId;
        Long ownerUserId;

        if (cachedEntry != null) {
            if (!cachedEntry.isActive()) {
                throw new RuntimeException("This link is disabled");
            }
            if (cachedEntry.expiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("This link has expired");
            }

            originalUrl = cachedEntry.originalUrl();
            urlId = cachedEntry.id();
            ownerUserId = cachedEntry.userId();
        } else {
            Url url = urlRepository
                .findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("Short code not found"));

            if (!url.isActive()) {
                throw new RuntimeException("This link is disabled");
            }
            if (url.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("This link has expired");
            }

            originalUrl = url.getOriginalUrl();
            urlId = url.getId();
            ownerUserId = url.getUser().getId();

            cacheUrl(cacheKey, url);
        }

        Click click = Click.builder()
            .url(urlRepository.getReferenceById(urlId))
            .clickedAt(LocalDateTime.now())
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .build();

        clickRepository.save(click);
        redisTemplate.delete("analytics:" + shortCode);
        if (ownerUserId != null) {
            redisTemplate.delete(userUrlsCacheKey(ownerUserId));
        }

        return originalUrl;
    }

    // Stores a lightweight URL snapshot in Redis so redirects can avoid a DB lookup on cache hits.
    private void cacheUrl(String cacheKey, Url url) {
        try {
            UrlCacheEntry entry = new UrlCacheEntry(
                url.getId(),
                url.getUser().getId(),
                url.getOriginalUrl(),
                url.isActive(),
                url.getExpiresAt()
            );
            redisTemplate
                .opsForValue()
                .set(cacheKey, objectMapper.writeValueAsString(entry), Duration.ofHours(24));
        } catch (Exception e) {
            throw new RuntimeException("Failed to cache URL", e);
        }
    }

    // Reads the cached JSON snapshot back into a typed object.
    private UrlCacheEntry readCacheEntry(String cachedJson) {
        try {
            return objectMapper.readValue(cachedJson, UrlCacheEntry.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read cached URL", e);
        }
    }

    // Returns the authenticated user's URLs along with click counts.
    public List<UrlResponse> getUserUrls() {
        User user = authUtils.getCurrentUser();
        String cacheKey = userUrlsCacheKey(user.getId());

        String cachedJson = redisTemplate.opsForValue().get(cacheKey);
        if (cachedJson != null) {
            return readUserUrlsCache(cachedJson);
        }

        List<Url> urls = urlRepository.findByUser(user);

        if (urls.isEmpty()) {
            redisTemplate.opsForValue().set(cacheKey, "[]", Duration.ofSeconds(30));
            return List.of();
        }

        Map<Long, Long> clickCounts = clickRepository
            .countClicksGroupedByUrl(urls)
            .stream()
            .collect(Collectors.toMap(row -> (Long) row[0], row -> (Long) row[1]));

        List<UrlResponse> response = urls
            .stream()
            .map(url ->
                new UrlResponse(
                    url.getShortCode(),
                    url.getOriginalUrl(),
                    clickCounts.getOrDefault(url.getId(), 0L),
                    url.isActive(),
                    url.getExpiresAt()
                )
            )
            .toList();

        cacheUserUrls(cacheKey, response);
        return response;
    }

    private String userUrlsCacheKey(Long userId) {
        return "urls:" + userId;
    }

    private void cacheUserUrls(String cacheKey, List<UrlResponse> urls) {
        try {
            redisTemplate
                .opsForValue()
                .set(cacheKey, objectMapper.writeValueAsString(urls), Duration.ofSeconds(30));
        } catch (Exception e) {
            throw new RuntimeException("Failed to cache URL list", e);
        }
    }

    private List<UrlResponse> readUserUrlsCache(String cachedJson) {
        try {
            return objectMapper.readValue(
                cachedJson,
                objectMapper
                    .getTypeFactory()
                    .constructCollectionType(List.class, UrlResponse.class)
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to read cached URL list", e);
        }
    }

    // Enables or disables one of the current user's links and invalidates its redirect cache.
    public boolean toggleUrlStatus(String shortCode) {
        User user = authUtils.getCurrentUser();

        Url url = urlRepository
            .findByShortCode(shortCode)
            .orElseThrow(() -> new RuntimeException("Short code not found"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You dont own this url");
        }

        url.setActive(!url.isActive());
        urlRepository.save(url);
        redisTemplate.delete("url:" + shortCode);
        redisTemplate.delete(userUrlsCacheKey(user.getId()));

        return url.isActive();
    }

    // Deletes the URL, its click history, and any related Redis cache entries.
    @Transactional
    public void deleteUrl(String shortCode) {
        User user = authUtils.getCurrentUser();

        Url url = urlRepository
            .findByShortCode(shortCode)
            .orElseThrow(() -> new RuntimeException("Short code not found"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You dont own this url");
        }

        clickRepository.deleteByUrl(url);
        urlRepository.delete(url);
        redisTemplate.delete("url:" + shortCode);
        redisTemplate.delete("analytics:" + shortCode);
        redisTemplate.delete(userUrlsCacheKey(user.getId()));
    }

    // Builds analytics from cached JSON when available, otherwise computes and caches it.
    public UrlAnalyticsResponse getUrlAnalytics(String shortCode) {
        User user = authUtils.getCurrentUser();

        String cacheKey = "analytics:" + shortCode;
        String cachedJson = redisTemplate.opsForValue().get(cacheKey);

        if (cachedJson != null) {
            UrlAnalyticsResponse cached = objectMapper.readValue(
                cachedJson,
                UrlAnalyticsResponse.class
            );
            Url url = urlRepository
                .findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("Short code not found"));

            if (!url.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("You dont own this url");
            }

            return cached;
        } else {
            Url url = urlRepository
                .findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("Short code not found"));

            if (!url.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("You dont own this url");
            }

            List<Click> clicks = clickRepository.findByUrl(url);

            Map<String, Long> browserBreakdown = clicks
                .stream()
                .map(click -> extractBrowser(click.getUserAgent()))
                .collect(Collectors.groupingBy(browser -> browser, Collectors.counting()));

            Map<String, Long> osBreakdown = clicks
                .stream()
                .map(click -> extractOperatingSystem(click.getUserAgent()))
                .collect(Collectors.groupingBy(os -> os, Collectors.counting()));

            Map<String, Long> clicksByDate = clicks
                .stream()
                .collect(
                    Collectors.groupingBy(
                        click -> click.getClickedAt().toLocalDate().toString(),
                        Collectors.counting()
                    )
                );

            List<ClickDetailDTO> lastClicks = clicks
                .stream()
                .sorted(Comparator.comparing(Click::getClickedAt).reversed())
                .limit(5)
                .map(click ->
                    ClickDetailDTO.builder()
                        .clickedAt(click.getClickedAt())
                        .ipAddress(click.getIpAddress())
                        .userAgent(click.getUserAgent())
                        .build()
                )
                .toList();

            UrlAnalyticsResponse result = UrlAnalyticsResponse.builder()
                .shortCode(url.getShortCode())
                .originalUrl(url.getOriginalUrl())
                .totalClicks(clicks.size())
                .lastClicks(lastClicks)
                .browserBreakdown(browserBreakdown)
                .osBreakdown(osBreakdown)
                .clicksByDate(clicksByDate)
                .build();
            String json = objectMapper.writeValueAsString(result);

            redisTemplate.opsForValue().set(cacheKey, json, Duration.ofHours(24));
            return result;
        }
    }

    // Parses the browser family from the user-agent string.
    private String extractBrowser(String userAgent) {
        Client client = USER_AGENT_PARSER.parse(userAgent);
        if (client == null || client.userAgent == null || client.userAgent.family == null) {
            return "Unknown";
        }
        return client.userAgent.family != null ? client.userAgent.family : "Unknown";
    }

    // Parses the operating system family from the user-agent string.
    private String extractOperatingSystem(String userAgent) {
        Client client = USER_AGENT_PARSER.parse(userAgent);
        if (client == null || client.os == null || client.os.family == null) {
            return "Unknown";
        }
        return client.os.family != null ? client.os.family : "Unknown";
    }
}
