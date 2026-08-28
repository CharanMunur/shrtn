package com.example.demo.controller;

import com.example.demo.dto.MessageResponse;
import com.example.demo.dto.UrlAnalyticsResponse;
import com.example.demo.dto.UrlRequest;
import com.example.demo.dto.UrlResponse;
import com.example.demo.service.QrService;
import com.example.demo.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UrlController {

    private final UrlService urlService;
    private final QrService qrService;

    public UrlController(UrlService urlService, QrService qrService) {
        this.urlService = urlService;
        this.qrService = qrService;
    }

    @PostMapping("/shorten")
    public UrlResponse shorten(@RequestBody UrlRequest originalUrl) {
        return urlService.shortenUrl(originalUrl);
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<?> redirect(
        @PathVariable String shortCode,
        @RequestParam(required = false) String format,
        HttpServletRequest request
    ) {
        if ("qr".equals(format)) {
            if (!urlService.existsAndActive(shortCode)) {
                throw new RuntimeException("Short code not found or inactive");
            }
            String shortUrl = request.getRequestURL().toString();
            byte[] png = qrService.generate(shortUrl, 300);
            return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(png);
        }

        // Retrieve real client IP behind reverse proxy
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        } else {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        String userAgent = request.getHeader("User-Agent");
        String referrer = request.getHeader("Referer");

        // Attempt to extract country from proxy headers (Cloudflare, Vercel, Render)
        String countryCode = request.getHeader("CF-IPCountry");
        if (countryCode == null || countryCode.isEmpty()) {
            countryCode = request.getHeader("X-Vercel-IP-Country");
        }
        if (countryCode == null || countryCode.isEmpty()) {
            countryCode = request.getHeader("X-Geo-Country");
        }

        String countryName = null;
        if (countryCode != null && !countryCode.isEmpty() && !countryCode.equalsIgnoreCase("XX")) {
            countryName = getCountryNameFromCode(countryCode);
        }

        String originalUrl = urlService.redirectUrl(shortCode, ipAddress, userAgent, referrer, countryName);

        // Prepend protocol if missing to prevent relative redirection loops in the browser
        if (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://")) {
            originalUrl = "https://" + originalUrl;
        }

        return ResponseEntity.status(302).location(URI.create(originalUrl)).build();
    }

    @GetMapping("/urls")
    public List<UrlResponse> getUserUrls() {
        return urlService.getUserUrls();
    }

    @PatchMapping("/urls/{shortCode}/toggle")
    public boolean toggleUrl(@PathVariable String shortCode) {
        return urlService.toggleUrlStatus(shortCode);
    }

    @DeleteMapping("/urls/{shortCode}")
    public ResponseEntity<Void> deleteUrl(@PathVariable String shortCode) {
        urlService.deleteUrl(shortCode);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/urls/{shortCode}/analytics")
    public ResponseEntity<UrlAnalyticsResponse> getUrlAnalytics(@PathVariable String shortCode) {
        return ResponseEntity.ok(urlService.getUrlAnalytics(shortCode));
    }

    @PostMapping("/urls/{shortCode}/qr")
    public boolean generateQrCode(@PathVariable String shortCode) {
        return urlService.generateQrCode(shortCode);
    }

    @DeleteMapping("/urls/{shortCode}/qr")
    public boolean revokeQrCode(@PathVariable String shortCode) {
        return urlService.revokeQrCode(shortCode);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleRuntimeException(RuntimeException e) {
        String msg = e.getMessage();
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (msg != null) {
            if (msg.contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else if (
                msg.contains("disabled") || msg.contains("expired") || msg.contains("maximum")
            ) {
                status = HttpStatus.BAD_REQUEST;
            } else if (msg.contains("dont own") || msg.contains("authenticated")) {
                status = HttpStatus.FORBIDDEN;
            }
        }

        return ResponseEntity.status(status).body(
            new MessageResponse(msg != null ? msg : "Internal server error")
        );
    }

    private String getCountryNameFromCode(String countryCode) {
        if (countryCode == null || countryCode.isEmpty()) {
            return "Unknown";
        }
        try {
            java.util.Locale locale = new java.util.Locale("", countryCode);
            return locale.getDisplayCountry(java.util.Locale.ENGLISH);
        } catch (Exception e) {
            return countryCode;
        }
    }
}
