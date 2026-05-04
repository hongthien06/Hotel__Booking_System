package com.hotel.modules.rooms.service;


import com.hotel.modules.booking.service.BookingService;
import com.hotel.modules.hotel.entity.Hotel;
import com.hotel.modules.hotel.service.HotelService;
import com.hotel.modules.rooms.dto.request.RoomRequest;
import com.hotel.modules.rooms.dto.response.RoomResponse;
import com.hotel.modules.rooms.entity.Room;
import com.hotel.modules.rooms.entity.enums.RoomStatus;
import com.hotel.modules.rooms.entity.RoomType;
import com.hotel.modules.rooms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {
    private final RoomRepository roomRepository;
    private final RoomTypeService roomTypeService;
    private final BookingService bookingService;
    private final HotelService hotelService;

    //Query Operations
    public List<RoomResponse> getAll() {
        return roomRepository.findAll().stream().map(RoomResponse::from).toList();
    }
    public RoomResponse getById(Long id) {
        Room room=findEntityById(id);
        return RoomResponse.from(room);
    }
    public List<RoomResponse> getByStatus(RoomStatus status) {
        return roomRepository.findByStatus(status).stream().map(RoomResponse::from).toList();
    }
    public List<RoomResponse> getByTypeName(String typeName) {
        return roomRepository.findByRoomType_TypeName(typeName).stream().map(RoomResponse::from).toList();
    }
    public List<RoomResponse> getByPriceRange(BigDecimal min, BigDecimal max) {
        return  roomRepository.findByPricePerNightBetween(min,max).stream().map(RoomResponse::from).toList();
    }
    public List<RoomResponse> getByProvince(String province) {
        return  roomRepository.findByHotel_Province(province).stream().map(RoomResponse::from).toList();
    }
    public List<RoomResponse> getByHotel(Long hotelId) {
        return roomRepository.findByHotel_HotelId(hotelId).stream().map(RoomResponse::from).toList();
    }

    //Command Operations
    @Transactional
    public RoomResponse create(RoomRequest req) {
        if(roomRepository.existsByRoomNumberAndHotel_HotelId(req.getRoomNumber(), req.getHotelId())) {
            throw new RuntimeException("Room number " + req.getRoomNumber() + " already exists in this hotel");
        }
        Room room=new Room();
        RoomType type=roomTypeService.findEntityById(req.getTypeId());
        Hotel hotel=hotelService.findEntityById(req.getHotelId());
        mapRequestToEntity(req,room,type,hotel);
        room.setCreatedAt(LocalDateTime.now());
        room.setUpdatedAt(LocalDateTime.now());
        Room save=roomRepository.save(room);
        return RoomResponse.from(save);

    }
    @Transactional
    public RoomResponse update(Long id,RoomRequest req) {
        Room room=findEntityById(id);
        if(!room.getRoomNumber().equals(req.getRoomNumber()) && roomRepository.existsByRoomNumberAndHotel_HotelId(req.getRoomNumber(), req.getHotelId())) {
            throw new RuntimeException("Room number " + req.getRoomNumber() + " already exists in this hotel");
        }
        RoomType type=roomTypeService.findEntityById(req.getTypeId());
        Hotel hotel=hotelService.findEntityById(req.getHotelId());
        mapRequestToEntity(req,room,type,hotel);
        room.setUpdatedAt(LocalDateTime.now());
        roomRepository.save(room);
        return RoomResponse.from(room);
    }
    @Transactional
    public void delete(Long id) {
        //soft delete
        Room room=findEntityById(id);
        room.setStatus(RoomStatus.INACTIVE);
        roomRepository.save(room);
    }
    @Transactional
    public RoomResponse updateStatus(Long id, RoomStatus status) {
        Room room=findEntityById(id);
        room.setStatus(status);
        room.setUpdatedAt(LocalDateTime.now());
        roomRepository.save(room);
        return RoomResponse.from(room);
    }

    //Internal Helper Methods
    private void mapRequestToEntity(RoomRequest req, Room room, RoomType type, Hotel hotel) {
       room.setHotel(hotel);
       room.setRoomType(type);
       room.setRoomNumber(req.getRoomNumber());
       room.setFloor(req.getFloor());
       room.setBedType(req.getBedType());
       room.setPricePerNight(req.getPricePerNight());
       if (req.getImageUrls() != null && !req.getImageUrls().isEmpty()) {
           java.util.List<String> validUrls = req.getImageUrls().stream()
               .filter(url -> url != null && !url.trim().isEmpty())
               .toList();
           room.setImageUrls(String.join(",", validUrls));
       } else {
           room.setImageUrls(null);
       }
       room.setDescription(req.getDescription());
       room.setStatus(req.getStatus());
    }
    public Room findEntityById(Long id){
        return roomRepository.findById(id).orElseThrow(()->new RuntimeException("Room with id " + id + " does not exist"));
    }
    @Transactional
    public List<RoomResponse> getAvailableRooms(
            LocalDate checkIn, LocalDate checkOut,
            Long hotelId, String province, BigDecimal minPrice, BigDecimal maxPrice,
            List<String> typeNames, List<String> bedTypes) {
        if (!checkOut.isAfter(checkIn)) throw new RuntimeException("Check out date must be after check in");
        List<Long> busyIds = bookingService.getOccupiedRoomIds(checkIn, checkOut);

        // Convert List<String> to List<BedType> enum
        List<com.hotel.modules.rooms.entity.enums.BedType> bedTypeEnums = null;
        if (bedTypes != null && !bedTypes.isEmpty()) {
            bedTypeEnums = bedTypes.stream()
                    .map(bt -> {
                        try {
                            return com.hotel.modules.rooms.entity.enums.BedType.valueOf(bt.toUpperCase());
                        } catch (IllegalArgumentException e) {
                            return null;
                        }
                    })
                    .filter(java.util.Objects::nonNull)
                    .toList();
        }

        // Pass all filters directly to the repository @Query
        List<Room> availableRooms = roomRepository.findAvailableRooms(
                (busyIds == null || busyIds.isEmpty()) ? null : busyIds,
                hotelId,
                (province != null && !province.isBlank()) ? province : null,
                minPrice,
                maxPrice,
                (typeNames != null && !typeNames.isEmpty()) ? typeNames : null,
                (bedTypeEnums == null || bedTypeEnums.isEmpty()) ? null : bedTypeEnums
        );
        return availableRooms.stream().map(RoomResponse::from).toList();
    }


}
