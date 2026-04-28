package com.qb.auth.filter;

import com.qb.auth.model.AuthenticatedUser;
import com.qb.auth.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Intercepts every request, extracts "Bearer <jwt>" from Authorization header,
 * validates it against the Supabase JWT secret, and populates the SecurityContext.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SupabaseJwtFilter extends OncePerRequestFilter {

    private final AuthService authService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            authService.validateToken(token).ifPresent(user -> {
                var authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_" + user.role().name())
                );

                var auth = new UsernamePasswordAuthenticationToken(user, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);

                log.debug("Authenticated: {} [{}]", user.email(), user.role());
            });
        }

        filterChain.doFilter(request, response);
    }
}
