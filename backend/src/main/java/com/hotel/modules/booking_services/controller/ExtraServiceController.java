package com.hotel.modules.booking_services.controller;

import com.hotel.modules.booking_services.dto.ExtraServiceDTO;
import com.hotel.modules.booking_services.service.ExtraServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/extra-services")
@RequiredArgsConstructor
@Tag(name = "Extra Services Catalog", description = "Quản lý danh mục các dịch vụ bổ sung (Admin/Staff)")
public class ExtraServiceController {

    private final ExtraServiceService extraServiceService;

    @Operation(summary = "Lấy danh sách dịch vụ đang hoạt động", description = "Dành cho khách hàng xem để chọn")
    @GetMapping("/active")
    public ResponseEntity<List<ExtraServiceDTO>> getActiveServices() {
        return ResponseEntity.ok(extraServiceService.getAllActiveServices());
    }

    @Operation(summary = "Lấy tất cả dịch vụ (Admin)", description = "Bao gồm cả các dịch vụ đã ẩn")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<ExtraServiceDTO>> getAllServices() {
        return ResponseEntity.ok(extraServiceService.getAllServices());
    }

    @Operation(summary = "Tạo dịch vụ mới", description = "Chỉ dành cho ADMIN")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExtraServiceDTO> createService(@Valid @RequestBody ExtraServiceDTO dto) {
        return ResponseEntity.ok(extraServiceService.createService(dto));
    }

    @Operation(summary = "Cập nhật dịch vụ", description = "Chỉ dành cho ADMIN")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExtraServiceDTO> updateService(@PathVariable Integer id, @Valid @RequestBody ExtraServiceDTO dto) {
        return ResponseEntity.ok(extraServiceService.updateService(id, dto));
    }

    @Operation(summary = "Xóa (ẩn) dịch vụ", description = "Chuyển trạng thái isActive sang false")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteService(@PathVariable Integer id) {
        extraServiceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
