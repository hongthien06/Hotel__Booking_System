package com.hotel.modules.dashboard.service;

import com.hotel.modules.auth.repository.UserRepository;
import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingStatus;
import com.hotel.modules.booking.repository.BookingRepository;
import com.hotel.modules.dashboard.dto.DashboardChartDTO;
import com.hotel.modules.dashboard.dto.DashboardStatsDTO;
import com.hotel.modules.dashboard.dto.RecentBookingDTO;
import com.hotel.modules.payment.entity.PaymentStatus;
import com.hotel.modules.payment.repository.PaymentRepository;
import com.hotel.modules.rooms.entity.enums.RoomStatus;
import com.hotel.modules.rooms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDTO getStats() {
        try {
            long totalRooms = roomRepository.count();
            long availableRooms = roomRepository.findByStatus(RoomStatus.AVAILABLE).size();
            long occupiedRooms = roomRepository.findByStatus(RoomStatus.OCCUPIED).size();
            long maintenanceRooms = roomRepository.findByStatus(RoomStatus.MAINTENANCE).size();
            long inactiveRooms = roomRepository.findByStatus(RoomStatus.INACTIVE).size();
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
            List<RecentBookingDTO> recentBookings = new ArrayList<>();
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
                    .occupiedRooms(occupiedRooms)
                    .maintenanceRooms(maintenanceRooms)
                    .inactiveRooms(inactiveRooms)
                    .totalBookings(totalBookings)
                    .totalCustomers(totalCustomers)
                    .totalRevenue(totalRevenue)
                    .recentBookings(recentBookings)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy thống kê dashboard: " + e.getMessage());
        }
    }

    /**
     * Lấy dữ liệu cho biểu đồ Dashboard
     */
    public DashboardChartDTO getChartData(int days) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1);
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = today.plusDays(1).atStartOfDay();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");

        // 1. Doanh thu theo ngày
        List<Object[]> dailyRevenueRaw = paymentRepository.findDailyRevenue(PaymentStatus.SUCCESS, startDateTime, endDateTime);
        List<DashboardChartDTO.DailyRevenue> revenueByDay = new ArrayList<>();
        for (LocalDate d = startDate; !d.isAfter(today); d = d.plusDays(1)) {
            final LocalDate date = d;
            double revenue = dailyRevenueRaw.stream()
                    .filter(row -> {
                        Object dateObj = row[0];
                        if (dateObj instanceof LocalDate ld) return ld.equals(date);
                        if (dateObj instanceof java.sql.Date sd) return sd.toLocalDate().equals(date);
                        return false;
                    })
                    .mapToDouble(row -> ((Number) row[1]).doubleValue())
                    .findFirst().orElse(0);
            revenueByDay.add(DashboardChartDTO.DailyRevenue.builder()
                    .date(date.format(fmt))
                    .revenue(revenue)
                    .build());
        }

        // 2. Booking theo trạng thái
        List<Object[]> statusRaw = bookingRepository.countByStatusGrouped();
        List<DashboardChartDTO.BookingByStatus> bookingsByStatus = statusRaw.stream()
                .map(row -> DashboardChartDTO.BookingByStatus.builder()
                        .status(row[0].toString())
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());

        // 3. Công suất phòng theo ngày (dùng room count)
        long totalRooms = roomRepository.count();
        List<DashboardChartDTO.RoomOccupancy> roomOccupancy = new ArrayList<>();
        for (LocalDate d = startDate; !d.isAfter(today); d = d.plusDays(1)) {
            long occupied = roomRepository.findByStatus(RoomStatus.OCCUPIED).size(); // simplified
            roomOccupancy.add(DashboardChartDTO.RoomOccupancy.builder()
                    .date(d.format(fmt))
                    .occupied(occupied)
                    .available(totalRooms - occupied)
                    .build());
        }

        // 4. Doanh thu theo loại phòng
        List<Object[]> roomTypeRevenueRaw = paymentRepository.findRevenueByRoomType(PaymentStatus.SUCCESS, startDateTime, endDateTime);
        List<DashboardChartDTO.RevenueByRoomType> revenueByRoomType = roomTypeRevenueRaw.stream()
                .map(row -> DashboardChartDTO.RevenueByRoomType.builder()
                        .roomType((String) row[0])
                        .revenue(((Number) row[1]).doubleValue())
                        .build())
                .collect(Collectors.toList());

        // 5. Số liệu hôm nay
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.plusDays(1).atStartOfDay();
        BigDecimal todayRevenueBD = paymentRepository.sumRevenueByDateRange(PaymentStatus.SUCCESS, todayStart, todayEnd);
        long todayBookings = bookingRepository.countByCreatedAtBetween(todayStart, todayEnd);
        long todayCheckIns = bookingRepository.countByStatusAndCheckInDate(BookingStatus.CHECKED_IN, today);
        long todayCheckOuts = bookingRepository.countByStatusAndCheckOutDate(BookingStatus.CHECKED_OUT, today);
        double occupancyRate = totalRooms > 0
                ? (double) roomRepository.findByStatus(RoomStatus.OCCUPIED).size() / totalRooms * 100
                : 0;

        return DashboardChartDTO.builder()
                .revenueByDay(revenueByDay)
                .bookingsByStatus(bookingsByStatus)
                .roomOccupancy(roomOccupancy)
                .revenueByRoomType(revenueByRoomType)
                .todayRevenue(todayRevenueBD != null ? todayRevenueBD.doubleValue() : 0)
                .todayBookings(todayBookings)
                .todayCheckIns(todayCheckIns)
                .todayCheckOuts(todayCheckOuts)
                .occupancyRate(Math.round(occupancyRate * 10.0) / 10.0)
                .build();
    }

    private RecentBookingDTO mapToRecentBookingDTO(Booking booking) {
        // Calculate amount for this booking (from payment table if available, fallback to final calculated amount)
        double amount = 0.0;
        java.util.Optional<com.hotel.modules.payment.entity.Payment> paymentOpt =
                paymentRepository.findByBookingId(booking.getBookingId());
        if (paymentOpt.isPresent()) {
            amount = paymentOpt.get().getAmount() != null ? paymentOpt.get().getAmount().doubleValue() : 0.0;
        } else {
            BigDecimal roomTotal = BigDecimal.ZERO;
            if (booking.getRoomPriceSnapshot() != null && booking.getTotalNights() != null) {
                roomTotal = booking.getRoomPriceSnapshot().multiply(new BigDecimal(booking.getTotalNights()));
            }
            BigDecimal serviceTotal = BigDecimal.ZERO;
            if (booking.getBookingServices() != null) {
                serviceTotal = booking.getBookingServices().stream()
                        .map(bs -> bs.getSubtotal() != null ? bs.getSubtotal()
                                : (bs.getUnitPriceSnap() != null && bs.getQuantity() != null
                                    ? bs.getUnitPriceSnap().multiply(BigDecimal.valueOf(bs.getQuantity()))
                                    : BigDecimal.ZERO))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
            BigDecimal discountAmt = booking.getDiscountAmount() != null ? booking.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal subtotal = roomTotal.add(serviceTotal);
            BigDecimal tax = com.hotel.common.utils.TaxUtil.calculateVat(subtotal);
            amount = subtotal.add(tax).subtract(discountAmt).doubleValue();
            if (amount < 0.0) {
                amount = 0.0;
            }
        }

        // Gom tất cả số phòng từ BookingRooms (đơn đôi/đa phòng)
        String roomNumber;
        if (booking.getBookingRooms() != null && !booking.getBookingRooms().isEmpty()) {
            roomNumber = booking.getBookingRooms().stream()
                    .filter(br -> br.getRoom() != null)
                    .sorted(java.util.Comparator.comparingInt(br -> br.getSortOrder() != null ? br.getSortOrder() : 0))
                    .map(br -> br.getRoom().getRoomNumber())
                    .collect(java.util.stream.Collectors.joining(" & "));
        } else {
            roomNumber = booking.getRoom() != null ? booking.getRoom().getRoomNumber() : "N/A";
        }

        return RecentBookingDTO.builder()
                .id(booking.getBookingId())
                .customerName(booking.getUser() != null ? booking.getUser().getFullName() : "N/A")
                .roomNumber(roomNumber)
                .bookingDate(booking.getCreatedAt())
                .amount(amount)
                .status(booking.getStatus().name())
                .build();
    }
}
