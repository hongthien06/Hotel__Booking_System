package com.hotel.modules.room.repository;

import com.hotel.modules.room.entity.Room;
import com.hotel.modules.room.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByStatus(RoomStatus status);
    List<Room> findByRoomType_TypeName(String typeName);
    List<Room> findByPricePerNightBetween(BigDecimal minPrice, BigDecimal maxPrice);
    List<Room> findByProvince(String province);
    boolean existsByRoomNumber(String roomNumber);
}
