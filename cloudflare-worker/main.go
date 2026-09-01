package main

import (
	"encoding/json"
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

func handleRedirect(this js.Value, args []js.Value) interface{} {
	if len(args) < 5 {
		return makeResult("", 400)
	}

	shortCode := args[0].String()
	userAgent := args[1].String()
	upstashJson := args[2].String()
	appDashboardUrl := args[3].String()
	renderOriginUrl := args[4].String()

	if upstashJson != "" {
		var entry UrlCacheEntry
		if err := json.Unmarshal([]byte(upstashJson), &entry); err == nil {
			if !entry.IsActive {
				return makeResult(appDashboardUrl+"/404?reason=deactivated", 302)
			}
			if entry.IsPasswordProtected {
				return makeResult(appDashboardUrl+"/unlock/"+shortCode, 302)
			}

			// Smart Device Routing in Go Wasm
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

	// Fallback to origin if cache miss
	return makeResult(renderOriginUrl+"/"+shortCode, 302)
}

func makeResult(redirectUrl string, status int) js.Value {
	obj := js.Global().Get("Object").New()
	obj.Set("redirectUrl", redirectUrl)
	obj.Set("status", status)
	return obj
}

func main() {
	c := make(chan struct{})
	js.Global().Set("handleGoRedirect", js.FuncOf(handleRedirect))
	<-c
}
