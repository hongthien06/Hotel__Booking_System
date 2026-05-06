package com.hotel.modules.voucher.repository;

import com.hotel.modules.voucher.entity.Voucher;
import com.hotel.modules.voucher.entity.VoucherStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    @Query("""
            SELECT v FROM Voucher v
            WHERE (:status IS NULL OR v.status = :status)
              AND (:code   IS NULL OR UPPER(v.code) LIKE UPPER(CONCAT('%', :code, '%')))
            """)
    Page<Voucher> findAllWithFilters(
            @Param("status") VoucherStatus status,
            @Param("code") String code,
            Pageable pageable);

    // Lay danh sach voucher dang hoat dong, chua het han, con luot su dung
    @Query("""
            SELECT v FROM Voucher v
            WHERE v.status = 'ACTIVE'
              AND (v.startDate IS NULL OR v.startDate <= :now)
              AND (v.endDate   IS NULL OR v.endDate   >= :now)
              AND (v.usageLimit IS NULL OR v.usedCount < v.usageLimit)
            ORDER BY v.createdAt DESC
            """)
    List<Voucher> findAllActive(@Param("now") LocalDateTime now);

    // Tang used_count chi khi con luot (atomic, tranh race condition)
    // Tra ve so row duoc update: 0 = het luot, 1 = thanh cong
    @Modifying
    @Query("""
            UPDATE Voucher v
            SET v.usedCount = v.usedCount + 1, v.updatedAt = :now
            WHERE v.voucherId = :id
              AND (v.usageLimit IS NULL OR v.usedCount < v.usageLimit)
            """)
    int incrementUsedCountIfAvailable(@Param("id") Long voucherId, @Param("now") LocalDateTime now);

    // Giam used_count, khong cho xuong duoi 0 (atomic)
    @Modifying
    @Query("""
            UPDATE Voucher v
            SET v.usedCount = CASE WHEN v.usedCount > 0 THEN v.usedCount - 1 ELSE 0 END,
                v.updatedAt = :now
            WHERE v.voucherId = :id
            """)
    void decrementUsedCount(@Param("id") Long voucherId, @Param("now") LocalDateTime now);
}
