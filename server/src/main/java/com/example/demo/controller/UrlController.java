package com.example.demo.controller;

import com.example.demo.dto.MessageResponse;
import com.example.demo.dto.UnlockRequest;
import com.example.demo.dto.UnlockResponse;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UrlController {

    @Value("${app.frontend.dashboard-url:https://app.shrtn.fun}")
    private String dashboardAppUrl;

    private final UrlService urlService;
    private final QrService qrService;

    public UrlController(UrlService urlService, QrService qrService) {
        this.urlService = urlService;
        this.qrService = qrService;
    }

    private static final java.util.Set<String> SPA_ROUTES = java.util.Set.of(
        "oauth", "assets", "icons", "favicon.ico", "favicon.svg", "logo.svg", "world-map.svg", "icons.svg", "index.html"
    );

    private ResponseEntity<?> serveIndexHtml() {
        try {
            org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource("static/index.html");
            if (resource.exists()) {
                byte[] bytes = resource.getInputStream().readAllBytes();
                return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(bytes);
            }
        } catch (Exception ignored) {}
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(dashboardAppUrl))
            .build();
    }

    private ResponseEntity<?> serveStaticResource(String filename) {
        try {
            org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource("static/" + filename);
            if (resource.exists()) {
                byte[] bytes = resource.getInputStream().readAllBytes();
                MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
                String lower = filename.toLowerCase();
                if (lower.endsWith(".svg")) {
                    mediaType = MediaType.parseMediaType("image/svg+xml");
                } else if (lower.endsWith(".png")) {
                    mediaType = MediaType.IMAGE_PNG;
                } else if (lower.endsWith(".ico")) {
                    mediaType = MediaType.parseMediaType("image/x-icon");
                } else if (lower.endsWith(".js")) {
                    mediaType = MediaType.parseMediaType("application/javascript");
                } else if (lower.endsWith(".css")) {
                    mediaType = MediaType.parseMediaType("text/css");
                } else if (lower.endsWith(".json")) {
                    mediaType = MediaType.APPLICATION_JSON;
                } else if (lower.endsWith(".html")) {
                    mediaType = MediaType.TEXT_HTML;
                }
                return ResponseEntity.ok().contentType(mediaType).body(bytes);
            }
        } catch (Exception ignored) {}
        return serveIndexHtml();
    }

    @GetMapping("/")
    public ResponseEntity<?> serveRoot() {
        return serveIndexHtml();
    }

    @GetMapping({"/signin", "/login"})
    public ResponseEntity<?> redirectToSignIn(HttpServletRequest request) {
        if (request != null && "localhost".equalsIgnoreCase(request.getServerName())) {
            return serveIndexHtml();
        }
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(dashboardAppUrl + "/signin"))
            .build();
    }

    @GetMapping({"/signup", "/register"})
    public ResponseEntity<?> redirectToSignUp(HttpServletRequest request) {
        if (request != null && "localhost".equalsIgnoreCase(request.getServerName())) {
            return serveIndexHtml();
        }
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(dashboardAppUrl + "/signup"))
            .build();
    }

    @GetMapping("/dashboard/**")
    public ResponseEntity<?> redirectToDashboard(HttpServletRequest request) {
        if (request != null && "localhost".equalsIgnoreCase(request.getServerName())) {
            return serveIndexHtml();
        }
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(dashboardAppUrl + "/dashboard"))
            .build();
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
        if (shortCode.contains(".")) {
            return serveStaticResource(shortCode);
        }
        if (SPA_ROUTES.contains(shortCode.toLowerCase())) {
            return serveIndexHtml();
        }

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

        try {
            String originalUrl = urlService.redirectUrl(shortCode, ipAddress, userAgent, referrer, countryName);

            // Prepend protocol if missing to prevent relative redirection loops in the browser
            if (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://")) {
                originalUrl = "https://" + originalUrl;
            }

            return ResponseEntity.status(302).location(URI.create(originalUrl)).build();
        } catch (RuntimeException e) {
            if ("Password required for this link".equals(e.getMessage())) {
                String html = getPasswordUnlockHtml(shortCode);
                return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
            }
            String msg = e.getMessage();
            if (msg != null && (msg.contains("not found") || msg.contains("disabled") || msg.contains("expired"))) {
                return ResponseEntity.status(HttpStatus.FOUND).location(URI.create("/")).build();
            }
            throw e;
        }
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

    @PostMapping("/{shortCode}/unlock")
    public ResponseEntity<UnlockResponse> unlock(
        @PathVariable String shortCode,
        @RequestBody UnlockRequest unlockRequest,
        HttpServletRequest request
    ) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        } else {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        String userAgent = request.getHeader("User-Agent");
        String referrer = request.getHeader("Referer");

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

        String targetUrl = urlService.unlockUrl(
            shortCode,
            unlockRequest != null ? unlockRequest.getPassword() : null,
            ipAddress,
            userAgent,
            referrer,
            countryName
        );

        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            targetUrl = "https://" + targetUrl;
        }

        return ResponseEntity.ok(new UnlockResponse(targetUrl));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleRuntimeException(RuntimeException e) {
        String msg = e.getMessage();
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (msg != null) {
            if (msg.contains("Password required") || msg.contains("Incorrect password")) {
                status = HttpStatus.UNAUTHORIZED;
            } else if (msg.contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else if (
                msg.contains("disabled") || msg.contains("expired") || msg.contains("maximum") || msg.contains("at least")
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

    private String getPasswordUnlockHtml(String shortCode) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Protected Link - Shrtn</title>
                <style>
                    :root {
                        --bg: #ffffff;
                        --card: #ffffff;
                        --border: #e4e4e7;
                        --text: #09090b;
                        --muted: #71717a;
                        --primary: #18181b;
                        --primary-hover: #27272a;
                        --primary-text: #ffffff;
                        --amber-bg: #fffbeb;
                        --amber-border: #fef3c7;
                        --amber-text: #d97706;
                        --red-bg: #fef2f2;
                        --red-border: #fee2e2;
                        --red-text: #dc2626;
                    }
                    * { box-sizing: border-box; margin: 0; padding: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
                    body { background-color: var(--bg); color: var(--text); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; -webkit-font-smoothing: antialiased; }
                    .card { background: var(--card); border: 1px solid var(--border); border-radius: 6px; width: 100%; max-width: 380px; padding: 24px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05); }
                    .icon-wrap { width: 44px; height: 44px; border-radius: 50%; background: var(--amber-bg); border: 1px solid var(--amber-border); color: var(--amber-text); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
                    .title { font-size: 18px; font-weight: 600; text-align: center; color: var(--text); letter-spacing: -0.015em; margin-bottom: 2px; }
                    .subtitle { font-size: 13px; color: var(--muted); text-align: center; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin-bottom: 20px; }
                    .form-group { margin-bottom: 16px; }
                    .label { display: block; font-size: 12px; font-weight: 500; color: var(--text); margin-bottom: 6px; }
                    .input-wrap { position: relative; }
                    input[type="password"], input[type="text"] { width: 100%; padding: 8px 36px 8px 12px; font-size: 14px; border-radius: 4px; border: 1px solid var(--border); background: var(--card); color: var(--text); outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
                    input:focus { border-color: #09090b; box-shadow: 0 0 0 1px #09090b; }
                    .toggle-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); cursor: pointer; display: flex; align-items: center; justify-content: center; }
                    .toggle-btn:hover { color: var(--text); }
                    .btn { width: 100%; padding: 9px 16px; font-size: 14px; font-weight: 500; border-radius: 4px; border: none; background: var(--primary); color: var(--primary-text); cursor: pointer; transition: background-color 0.15s; }
                    .btn:hover { background: var(--primary-hover); }
                    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
                    .error-box { display: none; background: var(--red-bg); border: 1px solid var(--red-border); color: var(--red-text); font-size: 13px; font-weight: 400; padding: 10px 12px; border-radius: 4px; margin-bottom: 16px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="icon-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <div class="title">Password Protected Link</div>
                    <div class="subtitle">/{{SHORT_CODE}}</div>
                    
                    <div id="err" class="error-box"></div>

                    <form onsubmit="unlock(event)">
                        <div class="form-group">
                            <label class="label" for="pass">Enter Password</label>
                            <div class="input-wrap">
                                <input type="password" id="pass" placeholder="Enter password to access" required autofocus />
                                <button type="button" class="toggle-btn" onclick="togglePass()" aria-label="Toggle password visibility">
                                    <svg id="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                            </div>
                        </div>
                        <button type="submit" id="btn" class="btn">Unlock & Continue</button>
                    </form>
                </div>

                <script>
                    const code = "{{SHORT_CODE}}";
                    function togglePass() {
                        const input = document.getElementById('pass');
                        const icon = document.getElementById('eye-icon');
                        if (input.type === 'password') {
                            input.type = 'text';
                            icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
                        } else {
                            input.type = 'password';
                            icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
                        }
                    }

                    async function unlock(e) {
                        e.preventDefault();
                        const pass = document.getElementById('pass').value;
                        const btn = document.getElementById('btn');
                        const errBox = document.getElementById('err');
                        errBox.style.display = 'none';
                        btn.disabled = true;
                        btn.innerText = 'Unlocking...';
                        try {
                            const res = await fetch('/' + encodeURIComponent(code) + '/unlock', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ password: pass })
                            });
                            const data = await res.json();
                            if (res.ok && data.targetUrl) {
                                window.location.href = data.targetUrl;
                            } else {
                                errBox.innerText = data.message || 'Incorrect password';
                                errBox.style.display = 'block';
                            }
                        } catch (err) {
                            errBox.innerText = 'Network error. Please try again.';
                            errBox.style.display = 'block';
                        } finally {
                            btn.disabled = false;
                            btn.innerText = 'Unlock & Continue';
                        }
                    }
                </script>
            </body>
            </html>
            """.replace("{{SHORT_CODE}}", shortCode);
    }
}
