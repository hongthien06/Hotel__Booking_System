package com.hotel.modules.payment.repository;

import com.hotel.modules.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionId(String transactionId);

    @Query("SELECT p FROM Payment p WHERE p.booking.bookingCode = :code")
    Optional<Payment> findByBookingCode(@Param("code") String bookingCode);
}
