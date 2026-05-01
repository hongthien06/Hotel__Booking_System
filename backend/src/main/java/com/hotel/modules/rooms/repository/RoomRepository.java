package com.hotel.modules.rooms.repository;

import com.hotel.modules.rooms.entity.Room;
import com.hotel.modules.rooms.entity.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("SELECT r FROM Room r JOIN FETCH r.roomType JOIN FETCH r.hotel")
    List<Room> findAll();

    @Query("SELECT r FROM Room r JOIN FETCH r.roomType JOIN FETCH r.hotel WHERE r.roomId = :id")
    Optional<Room> findById(@Param("id") Long id);

    @Query("SELECT r FROM Room r JOIN FETCH r.roomType JOIN FETCH r.hotel WHERE r.status = :status")
    List<Room> findByStatus(@Param("status") RoomStatus status);

    @Query("SELECT r FROM Room r JOIN FETCH r.roomType JOIN FETCH r.hotel WHERE r.hotel.hotelId = :hotelId")
    List<Room> findByHotel_HotelId(@Param("hotelId") Long hotelId);

    @Query("SELECT r FROM Room r JOIN FETCH r.roomType JOIN FETCH r.hotel WHERE r.roomType.typeName = :typeName")
    List<Room> findByRoomType_TypeName(@Param("typeName") String typeName);

    @Query("SELECT r FROM Room r JOIN FETCH r.roomType JOIN FETCH r.hotel WHERE r.pricePerNight BETWEEN :min AND :max")
    List<Room> findByPricePerNightBetween(@Param("min") BigDecimal min, @Param("max") BigDecimal max);

    @Query("SELECT r FROM Room r JOIN FETCH r.roomType JOIN FETCH r.hotel WHERE r.hotel.province = :province")
    List<Room> findByHotel_Province(@Param("province") String province);

    boolean existsByRoomNumberAndHotel_HotelId(String roomNumber, Long hotelId);
    boolean existsByRoomType_TypeId(Integer typeId);

    @Query("""
    SELECT r FROM Room r 
    JOIN FETCH r.roomType rt
    JOIN FETCH r.hotel h
    WHERE r.status = com.hotel.modules.rooms.entity.enums.RoomStatus.AVAILABLE
    AND (:hotelId IS NULL OR h.hotelId = :hotelId)
    AND (:province IS NULL OR h.province = :province)
    AND (:minPrice IS NULL OR r.pricePerNight >= :minPrice)
    AND (:maxPrice IS NULL OR r.pricePerNight <= :maxPrice)
    AND (:typeName IS NULL OR rt.typeName = :typeName)
    AND (:bedType IS NULL OR r.bedType = :bedType)
    AND (:occupiedIds IS NULL OR r.roomId NOT IN :occupiedIds)
""")
    List<Room> findAvailableRooms(
            @Param("occupiedIds") List<Long> occupiedIds,
            @Param("hotelId") Long hotelId,
            @Param("province") String province,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("typeName") String typeName,
            @Param("bedType") String bedType
    );
}
