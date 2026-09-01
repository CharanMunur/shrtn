package main

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"syscall/js"
)

type UrlCacheEntry struct {
	OriginalURL         string `json:"originalUrl"`
	IosURL              string `json:"iosUrl"`
	AndroidURL          string `json:"androidUrl"`
	IsActive            bool   `json:"isActive"`
	IsPasswordProtected bool   `json:"isPasswordProtected"`
	MaxClicks           *int   `json:"maxClicks"`
}

type UpstashResponse struct {
	Result string `json:"result"`
}

func handleRedirect(this js.Value, args []js.Value) interface{} {
	if len(args) < 6 {
		return makeResult("", 400)
	}

	urlStr := args[0].String()
	userAgent := args[1].String()
	upstashUrl := args[2].String()
	upstashToken := args[3].String()
	appDashboardUrl := args[4].String()
	renderOriginUrl := args[5].String()

	// Extract path from full URL string
	path := urlStr
	if idx := strings.Index(urlStr, "://"); idx != -1 {
		rest := urlStr[idx+3:]
		if pIdx := strings.Index(rest, "/"); pIdx != -1 {
			path = rest[pIdx:]
		} else {
			path = "/"
		}
	}

	// Remove query params
	if idx := strings.Index(path, "?"); idx != -1 {
		path = path[:idx]
	}

	// 1. Instant Edge Static Routes
	if path == "/" || path == "" {
		return makeResult(renderOriginUrl, 302)
	}
	if path == "/signin" {
		return makeResult(appDashboardUrl+"/signin", 302)
	}
	if path == "/signup" {
		return makeResult(appDashboardUrl+"/signup", 302)
	}
	if path == "/dashboard" || strings.HasPrefix(path, "/dashboard/") {
		return makeResult(appDashboardUrl+path, 302)
	}

	shortCode := strings.TrimPrefix(path, "/")
	if shortCode == "" || strings.Contains(shortCode, "/") {
		return makeResult(renderOriginUrl, 302)
	}

	// 2. Query Upstash Redis REST API directly from Go Wasm at Edge
	if upstashUrl != "" && upstashToken != "" {
		endpoint := strings.TrimSuffix(upstashUrl, "/") + "/get/url:" + shortCode
		req, err := http.NewRequest("GET", endpoint, nil)
		if err == nil {
			req.Header.Set("Authorization", "Bearer "+upstashToken)
			client := &http.Client{}
			resp, err := client.Do(req)
			if err == nil && resp.StatusCode == 200 {
				defer resp.Body.Close()
				bodyBytes, err := io.ReadAll(resp.Body)
				if err == nil {
					var upstashResp UpstashResponse
					if err := json.Unmarshal(bodyBytes, &upstashResp); err == nil && upstashResp.Result != "" {
						var entry UrlCacheEntry
						if err := json.Unmarshal([]byte(upstashResp.Result), &entry); err == nil {
							if !entry.IsActive {
								return makeResult(appDashboardUrl+"/404?reason=deactivated", 302)
							}
							if entry.IsPasswordProtected {
								return makeResult(appDashboardUrl+"/unlock/"+shortCode, 302)
							}

							// Smart Device Routing
							uaLower := strings.ToLower(userAgent)
							if entry.IosURL != "" && (strings.Contains(uaLower, "iphone") || strings.Contains(uaLower, "ipad") || strings.Contains(uaLower, "ipod")) {
								return makeResult(entry.IosURL, 302)
							}
							if entry.AndroidURL != "" && strings.Contains(uaLower, "android") {
								return makeResult(entry.AndroidURL, 302)
							}
							if entry.OriginalURL != "" {
								return makeResult(entry.OriginalURL, 302)
							}
						}
					}
				}
			}
		}
	}

	// Fallback to origin if cache miss
	return makeResult(renderOriginUrl+"/"+shortCode, 302)
}

func makeResult(redirectUrl string, status int) js.Value {
	return js.ValueOf(map[string]interface{}{
		"redirectUrl": redirectUrl,
		"status":      status,
	})
}

func main() {
	c := make(chan struct{})
	js.Global().Set("handleGoRedirect", js.FuncOf(handleRedirect))
	<-c
}
