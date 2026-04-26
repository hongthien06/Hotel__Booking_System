package com.hotel.modules.booking_services.service;

import com.hotel.modules.booking_services.dto.ExtraServiceDTO;
import com.hotel.modules.booking_services.entity.ExtraService;
import com.hotel.modules.booking_services.repository.ExtraServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExtraServiceService {

    private final ExtraServiceRepository extraServiceRepository;

    // CRUD
    public List<ExtraServiceDTO> getAllActiveServices() {
        return extraServiceRepository.findAllByIsActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ExtraServiceDTO> getAllServices() {
        return extraServiceRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExtraServiceDTO createService(ExtraServiceDTO dto) {
        ExtraService entity = new ExtraService();
        updateEntityFromDTO(entity, dto);
        ExtraService saved = extraServiceRepository.save(entity);
        return convertToDTO(saved);
    }

    @Transactional
    public ExtraServiceDTO updateService(Integer id, ExtraServiceDTO dto) {
        ExtraService entity = extraServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        updateEntityFromDTO(entity, dto);
        ExtraService saved = extraServiceRepository.save(entity);
        return convertToDTO(saved);
    }

    @Transactional
    public void deleteService(Integer id) {
        ExtraService entity = extraServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        entity.setIsActive(false);
        extraServiceRepository.save(entity);
    }

    private ExtraServiceDTO convertToDTO(ExtraService entity) {
        ExtraServiceDTO dto = new ExtraServiceDTO();
        dto.setServiceId(entity.getServiceId());
        dto.setServiceName(entity.getServiceName());
        dto.setDescription(entity.getDescription());
        dto.setUnitPrice(entity.getUnitPrice());
        dto.setPriceType(entity.getPriceType());
        dto.setIsActive(entity.getIsActive());
        return dto;
    }

    private void updateEntityFromDTO(ExtraService entity, ExtraServiceDTO dto) {
        entity.setServiceName(dto.getServiceName());
        entity.setDescription(dto.getDescription());
        entity.setUnitPrice(dto.getUnitPrice());
        entity.setPriceType(dto.getPriceType());
        if (dto.getIsActive() != null) {
            entity.setIsActive(dto.getIsActive());
        }
    }
}
