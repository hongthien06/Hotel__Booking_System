package com.hotel.modules.hotel.repository;

import com.hotel.modules.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    Optional<Hotel> findByHotelCode(String hotelCode);
    List<Hotel> findByProvince(String province);
    List<Hotel> findByHotelNameContainingIgnoreCase(String name);

    /**
     * Lọc khách sạn có ÍT NHẤT MỘT trong các amenity được chỉ định.
     * Frontend có thể gửi nhiều amenity, backend trả về hotel chứa bất kỳ amenity nào trong danh sách.
     */
    @Query("""
        SELECT DISTINCT h FROM Hotel h
        JOIN h.amenities a
        WHERE a.amenityName IN :amenityNames
        AND h.isActive = true
    """)
    List<Hotel> findByAmenityNames(@Param("amenityNames") List<String> amenityNames);
}
