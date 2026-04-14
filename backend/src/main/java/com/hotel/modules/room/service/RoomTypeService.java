package com.hotel.modules.room.service;


import com.hotel.modules.room.dto.RoomTypeRequest;
import com.hotel.modules.room.dto.RoomTypeResponse;
import com.hotel.modules.room.entity.RoomType;
import com.hotel.modules.room.repository.RoomRepository;
import com.hotel.modules.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomTypeService {
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    public List<RoomTypeResponse> getAll(){
        return roomTypeRepository.findAll().stream().map(RoomTypeResponse::from).toList();
    }
    public RoomTypeResponse getById(Integer id){
        RoomType roomType=findEntityById(id);
        return RoomTypeResponse.from(roomType);
    }
    public RoomTypeResponse create(RoomTypeRequest req){
        RoomType roomType=new RoomType();
        roomType.setTypeName(req.getTypeName());
        roomType.setDescription(req.getDescription());
        roomType.setBasePrice(req.getBasePrice());
        roomType.setMaxOccupancy(req.getMaxOccupancy());

        RoomType save=roomTypeRepository.save(roomType);
        return RoomTypeResponse.from(save);
    }
    public RoomTypeResponse update(Integer id,RoomTypeRequest req){
        RoomType roomType=findEntityById(id);
        roomType.setTypeName(req.getTypeName());
        roomType.setDescription(req.getDescription());
        roomType.setBasePrice(req.getBasePrice());
        roomType.setMaxOccupancy(req.getMaxOccupancy());

        RoomType save=roomTypeRepository.save(roomType);
        return RoomTypeResponse.from(save);
    }
    public void delete(Integer id){
        if(!roomTypeRepository.existsById(id)){
            throw new RuntimeException("Not found"+id);
        }
        if(roomRepository.existsByRoomType_TypeId(id)){
            throw new RuntimeException("exists"+id);
        }
        roomTypeRepository.deleteById(id);
    }

    public RoomType findEntityById(Integer id){
        return roomTypeRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Not found"+id));
    }


    //search,change status
}
