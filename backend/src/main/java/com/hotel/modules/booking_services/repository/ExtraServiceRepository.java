package com.hotel.modules.booking_services.repository;

import com.hotel.modules.booking_services.entity.ExtraService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExtraServiceRepository extends JpaRepository<ExtraService, Integer> {
    List<ExtraService> findAllByIsActiveTrue();
}
