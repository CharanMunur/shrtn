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
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

    public UrlService(
        UrlRepository urlRepository,
        AuthUtils authUtils,
        ClickRepository clickRepository,
        StringRedisTemplate redisTemplate,
        ObjectMapper objectMapper,
        PasswordEncoder passwordEncoder
    ) {
        this.urlRepository = urlRepository;
        this.authUtils = authUtils;
        this.clickRepository = clickRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.passwordEncoder = passwordEncoder;
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

        // Validate expiration date
        LocalDateTime expiresAt = request.getExpiresAt();
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusDays(30);
        } else {
            if (expiresAt.isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Expiration date cannot be in the past");
            }
            if (expiresAt.isAfter(LocalDateTime.now().plusDays(90))) {
                throw new RuntimeException("Expiration date cannot exceed 90 days");
            }
        }

        String customCode = request.getCustomCode();
        String shortCode;
        boolean hasCustomCode = customCode != null && !customCode.trim().isEmpty();
        String trimmedCode = hasCustomCode ? customCode.trim() : null;

        if (hasCustomCode) {
            if (trimmedCode.length() < 3 || trimmedCode.length() > 30) {
                throw new RuntimeException("Custom alias must be between 3 and 30 characters");
            }
            if (!trimmedCode.matches("^[a-zA-Z0-9_-]+$")) {
                throw new RuntimeException("Custom alias can only contain letters, numbers, hyphens, and underscores");
            }
            if (urlRepository.existsByShortCode(trimmedCode)) {
                throw new RuntimeException("Custom alias is already in use");
            }

            // Reserved keywords validation
            List<String> reserved = List.of("shorten", "urls", "api", "login", "register", "dashboard", "analytics");
            if (reserved.contains(trimmedCode.toLowerCase())) {
                throw new RuntimeException("Custom alias is a reserved word");
            }
        }

        String rawPassword = request.getPassword();
        String passwordHash = null;
        if (rawPassword != null && !rawPassword.trim().isEmpty()) {
            String trimmedPass = rawPassword.trim();
            if (trimmedPass.length() < 3) {
                throw new RuntimeException("Password must be at least 3 characters");
            }
            passwordHash = passwordEncoder.encode(trimmedPass);
        }

        String iosUrl = request.getIosUrl() != null && !request.getIosUrl().trim().isEmpty() ? request.getIosUrl().trim() : null;
        String androidUrl = request.getAndroidUrl() != null && !request.getAndroidUrl().trim().isEmpty() ? request.getAndroidUrl().trim() : null;

        Url savedUrl;
        if (hasCustomCode) {
            shortCode = trimmedCode;

            Url url = Url.builder()
                .originalUrl(originalUrl)
                .shortCode(shortCode)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .passwordHash(passwordHash)
                .iosUrl(iosUrl)
                .androidUrl(androidUrl)
                .build();

            savedUrl = urlRepository.save(url);
        } else {
            Url url = Url.builder()
                .originalUrl(originalUrl)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .passwordHash(passwordHash)
                .iosUrl(iosUrl)
                .androidUrl(androidUrl)
                .build();

            Url saved = urlRepository.save(url);

            Long id = saved.getId();
            shortCode = Base62Encoder.encode(id);

            saved.setShortCode(shortCode);
            savedUrl = urlRepository.save(saved);
        }

        redisTemplate.delete(userUrlsCacheKey(user.getId()));

        boolean isProtected = passwordHash != null;
        return new UrlResponse(shortCode, originalUrl, 0, true, false, isProtected, expiresAt, savedUrl.getCreatedAt(), iosUrl, androidUrl);
    }

    private String resolveTargetUrl(String originalUrl, String iosUrl, String androidUrl, String userAgent) {
        if (userAgent != null && !userAgent.isBlank()) {
            try {
                Client client = USER_AGENT_PARSER.parse(userAgent);
                if (client != null && client.os != null && client.os.family != null) {
                    String os = client.os.family.toLowerCase();
                    if ((os.contains("ios") || os.contains("iphone") || os.contains("ipad") || os.contains("ipod"))
                            && iosUrl != null && !iosUrl.isBlank()) {
                        return iosUrl;
                    }
                    if (os.contains("android") && androidUrl != null && !androidUrl.isBlank()) {
                        return androidUrl;
                    }
                }
            } catch (Exception ignored) {
            }
        }
        return originalUrl;
    }

    // Resolves a short code to its destination URL, preferring Redis before falling back to DB.
    public String redirectUrl(String shortCode, String ipAddress, String userAgent, String referrer, String country) {
        String cacheKey = "url:" + shortCode;
        String cachedJson = redisTemplate.opsForValue().get(cacheKey);

        UrlCacheEntry cachedEntry = null;
        if (cachedJson != null) {
            cachedEntry = readCacheEntry(cachedJson);
        }

        String targetUrl;
        Long urlId;
        Long ownerUserId;

        if (cachedEntry != null) {
            if (!cachedEntry.isActive()) {
                throw new RuntimeException("This link is disabled");
            }
            if (cachedEntry.expiresAt() != null && cachedEntry.expiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("This link has expired");
            }
            if (cachedEntry.isPasswordProtected()) {
                throw new RuntimeException("Password required for this link");
            }

            targetUrl = resolveTargetUrl(cachedEntry.originalUrl(), cachedEntry.iosUrl(), cachedEntry.androidUrl(), userAgent);
            urlId = cachedEntry.id();
            ownerUserId = cachedEntry.userId();
        } else {
            Url url = urlRepository
                .findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("Short code not found"));

            if (!url.isActive()) {
                throw new RuntimeException("This link is disabled");
            }
            if (url.getExpiresAt() != null && url.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("This link has expired");
            }

            cacheUrl(cacheKey, url);

            if (url.getPasswordHash() != null && !url.getPasswordHash().trim().isEmpty()) {
                throw new RuntimeException("Password required for this link");
            }

            targetUrl = resolveTargetUrl(url.getOriginalUrl(), url.getIosUrl(), url.getAndroidUrl(), userAgent);
            urlId = url.getId();
            ownerUserId = url.getUser().getId();
        }

        Click click = Click.builder()
            .url(urlRepository.getReferenceById(urlId))
            .clickedAt(LocalDateTime.now())
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .referrer(referrer)
            .country(country)
            .build();

        Click savedClick = clickRepository.save(click);

        // Always evict analytics cache immediately so that dashboard click counts update in real-time.
        redisTemplate.delete("analytics:" + shortCode);

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            resolveCountry(savedClick.getId(), ipAddress, shortCode);
        });

        if (ownerUserId != null) {
            redisTemplate.delete(userUrlsCacheKey(ownerUserId));
        }

        return targetUrl;
    }

    // Unlocks a password-protected link, verifies password, records click analytics, and returns original URL.
    @Transactional
    public String unlockUrl(String shortCode, String rawPassword, String ipAddress, String userAgent, String referrer, String country) {
        Url url = urlRepository
            .findByShortCode(shortCode)
            .orElseThrow(() -> new RuntimeException("Short code not found"));

        if (!url.isActive()) {
            throw new RuntimeException("This link is disabled");
        }
        if (url.getExpiresAt() != null && url.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This link has expired");
        }
        if (url.getPasswordHash() == null || url.getPasswordHash().trim().isEmpty()) {
            return resolveTargetUrl(url.getOriginalUrl(), url.getIosUrl(), url.getAndroidUrl(), userAgent);
        }
        if (rawPassword == null || !passwordEncoder.matches(rawPassword.trim(), url.getPasswordHash())) {
            throw new RuntimeException("Incorrect password");
        }

        Click click = Click.builder()
            .url(url)
            .clickedAt(LocalDateTime.now())
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .referrer(referrer)
            .country(country)
            .build();

        Click savedClick = clickRepository.save(click);
        redisTemplate.delete("analytics:" + shortCode);

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            resolveCountry(savedClick.getId(), ipAddress, shortCode);
        });

        if (url.getUser() != null) {
            redisTemplate.delete(userUrlsCacheKey(url.getUser().getId()));
        }

        return resolveTargetUrl(url.getOriginalUrl(), url.getIosUrl(), url.getAndroidUrl(), userAgent);
    }

    // Stores a lightweight URL snapshot in Redis so redirects can avoid a DB lookup on cache hits.
    private void cacheUrl(String cacheKey, Url url) {
        try {
            boolean isProtected = url.getPasswordHash() != null && !url.getPasswordHash().trim().isEmpty();
            UrlCacheEntry entry = new UrlCacheEntry(
                url.getId(),
                url.getUser().getId(),
                url.getOriginalUrl(),
                url.getIosUrl(),
                url.getAndroidUrl(),
                url.isActive(),
                isProtected,
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
            .collect(Collectors.toMap(
                row -> ((Number) row[0]).longValue(),
                row -> ((Number) row[1]).longValue()
            ));

        List<UrlResponse> response = urls
            .stream()
            .map(url ->
                new UrlResponse(
                    url.getShortCode(),
                    url.getOriginalUrl(),
                    clickCounts.getOrDefault(url.getId(), 0L),
                    url.isActive(),
                    url.isHasQrCode(),
                    url.getPasswordHash() != null && !url.getPasswordHash().trim().isEmpty(),
                    url.getExpiresAt(),
                    url.getCreatedAt(),
                    url.getIosUrl(),
                    url.getAndroidUrl()
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

            Map<String, Long> referrerBreakdown = clicks
                .stream()
                .map(click -> extractReferrerDomain(click.getReferrer()))
                .collect(Collectors.groupingBy(ref -> ref, Collectors.counting()));

            Map<String, Long> deviceBreakdown = clicks
                .stream()
                .map(click -> extractDeviceType(click.getUserAgent()))
                .collect(Collectors.groupingBy(dev -> dev, Collectors.counting()));

            Map<String, Long> countryBreakdown = clicks
                .stream()
                .map(click -> click.getCountry() != null ? click.getCountry() : "Unknown")
                .collect(Collectors.groupingBy(c -> c, Collectors.counting()));

            Map<String, Long> regionBreakdown = clicks
                .stream()
                .map(click -> {
                    String region = click.getRegion() != null ? click.getRegion() : "Unknown";
                    String country = click.getCountry() != null ? click.getCountry() : "Unknown";
                    return region + ":" + country;
                })
                .collect(Collectors.groupingBy(r -> r, Collectors.counting()));

            Map<String, Long> cityBreakdown = clicks
                .stream()
                .map(click -> {
                    String city = click.getCity() != null ? click.getCity() : "Unknown";
                    String country = click.getCountry() != null ? click.getCountry() : "Unknown";
                    return city + ":" + country;
                })
                .collect(Collectors.groupingBy(c -> c, Collectors.counting()));

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

            int[][] trafficHeatmap = new int[7][24];
            for (Click click : clicks) {
                int day = click.getClickedAt().getDayOfWeek().getValue(); // 1 = Monday, 7 = Sunday
                int dayIndex = (day == 7) ? 0 : day; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                int hour = click.getClickedAt().getHour(); // 0 to 23
                trafficHeatmap[dayIndex][hour]++;
            }

            UrlAnalyticsResponse result = UrlAnalyticsResponse.builder()
                .shortCode(url.getShortCode())
                .originalUrl(url.getOriginalUrl())
                .totalClicks(clicks.size())
                .lastClicks(lastClicks)
                .browserBreakdown(browserBreakdown)
                .osBreakdown(osBreakdown)
                .clicksByDate(clicksByDate)
                .referrerBreakdown(referrerBreakdown)
                .deviceBreakdown(deviceBreakdown)
                .countryBreakdown(countryBreakdown)
                .regionBreakdown(regionBreakdown)
                .cityBreakdown(cityBreakdown)
                .trafficHeatmap(trafficHeatmap)
                .build();
            String json = objectMapper.writeValueAsString(result);

            redisTemplate.opsForValue().set(cacheKey, json, Duration.ofHours(24));
            return result;
        }
    }

    // Parses the referrer string to extract domain.
    private String extractReferrerDomain(String referrer) {
        if (referrer == null || referrer.trim().isEmpty()) {
            return "Direct / Unknown";
        }
        try {
            java.net.URI uri = new java.net.URI(referrer);
            String host = uri.getHost();
            if (host != null) {
                return host.startsWith("www.") ? host.substring(4) : host;
            }
        } catch (Exception e) {
            // Ignore parsing error
        }
        return referrer;
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

    // Classifies the device type (Desktop, Mobile, Tablet, Bot) from the User-Agent.
    private String extractDeviceType(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Desktop";
        }
        Client client = USER_AGENT_PARSER.parse(userAgent);
        if (client == null) {
            return "Desktop";
        }

        String os = client.os != null && client.os.family != null ? client.os.family : "";
        String device = client.device != null && client.device.family != null ? client.device.family : "";

        // 1. Check for bots/spiders
        if ("Spider".equalsIgnoreCase(device) || userAgent.toLowerCase().contains("bot") || userAgent.toLowerCase().contains("spider")) {
            return "Bot";
        }

        // 2. Check for Tablet
        if (device.toLowerCase().contains("ipad") || device.toLowerCase().contains("tablet") || userAgent.toLowerCase().contains("ipad") || 
            (userAgent.toLowerCase().contains("android") && !userAgent.toLowerCase().contains("mobile"))) {
            return "Tablet";
        }

        // 3. Check for Mobile
        if (device.toLowerCase().contains("iphone") || device.toLowerCase().contains("ipod") || 
            device.toLowerCase().contains("mobile") || device.toLowerCase().contains("phone") ||
            os.toLowerCase().contains("android") || os.toLowerCase().contains("ios") || 
            os.toLowerCase().contains("windows phone") || userAgent.toLowerCase().contains("mobile") ||
            "Generic Smartphone".equalsIgnoreCase(device) || "Generic Feature Phone".equalsIgnoreCase(device)) {
            return "Mobile";
        }

        // 4. Fallback to Desktop
        return "Desktop";
    }

    // Checks if a shortcode exists, is active, and is not expired (does not register a click).
    public boolean existsAndActive(String shortCode) {
        String cacheKey = "url:" + shortCode;
        String cachedJson = redisTemplate.opsForValue().get(cacheKey);
        if (cachedJson != null) {
            UrlCacheEntry cachedEntry = readCacheEntry(cachedJson);
            return cachedEntry != null && cachedEntry.isActive() && cachedEntry.expiresAt().isAfter(LocalDateTime.now());
        }
        return urlRepository.findByShortCode(shortCode)
            .map(url -> {
                cacheUrl(cacheKey, url);
                return url.isActive() && url.getExpiresAt().isAfter(LocalDateTime.now());
            })
            .orElse(false);
    }

    // Generates a QR Code for a link.
    @Transactional
    public boolean generateQrCode(String shortCode) {
        User user = authUtils.getCurrentUser();
        Url url = urlRepository.findByShortCode(shortCode)
            .orElseThrow(() -> new RuntimeException("Short code not found"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You dont own this url");
        }

        url.setHasQrCode(true);
        urlRepository.save(url);

        // Evict caches
        redisTemplate.delete("url:" + shortCode);
        redisTemplate.delete(userUrlsCacheKey(user.getId()));

        return true;
    }

    // Revokes a QR Code for a link.
    @Transactional
    public boolean revokeQrCode(String shortCode) {
        User user = authUtils.getCurrentUser();
        Url url = urlRepository.findByShortCode(shortCode)
            .orElseThrow(() -> new RuntimeException("Short code not found"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You dont own this url");
        }

        url.setHasQrCode(false);
        urlRepository.save(url);

        // Evict caches
        redisTemplate.delete("url:" + shortCode);
        redisTemplate.delete(userUrlsCacheKey(user.getId()));

        return false;
    }

    // Resolves country, region, and city from IP in the background.
    private void resolveCountry(Long clickId, String ipAddress, String shortCode) {
        String country = "Unknown";
        String region = "Unknown";
        String city = "Unknown";
        try {
            java.net.http.HttpClient httpClient = java.net.http.HttpClient.newHttpClient();
            String url = "http://ip-api.com/json/?fields=status,country,regionName,city";
            if (ipAddress != null && !ipAddress.isEmpty() && !isLocalIp(ipAddress)) {
                url = "http://ip-api.com/json/" + ipAddress + "?fields=status,country,regionName,city";
            }
            java.net.http.HttpRequest httpRequest = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(url))
                .timeout(java.time.Duration.ofSeconds(3))
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .GET()
                .build();
            java.net.http.HttpResponse<String> response = httpClient.send(httpRequest, java.net.http.HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                tools.jackson.databind.JsonNode root = objectMapper.readTree(response.body());
                if ("success".equals(root.path("status").asText())) {
                    country = root.path("country").asText("Unknown");
                    region = root.path("regionName").asText("Unknown");
                    city = root.path("city").asText("Unknown");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            Click click = clickRepository.findById(clickId).orElse(null);
            if (click != null) {
                click.setCountry(country);
                click.setRegion(region);
                click.setCity(city);
                clickRepository.save(click);
                redisTemplate.delete("analytics:" + shortCode);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private boolean isLocalIp(String ip) {
        return ip == null || ip.equals("127.0.0.1") || ip.equals("0:0:0:0:0:0:0:1") || 
               ip.equals("localhost") || ip.startsWith("192.168.") || ip.startsWith("10.") ||
               ip.startsWith("172.16.") || ip.startsWith("172.17.") || ip.startsWith("172.18.") ||
               ip.startsWith("172.19.") || ip.startsWith("172.2") || ip.startsWith("172.3");
    }
}
