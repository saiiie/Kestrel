package com.kestrel.sentinel.config;

import com.kestrel.sentinel.util.JWTUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    public JWTFilter(JWTUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        String email = null;
        String jwt = null;

        // Extract token from Bearer header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(jwt);
            } catch (Exception e) {
                // Token is invalid or expired
            }
        }

        // If we found an email and the context is not already authenticated
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.isTokenValid(jwt)) {
                
                Long userId = jwtUtil.extractUserId(jwt);
                
                // Create UserDetails. We use the extracted email as username.
                UserDetails userDetails = new User(email, "", Collections.emptyList());

                // Set up the authentication token
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                // You can store the userId in the details if needed, or we can just rely on the principal
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Authenticate the request
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
