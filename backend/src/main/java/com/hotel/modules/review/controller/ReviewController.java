package com.hotel.modules.review.controller;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.review.dto.AdminReplyDTO;
import com.hotel.modules.review.dto.ReviewRequestDTO;
import com.hotel.modules.review.dto.ReviewResponseDTO;
import com.hotel.modules.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "API đánh giá khách sạn")
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "Tạo đánh giá", description = "Customer tạo đánh giá cho booking đã CHECKED_OUT")
    @PostMapping
    public ResponseEntity<ReviewResponseDTO> createReview(
            @Valid @RequestBody ReviewRequestDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.createReview(dto, user.getUserId()));
    }

    @Operation(summary = "Xem đánh giá đã duyệt", description = "Public: xem tất cả đánh giá đã duyệt")
    @GetMapping("/approved")
    public ResponseEntity<Page<ReviewResponseDTO>> getApprovedReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getApprovedReviews(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @Operation(summary = "Xem đánh giá của tôi", description = "Customer xem đánh giá của mình")
    @GetMapping("/my")
    public ResponseEntity<Page<ReviewResponseDTO>> getMyReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.getMyReviews(user.getUserId(),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @Operation(summary = "Kiểm tra đã đánh giá booking chưa", description = "Customer kiểm tra booking đã có review chưa")
    @GetMapping("/check/{bookingId}")
    public ResponseEntity<Map<String, Boolean>> checkReviewExists(
            @PathVariable Long bookingId) {
        boolean exists = reviewService.existsByBookingId(bookingId);
        return ResponseEntity.ok(Map.of("reviewed", exists));
    }

    @Operation(summary = "Thống kê đánh giá", description = "Public: lấy thống kê đánh giá (average rating, total)")
    @GetMapping("/approved/stats")
    public ResponseEntity<Map<String, Object>> getReviewStats() {
        return ResponseEntity.ok(reviewService.getReviewStats());
    }

    @Operation(summary = "Admin: Xem tất cả đánh giá", description = "Admin/Manager xem tất cả đánh giá")
    @GetMapping
    public ResponseEntity<Page<ReviewResponseDTO>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getAllReviews(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @Operation(summary = "Admin: Duyệt đánh giá")
    @PutMapping("/{id}/approve")
    public ResponseEntity<ReviewResponseDTO> approveReview(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.approveReview(id));
    }

    @Operation(summary = "Admin: Trả lời đánh giá")
    @PutMapping("/{id}/reply")
    public ResponseEntity<ReviewResponseDTO> replyReview(
            @PathVariable Long id,
            @RequestBody AdminReplyDTO dto) {
        return ResponseEntity.ok(reviewService.replyReview(id, dto));
    }

    @Operation(summary = "Admin: Xóa đánh giá")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok().build();
    }
}
