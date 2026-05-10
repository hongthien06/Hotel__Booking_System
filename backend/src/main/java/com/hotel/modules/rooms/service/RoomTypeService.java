package com.hotel.modules.rooms.service;

import com.hotel.modules.hotel.entity.Hotel;
import com.hotel.modules.hotel.service.HotelService;
import com.hotel.modules.rooms.dto.request.RoomTypeRequest;
import com.hotel.modules.rooms.dto.response.RoomTypeResponse;
import com.hotel.modules.rooms.entity.RoomType;
import com.hotel.modules.rooms.entity.RoomTypeBed;
import com.hotel.modules.rooms.entity.enums.BedType;
import com.hotel.modules.rooms.repository.RoomRepository;
import com.hotel.modules.rooms.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomTypeService {
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final HotelService hotelService;

    // Query Operations
    public List<RoomTypeResponse> getAll() {
        return roomTypeRepository.findAllWithBeds().stream().map(RoomTypeResponse::from).toList();
    }

    public RoomTypeResponse getById(Integer id) {
        RoomType roomType = findEntityById(id);
        return RoomTypeResponse.from(roomType);
    }

    public List<RoomTypeResponse> getByHotelId(Long hotelId) {
        return roomTypeRepository.findByHotel_HotelIdWithBeds(hotelId).stream()
                .map(RoomTypeResponse::from)
                .toList();
    }

    // Command Operations
    @Transactional
    public RoomTypeResponse create(RoomTypeRequest req) {
        Hotel hotel = hotelService.findEntityById(req.getHotelId());
        RoomType roomType = new RoomType();
        mapRequestToEntity(req, roomType, hotel);

        RoomType save = roomTypeRepository.save(roomType);
        return RoomTypeResponse.from(save);
    }

    @Transactional
    public RoomTypeResponse update(Integer id, RoomTypeRequest req) {
        RoomType roomType = findEntityById(id);
        Hotel hotel = hotelService.findEntityById(req.getHotelId());
        mapRequestToEntity(req, roomType, hotel);

        RoomType save = roomTypeRepository.save(roomType);
        return RoomTypeResponse.from(save);
    }

    @Transactional
    public void delete(Integer id) {
        if (!roomTypeRepository.existsById(id)) {
            throw new RuntimeException("Room type with id " + id + " does not exist");
        }
        if (roomRepository.existsByRoomType_TypeId(id)) {
            throw new RuntimeException("Cannot delete room type — rooms still reference it");
        }
        roomTypeRepository.deleteById(id);
    }

    // Internal Helper Methods
    public RoomType findEntityById(Integer id) {
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room type with id " + id + " does not exist"));
    }

    private void mapRequestToEntity(RoomTypeRequest req, RoomType roomType, Hotel hotel) {
        roomType.setHotel(hotel);
        roomType.setTypeName(req.getTypeName());
        roomType.setAreaSqm(req.getAreaSqm());
        roomType.setMaxGuests(req.getMaxGuests());
        roomType.setBedrooms(req.getBedrooms() != null ? req.getBedrooms() : 1);
        roomType.setBathrooms(req.getBathrooms() != null ? req.getBathrooms() : 1);
        roomType.setPricePerNight(req.getPricePerNight());
        roomType.setDescription(req.getDescription());

        // Update beds
        roomType.getBeds().clear();
        if (req.getBeds() != null) {
            for (RoomTypeRequest.BedRequest bedReq : req.getBeds()) {
                RoomTypeBed bed = new RoomTypeBed();
                bed.setRoomType(roomType);
                bed.setBedType(BedType.valueOf(bedReq.getBedType().toUpperCase()));
                bed.setQuantity(bedReq.getQuantity());
                bed.setBedSize(bedReq.getBedSize());
                roomType.getBeds().add(bed);
            }
        }
    }

    // search,change status
}
