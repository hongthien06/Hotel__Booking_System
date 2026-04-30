package com.hotel.modules.room.service;


import com.hotel.modules.booking.service.BookingService;
import com.hotel.modules.hotel.entity.Hotel;
import com.hotel.modules.hotel.service.HotelService;
import com.hotel.modules.room.dto.request.RoomRequest;
import com.hotel.modules.room.dto.response.RoomResponse;
import com.hotel.modules.room.entity.Room;
import com.hotel.modules.room.entity.enums.RoomStatus;
import com.hotel.modules.room.entity.RoomType;
import com.hotel.modules.room.repository.RoomRepository;
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
       room.setImageUrls(req.getImageUrls());
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
            String typeName, String bedType) {
        if (!checkOut.isAfter(checkIn)) throw new RuntimeException("Check out date must be after check in");
        List<Long> busyIds = bookingService.getOccupiedRoomIds(checkIn, checkOut);
        // Pass all filters directly to the repository @Query
        List<Room> availableRooms = roomRepository.findAvailableRooms(
                (busyIds == null || busyIds.isEmpty()) ? null : busyIds,
                hotelId,
                (province != null && !province.isBlank()) ? province : null,
                minPrice,
                maxPrice,
                (typeName != null && !typeName.isBlank()) ? typeName : null,
                (bedType != null && !bedType.isBlank()) ? bedType : null
        );
        return availableRooms.stream().map(RoomResponse::from).toList();
    }


}
