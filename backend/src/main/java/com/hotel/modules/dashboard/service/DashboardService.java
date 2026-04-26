package com.hotel.modules.dashboard.service;

import com.hotel.modules.auth.repository.UserRepository;
import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.repository.bookingRepository;
import com.hotel.modules.dashboard.dto.DashboardStatsDTO;
import com.hotel.modules.dashboard.dto.RecentBookingDTO;
import com.hotel.modules.payment.entity.PaymentStatus;
import com.hotel.modules.payment.repository.PaymentRepository;
import com.hotel.modules.room.entity.enums.RoomStatus;
import com.hotel.modules.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final RoomRepository roomRepository;
    private final bookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    public DashboardStatsDTO getStats() {
        try {
            long totalRooms = roomRepository.count();
            long availableRooms = roomRepository.findByStatus(RoomStatus.AVAILABLE).size();
            long totalBookings = bookingRepository.count();
            long totalCustomers = userRepository.count();

            // Calculate revenue from successful payments
            double totalRevenue = 0.0;
            try {
                totalRevenue = paymentRepository.findAll().stream()
                        .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                        .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                        .sum();
            } catch (Exception e) {
                System.err.println("Error calculating revenue: " + e.getMessage());
            }

            // Get 5 recent bookings
            var recentBookings = new java.util.ArrayList<RecentBookingDTO>();
            try {
                recentBookings.addAll(bookingRepository.findAll(
                        PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
                ).getContent().stream()
                        .map(this::mapToRecentBookingDTO)
                        .collect(Collectors.toList()));
            } catch (Exception e) {
                System.err.println("Error fetching recent bookings: " + e.getMessage());
            }

            return DashboardStatsDTO.builder()
                    .totalRooms(totalRooms)
                    .availableRooms(availableRooms)
                    .totalBookings(totalBookings)
                    .totalCustomers(totalCustomers)
                    .totalRevenue(totalRevenue)
                    .recentBookings(recentBookings)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy thống kê dashboard: " + e.getMessage());
        }
    }

    private RecentBookingDTO mapToRecentBookingDTO(Booking booking) {
        // Calculate amount for this booking
        double amount = 0.0;
        if (booking.getRoomPriceSnapshot() != null && booking.getTotalNights() != null) {
            amount = booking.getRoomPriceSnapshot().multiply(new BigDecimal(booking.getTotalNights())).doubleValue();
        }

        return RecentBookingDTO.builder()
                .id(booking.getBookingId())
                .customerName(booking.getUser() != null ? booking.getUser().getFullName() : "N/A")
                .roomNumber(booking.getRoom() != null ? booking.getRoom().getRoomNumber() : "N/A")
                .bookingDate(booking.getCreatedAt())
                .amount(amount)
                .status(booking.getStatus().name())
                .build();
    }
}
