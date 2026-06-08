package com.hotel.modules.review.repository;

import com.hotel.modules.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByIsApprovedTrue(Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.user.userId = :userId")
    Page<Review> findByUserId(Long userId, Pageable pageable);

    boolean existsByBookingBookingId(Long bookingId);

    @Query("SELECT COALESCE(AVG(r.ratingOverall), 0.0) FROM Review r WHERE r.isApproved = true")
    Double averageRatingOverall();

    @Query("SELECT COALESCE(AVG(r.ratingClean), 0.0) FROM Review r WHERE r.isApproved = true")
    Double averageRatingClean();

    @Query("SELECT COALESCE(AVG(r.ratingService), 0.0) FROM Review r WHERE r.isApproved = true")
    Double averageRatingService();

    @Query("SELECT COALESCE(AVG(r.ratingLocation), 0.0) FROM Review r WHERE r.isApproved = true")
    Double averageRatingLocation();

    @Query("SELECT COALESCE(AVG(r.ratingValue), 0.0) FROM Review r WHERE r.isApproved = true")
    Double averageRatingValue();

    @Query("SELECT COUNT(r) FROM Review r WHERE r.isApproved = true")
    Long countApproved();

    @Query("SELECT r.ratingOverall, COUNT(r) FROM Review r WHERE r.isApproved = true GROUP BY r.ratingOverall")
    java.util.List<Object[]> countByRatingOverall();
}
