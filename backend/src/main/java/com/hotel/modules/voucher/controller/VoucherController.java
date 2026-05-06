package com.hotel.modules.voucher.controller;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.voucher.dto.request.ApplyVoucherRequest;
import com.hotel.modules.voucher.dto.request.VoucherCreateRequest;
import com.hotel.modules.voucher.dto.request.VoucherQueryRequest;
import com.hotel.modules.voucher.dto.request.VoucherUpdateRequest;
import com.hotel.modules.voucher.dto.response.ApplyVoucherResponse;
import com.hotel.modules.voucher.dto.response.VoucherResponse;
import com.hotel.modules.voucher.service.IVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final IVoucherService voucherService;

    // ─────────────── ADMIN / MANAGER ───────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<VoucherResponse> createVoucher(
            @Validated @RequestBody VoucherCreateRequest request) {
        VoucherResponse response = voucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<VoucherResponse> updateVoucher(
            @PathVariable Long id,
            @Validated @RequestBody VoucherUpdateRequest request) {
        VoucherResponse response = voucherService.updateVoucher(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }

    // Lay danh sach tat ca voucher (co phan trang + filter)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Page<VoucherResponse>> getVouchers(VoucherQueryRequest query) {
        Pageable pageable = PageRequest.of(
                query.getPage(), query.getSize(),
                Sort.by("createdAt").descending());
        Page<VoucherResponse> page = voucherService.getVouchers(
                query.getStatus(), query.getCode(), pageable);
        return ResponseEntity.ok(page);
    }


    // Lay danh sach voucher dang hoat dong
    @GetMapping("/active")
    public ResponseEntity<List<VoucherResponse>> getActiveVouchers() {
        return ResponseEntity.ok(voucherService.getActiveVouchers());
    }

    // Kiem tra / xem chi tiet voucher theo ma
    @GetMapping("/code/{code}")
    public ResponseEntity<VoucherResponse> getVoucherByCode(@PathVariable String code) {
        return ResponseEntity.ok(voucherService.getVoucherByCode(code));
    }

    // Ap dung voucher vao booking
    @PostMapping("/apply")
    public ResponseEntity<ApplyVoucherResponse> applyVoucher(
            @Validated @RequestBody ApplyVoucherRequest request,
            @AuthenticationPrincipal User currentUser) {
        ApplyVoucherResponse response = voucherService.applyVoucher(request, currentUser);
        return ResponseEntity.ok(response);
    }

    // Huy voucher khoi booking
    @DeleteMapping("/booking/{bookingId}/remove")
    public ResponseEntity<Void> removeVoucher(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal User currentUser) {
        voucherService.removeVoucher(bookingId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
