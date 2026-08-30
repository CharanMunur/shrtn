package com.example.demo.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class OAuthService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${google.client.id:}")
    private String googleClientId;

    @Value("${google.client.secret:}")
    private String googleClientSecret;

    @Value("${google.redirect.uri:}")
    private String googleRedirectUri;

    @Value("${github.client.id:}")
    private String githubClientId;

    @Value("${github.client.secret:}")
    private String githubClientSecret;

    @Value("${github.redirect.uri:}")
    private String githubRedirectUri;

    public JsonNode getGoogleProfile(String code) throws Exception {
        String tokenBody = String.format(
            "code=%s&client_id=%s&client_secret=%s&redirect_uri=%s&grant_type=authorization_code",
            URLEncoder.encode(code, StandardCharsets.UTF_8),
            URLEncoder.encode(googleClientId, StandardCharsets.UTF_8),
            URLEncoder.encode(googleClientSecret, StandardCharsets.UTF_8),
            URLEncoder.encode(googleRedirectUri, StandardCharsets.UTF_8)
        );

        HttpRequest tokenRequest = HttpRequest.newBuilder()
            .uri(URI.create("https://oauth2.googleapis.com/token"))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(tokenBody))
            .build();

        HttpResponse<String> tokenResponse = httpClient.send(tokenRequest, HttpResponse.BodyHandlers.ofString());
        if (tokenResponse.statusCode() != 200) {
            throw new RuntimeException("Failed to exchange code for Google token: " + tokenResponse.body());
        }

        JsonNode tokenNode = objectMapper.readTree(tokenResponse.body());
        String accessToken = tokenNode.get("access_token").asText();

        HttpRequest profileRequest = HttpRequest.newBuilder()
            .uri(URI.create("https://www.googleapis.com/oauth2/v3/userinfo"))
            .header("Authorization", "Bearer " + accessToken)
            .GET()
            .build();

        HttpResponse<String> profileResponse = httpClient.send(profileRequest, HttpResponse.BodyHandlers.ofString());
        if (profileResponse.statusCode() != 200) {
            throw new RuntimeException("Failed to fetch Google profile: " + profileResponse.body());
        }

        return objectMapper.readTree(profileResponse.body());
    }

    public JsonNode getGitHubProfile(String code) throws Exception {
        String tokenBody = String.format(
            "code=%s&client_id=%s&client_secret=%s&redirect_uri=%s",
            URLEncoder.encode(code, StandardCharsets.UTF_8),
            URLEncoder.encode(githubClientId, StandardCharsets.UTF_8),
            URLEncoder.encode(githubClientSecret, StandardCharsets.UTF_8),
            URLEncoder.encode(githubRedirectUri, StandardCharsets.UTF_8)
        );

        HttpRequest tokenRequest = HttpRequest.newBuilder()
            .uri(URI.create("https://github.com/login/oauth/access_token"))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .header("Accept", "application/json")
            .header("User-Agent", "Shrtn-Backend")
            .POST(HttpRequest.BodyPublishers.ofString(tokenBody))
            .build();

        HttpResponse<String> tokenResponse = httpClient.send(tokenRequest, HttpResponse.BodyHandlers.ofString());
        if (tokenResponse.statusCode() != 200) {
            throw new RuntimeException("Failed to exchange code for GitHub token. Status: " + tokenResponse.statusCode() + ", Body: " + tokenResponse.body());
        }

        JsonNode tokenNode = objectMapper.readTree(tokenResponse.body());
        JsonNode accessTokenNode = tokenNode.get("access_token");
        if (accessTokenNode == null || accessTokenNode.isNull()) {
            throw new RuntimeException("GitHub token exchange returned error response: " + tokenResponse.body());
        }
        String accessToken = accessTokenNode.asText();

        HttpRequest profileRequest = HttpRequest.newBuilder()
            .uri(URI.create("https://api.github.com/user"))
            .header("Authorization", "Bearer " + accessToken)
            .header("Accept", "application/json")
            .header("User-Agent", "Shrtn-Backend")
            .GET()
            .build();

        HttpResponse<String> profileResponse = httpClient.send(profileRequest, HttpResponse.BodyHandlers.ofString());
        if (profileResponse.statusCode() != 200) {
            throw new RuntimeException("Failed to fetch GitHub profile: " + profileResponse.body());
        }

        JsonNode profileNode = objectMapper.readTree(profileResponse.body());

        if (profileNode.get("email") == null || profileNode.get("email").isNull() || profileNode.get("email").asText().isEmpty()) {
            HttpRequest emailsRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.github.com/user/emails"))
                .header("Authorization", "Bearer " + accessToken)
                .header("Accept", "application/json")
                .header("User-Agent", "Shrtn-Backend")
                .GET()
                .build();

            HttpResponse<String> emailsResponse = httpClient.send(emailsRequest, HttpResponse.BodyHandlers.ofString());
            if (emailsResponse.statusCode() == 200) {
                JsonNode emailsNode = objectMapper.readTree(emailsResponse.body());
                for (JsonNode emailNode : emailsNode) {
                    if (emailNode.path("primary").asBoolean()) {
                        ((ObjectNode) profileNode).put("email", emailNode.path("email").asText());
                        break;
                    }
                }
                if ((profileNode.get("email") == null || profileNode.get("email").isNull()) && emailsNode.isArray() && emailsNode.size() > 0) {
                    ((ObjectNode) profileNode).put("email", emailsNode.get(0).path("email").asText());
                }
            }
        }

        return profileNode;
    }
}
