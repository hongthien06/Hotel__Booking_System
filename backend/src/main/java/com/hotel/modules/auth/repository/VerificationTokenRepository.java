package com.hotel.modules.auth.repository;

import com.hotel.modules.auth.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    Optional<VerificationToken> findByEmailAndOtpCode(String email, String otpCode);

    void deleteByEmail(String email);

    void deleteByExpiresAtBefore(LocalDateTime now);
}
