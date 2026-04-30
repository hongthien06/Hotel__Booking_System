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
@RequestMapping("/extra-services")
@RequiredArgsConstructor
public class ExtraServiceController {

    private final ExtraServiceService extraServiceService;

    @GetMapping("/active")
    public ResponseEntity<List<ExtraServiceDTO>> getActiveServices() {
        return ResponseEntity.ok(extraServiceService.getAllActiveServices());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ExtraServiceDTO>> getAllServices() {
        return ResponseEntity.ok(extraServiceService.getAllServices());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExtraServiceDTO> createService(@Valid @RequestBody ExtraServiceDTO dto) {
        return ResponseEntity.ok(extraServiceService.createService(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExtraServiceDTO> updateService(@PathVariable Integer id,
            @Valid @RequestBody ExtraServiceDTO dto) {
        return ResponseEntity.ok(extraServiceService.updateService(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteService(@PathVariable Integer id) {
        extraServiceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
