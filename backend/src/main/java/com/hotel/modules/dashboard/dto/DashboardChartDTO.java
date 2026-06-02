package com.hotel.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardChartDTO {

    private List<DailyRevenue> revenueByDay;
    private List<BookingByStatus> bookingsByStatus;
    private List<RoomOccupancy> roomOccupancy;
    private List<RevenueByRoomType> revenueByRoomType;

    private double todayRevenue;
    private long todayBookings;
    private long todayCheckIns;
    private long todayCheckOuts;
    private double occupancyRate;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyRevenue {
        private String date;
        private double revenue;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BookingByStatus {
        private String status;
        private long count;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoomOccupancy {
        private String date;
        private long occupied;
        private long available;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenueByRoomType {
        private String roomType;
        private double revenue;
    }
}
