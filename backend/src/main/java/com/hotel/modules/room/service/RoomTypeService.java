package com.hotel.modules.room.service;


import com.hotel.modules.room.dto.RoomTypeRequest;
import com.hotel.modules.room.dto.RoomTypeResponse;
import com.hotel.modules.room.entity.RoomType;
import com.hotel.modules.room.repository.RoomRepository;
import com.hotel.modules.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomTypeService {
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    //Query Operations
    public List<RoomTypeResponse> getAll(){
        return roomTypeRepository.findAll().stream().map(RoomTypeResponse::from).toList();
    }
    public RoomTypeResponse getById(Integer id){
        RoomType roomType=findEntityById(id);
        return RoomTypeResponse.from(roomType);
    }

    //Command Operations
    @Transactional
    public RoomTypeResponse create(RoomTypeRequest req){
        if(roomTypeRepository.existsByTypeName(req.getTypeName())){
            throw new RuntimeException("Exist room type with name " + req.getTypeName());
        }
        RoomType roomType=new RoomType();
        mapRequestToEntity(req,roomType);

        RoomType save=roomTypeRepository.save(roomType);
        return RoomTypeResponse.from(save);
    }
    @Transactional
    public RoomTypeResponse update(Integer id,RoomTypeRequest req){
        RoomType roomType=findEntityById(id);
        if(!roomType.getTypeName().equals(req.getTypeName()) &&
        roomTypeRepository.existsByTypeName(req.getTypeName())){
            throw new RuntimeException("Exist room type with name " + req.getTypeName());
        }
        mapRequestToEntity(req,roomType);

        RoomType save=roomTypeRepository.save(roomType);
        return RoomTypeResponse.from(save);
    }
    @Transactional
    public void delete(Integer id){
        if(!roomTypeRepository.existsById(id)){
            throw new RuntimeException("Room type with id " + id + " does not exist");
        }
        if(roomRepository.existsByRoomType_TypeId(id)){
            throw new RuntimeException("Room type with id " + id + " already exists");
        }
        roomTypeRepository.deleteById(id);
    }

    //Internal Helper Methods
    public RoomType findEntityById(Integer id){
        return roomTypeRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Room type with id " + id + " does not exist"));
    }
    private void mapRequestToEntity(RoomTypeRequest req, RoomType roomType) {
        roomType.setTypeName(req.getTypeName());
        roomType.setDescription(req.getDescription());
        roomType.setBasePrice(req.getBasePrice());
        roomType.setMaxOccupancy(req.getMaxOccupancy());
    }


    //search,change status
}
