package com.hotel.modules.review.service;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.auth.repository.UserRepository;
import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingStatus;
import com.hotel.modules.booking.repository.BookingRepository;
import com.hotel.modules.review.dto.AdminReplyDTO;
import com.hotel.modules.review.dto.ReviewRequestDTO;
import com.hotel.modules.review.dto.ReviewResponseDTO;
import com.hotel.modules.review.entity.Review;
import com.hotel.modules.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    /**
     * Customer tạo review (chỉ cho booking CHECKED_OUT, chưa review)
     */
    @Transactional
    public ReviewResponseDTO createReview(ReviewRequestDTO dto, Long userId) {
        Booking booking = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking!"));

        // Kiểm tra booking thuộc về user
        if (!booking.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền đánh giá booking này!");
        }

        // Kiểm tra trạng thái
        if (booking.getStatus() != BookingStatus.CHECKED_OUT) {
            throw new RuntimeException("Chỉ có thể đánh giá sau khi đã trả phòng!");
        }

        // Kiểm tra đã review chưa
        if (reviewRepository.existsByBookingBookingId(dto.getBookingId())) {
            throw new RuntimeException("Bạn đã đánh giá booking này rồi!");
        }

        Review review = Review.builder()
                .booking(booking)
                .user(booking.getUser())
                .room(booking.getRoom())
                .ratingOverall(dto.getRatingOverall())
                .ratingClean(dto.getRatingClean())
                .ratingService(dto.getRatingService())
                .ratingLocation(dto.getRatingLocation())
                .ratingValue(dto.getRatingValue())
                .comment(dto.getComment())
                .isApproved(false)
                .build();

        reviewRepository.save(review);
        return toResponseDTO(review);
    }

    /**
     * Public: lấy review đã duyệt
     */
    public Page<ReviewResponseDTO> getApprovedReviews(Pageable pageable) {
        return reviewRepository.findByIsApprovedTrue(pageable).map(this::toResponseDTO);
    }

    /**
     * Admin: xem tất cả review
     */
    public Page<ReviewResponseDTO> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(this::toResponseDTO);
    }

    /**
     * Public: thống kê
     */
    public Map<String, Object> getReviewStats() {
        Double avgRating = reviewRepository.averageRatingOverall();
        Long totalReviews = reviewRepository.countApproved();
        return Map.of(
                "averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0,
                "totalReviews", totalReviews
        );
    }

    /**
     * Admin duyệt review
     */
    @Transactional
    public ReviewResponseDTO approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá!"));
        review.setIsApproved(true);
        reviewRepository.save(review);
        return toResponseDTO(review);
    }

    /**
     * Admin trả lời review
     */
    @Transactional
    public ReviewResponseDTO replyReview(Long reviewId, AdminReplyDTO dto) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá!"));
        review.setAdminReply(dto.getAdminReply());
        reviewRepository.save(review);
        return toResponseDTO(review);
    }

    /**
     * Admin xóa review
     */
    @Transactional
    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new RuntimeException("Không tìm thấy đánh giá!");
        }
        reviewRepository.deleteById(reviewId);
    }

    private ReviewResponseDTO toResponseDTO(Review review) {
        return ReviewResponseDTO.builder()
                .reviewId(review.getReviewId())
                .bookingId(review.getBooking().getBookingId())
                .bookingCode(review.getBooking().getBookingCode())
                .customerName(review.getUser().getFullName())
                .customerAvatar(review.getUser().getAvatarUrl())
                .roomNumber(review.getRoom().getRoomNumber())
                .hotelName(review.getRoom().getHotel() != null ? review.getRoom().getHotel().getHotelName() : null)
                .ratingOverall(review.getRatingOverall())
                .ratingClean(review.getRatingClean())
                .ratingService(review.getRatingService())
                .ratingLocation(review.getRatingLocation())
                .ratingValue(review.getRatingValue())
                .comment(review.getComment())
                .isApproved(review.getIsApproved())
                .adminReply(review.getAdminReply())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
