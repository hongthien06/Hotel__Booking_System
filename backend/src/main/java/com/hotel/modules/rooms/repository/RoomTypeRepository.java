package com.hotel.modules.rooms.repository;

import com.hotel.modules.rooms.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    boolean existsByTypeName(String typeName);
    java.util.List<RoomType> findByHotel_HotelId(Integer hotelId);
}
