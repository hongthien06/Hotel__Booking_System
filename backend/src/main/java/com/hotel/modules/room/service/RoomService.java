package com.hotel.modules.room.service;


import com.hotel.modules.room.repository.RoomRepository;
import com.hotel.modules.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
}
