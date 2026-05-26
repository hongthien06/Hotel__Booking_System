package com.hotel.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;
import static org.springframework.http.HttpMethod.GET;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfig()))
                .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ── Public (ai cũng gọi được) ──
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/chatbot/**").permitAll()
                        .requestMatchers(GET, "/rooms/**", "/hotels/**", "/room-types/**", "/amenities/**", "/extra-services/active").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/v3/api-docs").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/rooms/**", "/hotels/**", "/room-types/**", "/extra-services/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/files/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/bookings/my-bookings").hasAnyRole("CUSTOMER", "ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.POST, "/bookings").hasAnyRole("CUSTOMER", "ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/bookings/*/cancel").hasAnyRole("CUSTOMER", "ADMIN", "MANAGER")
                        .requestMatchers("/bookings/occupied-rooms").permitAll()
                        .requestMatchers(GET, "/bookings/room/*/booked-dates").permitAll()
                        .requestMatchers("/bookings/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/dashboard/**", "/admin/**").hasAnyRole("ADMIN", "MANAGER")
                        // Membership: public (danh sách hạng) + customer
                        .requestMatchers(HttpMethod.GET, "/membership/tiers", "/api/v1/membership/tiers").permitAll()
                        .requestMatchers(HttpMethod.GET, "/membership/me", "/api/v1/membership/me").authenticated()
                        // Membership: admin/manager
                        .requestMatchers("/membership/**", "/api/v1/membership/**").hasAnyRole("ADMIN", "MANAGER")
                        // Holidays: public GET (frontend cần để hiển thị giá lễ)
                        .requestMatchers(HttpMethod.GET, "/holidays/**", "/api/v1/holidays/**").permitAll()
                        // Holidays: admin/manager CRUD
                        .requestMatchers("/holidays/**", "/api/v1/holidays/**").hasAnyRole("ADMIN", "MANAGER")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfig() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
