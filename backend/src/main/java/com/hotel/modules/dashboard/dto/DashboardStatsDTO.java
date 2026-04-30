package com.hotel.modules.dashboard.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardStatsDTO {
    private long totalRooms;
    private long availableRooms;
    private long occupiedRooms;
    private long maintenanceRooms;
    private long inactiveRooms;
    private long totalBookings;
    private long totalCustomers;
    private double totalRevenue;
    private List<RecentBookingDTO> recentBookings;
}
