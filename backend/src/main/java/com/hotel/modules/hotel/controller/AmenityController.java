package com.hotel.modules.hotel.controller;

import com.hotel.modules.hotel.entity.Amenity;
import com.hotel.modules.hotel.repository.AmenityRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
