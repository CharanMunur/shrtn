package com.example.demo.service;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.MessageResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.VerifyOtpRequest;
import com.example.demo.dto.ForgotPasswordRequest;
import com.example.demo.dto.ResetPasswordRequest;
import com.example.demo.dto.ChangePasswordRequest;
import com.example.demo.model.OtpPurpose;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtils;
import com.example.demo.utils.AuthUtils;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final OtpService otpService;
    private final AuthUtils authUtils;
    private final OAuthService oAuthService;

    public MessageResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .createdAt(LocalDateTime.now())
            .build();

        userRepository.save(user);
        otpService.sendOtp(user, OtpPurpose.EMAIL_VERIFICATION);
        return new MessageResponse("Verification email sent. Please check your inbox.");
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Please verify your email before logging in");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtils.generateToken(userDetails);
        return AuthResponse.builder().token(token).build();
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return otpService.verifyOtp(user, OtpPurpose.EMAIL_VERIFICATION, request.getOtpCode());
    }

    public MessageResponse resendOtp(String email) {
        User user = userRepository
            .findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        otpService.sendOtp(user, OtpPurpose.EMAIL_VERIFICATION);
        return new MessageResponse("OTP resent. Please check your inbox.");
    }

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        otpService.sendOtp(user, OtpPurpose.PASSWORD_RESET);
        return new MessageResponse("Password reset OTP sent. Please check your inbox.");
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        otpService.validateOtp(user, OtpPurpose.PASSWORD_RESET, request.getOtpCode());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return new MessageResponse("Password has been reset successfully.");
    }

    public MessageResponse changePassword(ChangePasswordRequest request) {
        User user = authUtils.getCurrentUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return new MessageResponse("Password changed successfully.");
    }

    public AuthResponse oauthLogin(String provider, String code, String redirectUri) {
        try {
            String email;
            String providerId;

            if ("GOOGLE".equalsIgnoreCase(provider)) {
                tools.jackson.databind.JsonNode profile = oAuthService.getGoogleProfile(code, redirectUri);
                email = profile.path("email").asText();
                providerId = profile.path("sub").asText();
            } else if ("GITHUB".equalsIgnoreCase(provider)) {
                tools.jackson.databind.JsonNode profile = oAuthService.getGitHubProfile(code, redirectUri);
                email = profile.path("email").asText();
                providerId = profile.path("id").asText();
            } else {
                throw new RuntimeException("Unsupported OAuth provider: " + provider);
            }

            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Failed to retrieve email from " + provider + " profile");
            }

            // Check if user already exists by provider + providerId
            User user = userRepository.findByProviderAndProviderId(provider.toUpperCase(), providerId)
                .orElseGet(() -> {
                    // Check if a user with that email already exists
                    java.util.Optional<User> existingUserOpt = userRepository.findByEmail(email);
                    if (existingUserOpt.isPresent()) {
                        User existingUser = existingUserOpt.get();
                        existingUser.setProvider(provider.toUpperCase());
                        existingUser.setProviderId(providerId);
                        existingUser.setEmailVerified(true);
                        return userRepository.save(existingUser);
                    } else {
                        User newUser = User.builder()
                            .email(email)
                            .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                            .isEmailVerified(true)
                            .provider(provider.toUpperCase())
                            .providerId(providerId)
                            .createdAt(LocalDateTime.now())
                            .build();
                        return userRepository.save(newUser);
                    }
                });

            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtUtils.generateToken(userDetails);
            return AuthResponse.builder()
                .token(token)
                .message("Sign in successful via " + provider)
                .build();
        } catch (Exception e) {
            throw new RuntimeException("OAuth login failed: " + e.getMessage(), e);
        }
    }
}
