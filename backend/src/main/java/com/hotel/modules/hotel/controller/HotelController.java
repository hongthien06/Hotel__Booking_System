package com.hotel.modules.hotel.controller;

import com.hotel.modules.hotel.dto.request.HotelRequest;
import com.hotel.modules.hotel.dto.response.HotelResponse;
import com.hotel.modules.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hotels")
@RequiredArgsConstructor
public class HotelController {
    private final HotelService hotelService;

    @GetMapping
    public ResponseEntity<List<HotelResponse>> getAll() {
        return ResponseEntity.ok(hotelService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getById(id));
    }

    @GetMapping("/province/{province}")
    public ResponseEntity<List<HotelResponse>> getByProvince(@PathVariable String province) {
        return ResponseEntity.ok(hotelService.getByProvince(province));
    }

    @PostMapping
    public ResponseEntity<HotelResponse> create(@RequestBody HotelRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hotelService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HotelResponse> update(@PathVariable Long id, @RequestBody HotelRequest req) {
        return ResponseEntity.ok(hotelService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        hotelService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
