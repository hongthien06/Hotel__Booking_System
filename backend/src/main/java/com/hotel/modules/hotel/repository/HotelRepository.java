package com.hotel.modules.hotel.repository;

import com.hotel.modules.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    Optional<Hotel> findByHotelCode(String hotelCode);
    List<Hotel> findByProvince(String province);
    List<Hotel> findByHotelNameContainingIgnoreCase(String name);
}
