package com.hotel.modules.dashboard.controller;

import com.hotel.modules.dashboard.dto.DashboardChartDTO;
import com.hotel.modules.dashboard.dto.DashboardStatsDTO;
import com.hotel.modules.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Các API thống kê cho Dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Lấy thống kê Dashboard", description = "Chỉ dành cho ADMIN hoặc nhân viên")
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @Operation(summary = "Lấy dữ liệu biểu đồ Dashboard", description = "Doanh thu, booking, công suất phòng theo ngày")
    @GetMapping("/charts")
    public ResponseEntity<DashboardChartDTO> getCharts(@RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(dashboardService.getChartData(days));
    }
}

