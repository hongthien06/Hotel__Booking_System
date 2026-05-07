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
     * Lọc khách sạn có TẤT CẢ các amenity được chỉ định (AND logic).
     * Frontend gửi danh sách amenityNames, trả về hotel chứa đầy đủ các amenity đó.
     */
    @Query("""
        SELECT h FROM Hotel h
        JOIN h.amenities a
        WHERE a.amenityName IN :amenityNames
        AND h.isActive = true
        GROUP BY h.hotelId, h.hotelCode, h.hotelName, h.province, h.provinceCode, h.district, h.address, h.starRating, h.description, h.thumbnailUrl, h.imageUrls, h.phone, h.email, h.isActive, h.createdAt, h.updatedAt
        HAVING COUNT(DISTINCT a.amenityId) = :amenityCount
    """)
    List<Hotel> findByAmenityNames(@Param("amenityNames") List<String> amenityNames, @Param("amenityCount") long amenityCount);
}
