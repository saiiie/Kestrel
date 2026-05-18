package com.kestrel.sentinel.controller;

import com.kestrel.sentinel.model.User;
import com.kestrel.sentinel.repository.UserRepository;
import com.kestrel.sentinel.util.JWTUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JWTUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        String rawPassword = request.get("password");
        String confirmPassword = request.get("confirmPassword");

        // Simple validation to ensure fields aren't blank
        if (username == null || email == null || rawPassword == null || confirmPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
        }

        if (!rawPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match"));
        }

        // Hash the password before saving!
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setEmail(email);
        newUser.setPasswordHash(passwordEncoder.encode(rawPassword)); 

        try {
            userRepository.save(newUser);
            String token = jwtUtil.generateToken(newUser.getEmail(), newUser.getId());
            
            return ResponseEntity.ok(Map.of(
                    "message", "Registration successful",
                    "token", token,
                    "user", Map.of("id", newUser.getId(), "username", newUser.getUsername(), "email", newUser.getEmail())
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username or email already exists"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String rawPassword = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email); // Note: We need to add this to the Repository!

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Compare the raw password from React against the BCrypt hash in the database
            if (passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
                String token = jwtUtil.generateToken(user.getEmail(), user.getId());
                
                return ResponseEntity.ok(Map.of(
                        "message", "Login successful",
                        "token", token,
                        "user", Map.of("id", user.getId(), "username", user.getUsername(), "email", user.getEmail())
                ));
            }
        }
        return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
    }
}