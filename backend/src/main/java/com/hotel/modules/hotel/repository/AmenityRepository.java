package com.hotel.modules.hotel.repository;

import com.hotel.modules.hotel.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Integer> {
    List<Amenity> findAllByOrderByAmenityNameAsc();
}
