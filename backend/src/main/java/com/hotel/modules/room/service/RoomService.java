package com.hotel.modules.room.service;


import com.hotel.modules.room.dto.RoomRequest;
import com.hotel.modules.room.dto.RoomResponse;
import com.hotel.modules.room.dto.RoomTypeRequest;
import com.hotel.modules.room.entity.Room;
import com.hotel.modules.room.entity.RoomStatus;
import com.hotel.modules.room.entity.RoomType;
import com.hotel.modules.room.repository.RoomRepository;
import com.hotel.modules.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final RoomTypeService roomTypeService;

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
        return  roomRepository.findByProvince(province).stream().map(RoomResponse::from).toList();
    }

    //Command Operations
    @Transactional
    public RoomResponse create(RoomRequest req) {
        if(roomRepository.existsByRoomNumber(req.getRoomNumber())) {
            throw new RuntimeException("Room number " + req.getRoomNumber() + " already exists");
        }
        Room room=new Room();
        RoomType type=roomTypeService.findEntityById(req.getTypeId());
        mapRequestToEntity(req,room,type);
        room.setCreatedAt(LocalDateTime.now());
        room.setUpdatedAt(LocalDateTime.now());
        Room save=roomRepository.save(room);
        return RoomResponse.from(save);

    }
    @Transactional
    public RoomResponse update(Long id,RoomRequest req) {
        Room room=findEntityById(id);
        if(!room.getRoomNumber().equals(req.getRoomNumber()) && roomRepository.existsByRoomNumber(req.getRoomNumber())) {
            throw new RuntimeException("Room number " + req.getRoomNumber() + " already exists");
        }
        RoomType type=roomTypeService.findEntityById(req.getTypeId());
        mapRequestToEntity(req,room,type);
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

    //Internal Helper Methods
    private void mapRequestToEntity(RoomRequest req, Room room, RoomType type) {
       room.setRoomType(type);
       room.setRoomNumber(req.getRoomNumber());
       room.setFloor(req.getFloor());
       room.setBedType(req.getBedType());
       room.setProvince(req.getProvince());
       room.setDistrict(req.getDistrict());
       room.setAddress(req.getAddress());
       room.setPricePerNight(req.getPricePerNight());
       room.setThumbnailUrl(req.getThumbnailUrl());
       room.setImageUrls(req.getImageUrls());
       room.setDescription(req.getDescription());
       room.setStatus(req.getStatus());
    }
    public Room findEntityById(Long id){
        return roomRepository.findById(id).orElseThrow(()->new RuntimeException("Room with id " + id + " does not exist"));
    }


}
