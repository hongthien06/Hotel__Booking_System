package com.hotel.modules.rooms.repository;

import com.hotel.modules.rooms.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    boolean existsByTypeName(String typeName);

    @Query("SELECT DISTINCT rt FROM RoomType rt LEFT JOIN FETCH rt.beds LEFT JOIN FETCH rt.hotel")
    List<RoomType> findAllWithBeds();

    @Query("SELECT DISTINCT rt FROM RoomType rt LEFT JOIN FETCH rt.beds LEFT JOIN FETCH rt.hotel WHERE rt.hotel.hotelId = :hotelId")
    List<RoomType> findByHotel_HotelIdWithBeds(@Param("hotelId") Long hotelId);
}
