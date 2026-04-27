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

    @Query("""
    SELECT r FROM Room r 
    JOIN FETCH r.roomType rt
    WHERE r.status = com.hotel.modules.room.entity.enums.RoomStatus.AVAILABLE
    AND (:province IS NULL OR r.province = :province)
    AND (:minPrice IS NULL OR r.pricePerNight >= :minPrice)
    AND (:maxPrice IS NULL OR r.pricePerNight <= :maxPrice)
    AND (:typeName IS NULL OR rt.typeName = :typeName)
    AND (:bedType IS NULL OR r.bedType = :bedType)
    AND (:occupiedIds IS NULL OR r.roomId NOT IN :occupiedIds)
""")
    List<Room> findAvailableRooms(
            @Param("occupiedIds") List<Long> occupiedIds,
            @Param("province") String province,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("typeName") String typeName,
            @Param("bedType") String bedType
    );
}
