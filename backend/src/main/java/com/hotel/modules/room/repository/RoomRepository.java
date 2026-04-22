package com.hotel.modules.room.repository;

import com.hotel.modules.room.entity.Room;
import com.hotel.modules.room.entity.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("SELECT r FROM Room r JOIN FETCH r.roomType")
    List<Room> findAll();
    @Query("SELECT r FROM Room r JOIN FETCH r.roomType WHERE r.roomId = :id")
    Optional<Room> findById(@Param("id") Long id);
    @Query("SELECT r FROM Room r JOIN FETCH r.roomType WHERE r.status = :status")
    List<Room> findByStatus(@Param("status") RoomStatus status);
    @Query("SELECT r FROM Room r JOIN FETCH r.roomType WHERE r.roomType.typeName = :typeName")
    List<Room> findByRoomType_TypeName(@Param("typeName") String typeName);
    @Query("SELECT r FROM Room r JOIN FETCH r.roomType WHERE r.pricePerNight BETWEEN :min AND :max")
    List<Room> findByPricePerNightBetween(@Param("min") BigDecimal min, @Param("max") BigDecimal max);
    @Query("SELECT r FROM Room r JOIN FETCH r.roomType WHERE r.province = :province")
    List<Room> findByProvince(@Param("province") String province);
    boolean existsByRoomNumber(String roomNumber);
    boolean existsByRoomType_TypeId(Integer typeId);
}
