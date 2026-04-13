package com.hotel.modules.room.repository;

import com.hotel.modules.room.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomTypeRepository  extends JpaRepository<RoomType, Integer> {

}
