package com.hotel.modules.invoice.repository;

import com.hotel.modules.invoice.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByBooking_BookingId(Long bookingId);

    Optional<Invoice> findByPayment_PaymentId(Long paymentId);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    boolean existsByBooking_BookingId(Long bookingId);

    @Query("""
        SELECT i FROM Invoice i
        WHERE (:startDate IS NULL OR i.issuedAt >= :startDate)
          AND (:endDate   IS NULL OR i.issuedAt <= :endDate)
    """)
    Page<Invoice> findAllWithFilters(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate")   LocalDateTime endDate,
            Pageable pageable
    );
}
