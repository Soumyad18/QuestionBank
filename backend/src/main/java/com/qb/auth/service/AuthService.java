package com.qb.auth.service;

import com.qb.auth.model.AuthenticatedUser;
import com.qb.auth.model.AuthenticatedUser.Role;
import com.qb.auth.repository.UserProfileRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.PublicKey;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${app.auth.supabase-url}")
    private String supabaseUrl;

    private final UserProfileRepository userProfileRepository;
    private final Map<String, PublicKey> jwksCache = new ConcurrentHashMap<>();
    private HttpClient httpClient;

    @PostConstruct
    void init() {
        this.httpClient = HttpClient.newHttpClient();
        log.info("AuthService initialized — ES256/JWKS mode");
    }

    public Optional<AuthenticatedUser> validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]));
            String kid = extractField(headerJson, "kid");

            PublicKey publicKey = jwksCache.computeIfAbsent(kid, this::fetchPublicKey);
            if (publicKey == null) return Optional.empty();

            Claims claims = Jwts.parser()
                    .verifyWith(publicKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return buildUser(claims);
        } catch (Exception e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private PublicKey fetchPublicKey(String kid) {
        try {
            String jwksUrl = supabaseUrl + "/auth/v1/.well-known/jwks.json";
            HttpRequest request = HttpRequest.newBuilder(URI.create(jwksUrl)).GET().build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String body = response.body();

            // Find the key matching kid (or use first key)
            int kidIdx = body.indexOf("\"" + kid + "\"");
            if (kidIdx == -1) kidIdx = 0;

            // Extract x and y coordinates for EC P-256 key
            String x = extractField(body.substring(kidIdx), "x");
            String y = extractField(body.substring(kidIdx), "y");

            if (x.isEmpty() || y.isEmpty()) {
                log.warn("Could not find x/y in JWKS for kid: {}", kid);
                return null;
            }

            byte[] xBytes = Base64.getUrlDecoder().decode(x);
            byte[] yBytes = Base64.getUrlDecoder().decode(y);

            java.security.spec.ECPoint point = new java.security.spec.ECPoint(
                    new java.math.BigInteger(1, xBytes),
                    new java.math.BigInteger(1, yBytes)
            );
            java.security.spec.ECParameterSpec ecSpec =
                    ((java.security.interfaces.ECPublicKey)
                            java.security.KeyPairGenerator.getInstance("EC")
                                    .generateKeyPair().getPublic()).getParams();
            // Use named curve P-256
            java.security.AlgorithmParameters params = java.security.AlgorithmParameters.getInstance("EC");
            params.init(new java.security.spec.ECGenParameterSpec("secp256r1"));
            ecSpec = params.getParameterSpec(java.security.spec.ECParameterSpec.class);

            java.security.spec.ECPublicKeySpec keySpec = new java.security.spec.ECPublicKeySpec(point, ecSpec);
            PublicKey publicKey = java.security.KeyFactory.getInstance("EC").generatePublic(keySpec);
            log.info("Loaded EC public key for kid: {}", kid);
            return publicKey;
        } catch (Exception e) {
            log.error("Failed to fetch JWKS public key: {}", e.getMessage());
            return null;
        }
    }

    private Optional<AuthenticatedUser> buildUser(Claims claims) {
        try {
            String userId = claims.getSubject();
            String email  = claims.get("email", String.class);

            boolean isAdmin = userProfileRepository.findById(UUID.fromString(userId))
                    .map(p -> p.isAdmin())
                    .orElse(false);

            Role role = isAdmin ? Role.ADMIN : Role.USER;
            return Optional.of(new AuthenticatedUser(userId, email, role));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private String extractField(String json, String field) {
        String key = "\"" + field + "\":\"";
        int idx = json.indexOf(key);
        if (idx == -1) return "";
        int start = idx + key.length();
        int end   = json.indexOf('"', start);
        return json.substring(start, end);
    }
}
