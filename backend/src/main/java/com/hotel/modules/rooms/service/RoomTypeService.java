package com.hotel.modules.rooms.service;

import com.hotel.modules.rooms.dto.request.RoomTypeRequest;
import com.hotel.modules.rooms.dto.response.RoomTypeResponse;
import com.hotel.modules.rooms.entity.RoomType;
import com.hotel.modules.rooms.repository.RoomRepository;
import com.hotel.modules.rooms.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomTypeService {
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    // Query Operations
    public List<RoomTypeResponse> getAll() {
        return roomTypeRepository.findAll().stream().map(RoomTypeResponse::from).toList();
    }

    public RoomTypeResponse getById(Integer id) {
        RoomType roomType = findEntityById(id);
        return RoomTypeResponse.from(roomType);
    }

    public List<RoomTypeResponse> getByHotelId(Integer hotelId) {
        return roomTypeRepository.findByHotel_HotelId(hotelId).stream()
                .map(RoomTypeResponse::from)
                .toList();
    }

    // Command Operations
    @Transactional
    public RoomTypeResponse create(RoomTypeRequest req) {
        if (roomTypeRepository.existsByTypeName(req.getTypeName())) {
            throw new RuntimeException("Exist room type with name " + req.getTypeName());
        }
        RoomType roomType = new RoomType();
        mapRequestToEntity(req, roomType);

        RoomType save = roomTypeRepository.save(roomType);
        return RoomTypeResponse.from(save);
    }

    @Transactional
    public RoomTypeResponse update(Integer id, RoomTypeRequest req) {
        RoomType roomType = findEntityById(id);
        if (!roomType.getTypeName().equals(req.getTypeName()) &&
                roomTypeRepository.existsByTypeName(req.getTypeName())) {
            throw new RuntimeException("Exist room type with name " + req.getTypeName());
        }
        mapRequestToEntity(req, roomType);

        RoomType save = roomTypeRepository.save(roomType);
        return RoomTypeResponse.from(save);
    }

    @Transactional
    public void delete(Integer id) {
        if (!roomTypeRepository.existsById(id)) {
            throw new RuntimeException("Room type with id " + id + " does not exist");
        }
        if (roomRepository.existsByRoomType_TypeId(id)) {
            throw new RuntimeException("Room type with id " + id + " already exists");
        }
        roomTypeRepository.deleteById(id);
    }

    // Internal Helper Methods
    public RoomType findEntityById(Integer id) {
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room type with id " + id + " does not exist"));
    }

    private void mapRequestToEntity(RoomTypeRequest req, RoomType roomType) {
        roomType.setTypeName(req.getTypeName());
        roomType.setDescription(req.getDescription());
    }

    // search,change status
}
