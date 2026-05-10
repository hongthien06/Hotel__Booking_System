package com.hotel.modules.hotel.controller;

import com.hotel.modules.hotel.entity.Amenity;
import com.hotel.modules.hotel.repository.AmenityRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/amenities")
@RequiredArgsConstructor
@Tag(name = "Amenities", description = "Tiện ích khách sạn")
public class AmenityController {

    private final AmenityRepository amenityRepository;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả tiện ích (dùng cho sidebar filter)")
    public ResponseEntity<List<Amenity>> getAll() {
        return ResponseEntity.ok(amenityRepository.findAllByOrderByAmenityNameAsc());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo mới tiện ích")
    public ResponseEntity<Amenity> create(@RequestBody Amenity amenity) {
        return ResponseEntity.ok(amenityRepository.save(amenity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật tiện ích")
    public ResponseEntity<Amenity> update(@PathVariable Integer id, @RequestBody Amenity amenity) {
        return amenityRepository.findById(id)
                .map(existing -> {
                    existing.setAmenityName(amenity.getAmenityName());
                    existing.setIconClass(amenity.getIconClass());
                    existing.setDescription(amenity.getDescription());
                    return ResponseEntity.ok(amenityRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa tiện ích")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        amenityRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
