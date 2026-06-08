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
import com.hotel.modules.rooms.entity.Room;
import com.hotel.modules.rooms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    /**
     * Customer tạo review
     */
    @Transactional
    public ReviewResponseDTO createReview(ReviewRequestDTO dto, Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại!"));

        Booking booking;
        if (dto.getBookingId() != null) {
            booking = bookingRepository.findById(dto.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy booking!"));

            // Kiểm tra đã thanh toán và nhận phòng (check-in) chưa
            if (booking.getStatus() != BookingStatus.CHECKED_IN && booking.getStatus() != BookingStatus.CHECKED_OUT) {
                throw new RuntimeException("Bạn chỉ có thể đánh giá sau khi đã nhận phòng (check-in)!");
            }

            // Kiểm tra đã review chưa
            if (reviewRepository.existsByBookingBookingId(dto.getBookingId())) {
                throw new RuntimeException("Booking này đã được đánh giá rồi!");
            }
        } else if (dto.getRoomId() != null) {
            Room room = roomRepository.findById(dto.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng!"));

            BigDecimal price = room.getRoomType() != null && room.getRoomType().getPricePerNight() != null
                    ? room.getRoomType().getPricePerNight()
                    : BigDecimal.ZERO;

            // Tạo booking giả lập tự động hoàn tất cho user và phòng này
            booking = new Booking();
            booking.setUser(currentUser);
            booking.setRoom(room);
            booking.setCheckInDate(LocalDate.now());
            booking.setCheckOutDate(LocalDate.now());
            booking.setNumAdults((byte) 1);
            booking.setNumChildren((byte) 0);
            booking.setRoomPriceSnapshot(price);
            booking.setTotalNights((short) 1);
            booking.setStatus(BookingStatus.CHECKED_OUT);
            booking.setBookingCode("REV-" + System.currentTimeMillis());
            booking.setCreatedAt(java.time.LocalDateTime.now());
            booking.setUpdatedAt(java.time.LocalDateTime.now());
            bookingRepository.save(booking);
        } else {
            throw new RuntimeException("Yêu cầu đánh giá phải có Booking ID hoặc Room ID!");
        }

        Review review = Review.builder()
                .booking(booking)
                .user(currentUser)
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
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getApprovedReviews(Pageable pageable) {
        return reviewRepository.findByIsApprovedTrue(pageable).map(this::toResponseDTO);
    }

    /**
     * Customer: xem review của mình
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getMyReviews(Long userId, Pageable pageable) {
        return reviewRepository.findByUserId(userId, pageable).map(this::toResponseDTO);
    }

    /**
     * Kiểm tra booking đã có review chưa
     */
    public boolean existsByBookingId(Long bookingId) {
        return reviewRepository.existsByBookingBookingId(bookingId);
    }

    /**
     * Admin: xem tất cả review
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(this::toResponseDTO);
    }

    /**
     * Public: thống kê
     */
    public Map<String, Object> getReviewStats() {
        Double avgRating = reviewRepository.averageRatingOverall();
        Double avgClean = reviewRepository.averageRatingClean();
        Double avgService = reviewRepository.averageRatingService();
        Double avgLocation = reviewRepository.averageRatingLocation();
        Double avgValue = reviewRepository.averageRatingValue();
        Long totalReviews = reviewRepository.countApproved();

        // Round averages to 1 decimal place
        Double roundedOverall = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0;
        Double roundedClean = avgClean != null ? Math.round(avgClean * 10.0) / 10.0 : 0.0;
        Double roundedService = avgService != null ? Math.round(avgService * 10.0) / 10.0 : 0.0;
        Double roundedLocation = avgLocation != null ? Math.round(avgLocation * 10.0) / 10.0 : 0.0;
        Double roundedValue = avgValue != null ? Math.round(avgValue * 10.0) / 10.0 : 0.0;

        // Calculate distribution of ratingOverall (1 to 5 stars)
        java.util.List<Object[]> distributionRaw = reviewRepository.countByRatingOverall();
        java.util.Map<Integer, Long> distribution = new java.util.HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0L);
        }
        for (Object[] row : distributionRaw) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            if (rating != null) {
                distribution.put(rating, count);
            }
        }

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("averageRating", roundedOverall);
        stats.put("totalReviews", totalReviews);
        stats.put("avgClean", roundedClean);
        stats.put("avgService", roundedService);
        stats.put("avgLocation", roundedLocation);
        stats.put("avgValue", roundedValue);
        stats.put("distribution", distribution);

        return stats;
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
