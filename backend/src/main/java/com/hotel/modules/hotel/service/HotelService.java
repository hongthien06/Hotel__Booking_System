package com.hotel.modules.hotel.service;

import com.hotel.modules.hotel.dto.request.HotelRequest;
import com.hotel.modules.hotel.dto.response.HotelResponse;
import com.hotel.modules.hotel.entity.Hotel;
import com.hotel.modules.hotel.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HotelService {
    private final HotelRepository hotelRepository;

    public List<HotelResponse> getAll() {
        return hotelRepository.findAll().stream()
                .map(HotelResponse::from)
                .collect(Collectors.toList());
    }

    public HotelResponse getById(Long id) {
        return HotelResponse.from(findEntityById(id));
    }

    public List<HotelResponse> getByProvince(String province) {
        return hotelRepository.findByProvince(province).stream()
                .map(HotelResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public HotelResponse create(HotelRequest req) {
        if (hotelRepository.findByHotelCode(req.getHotelCode()).isPresent()) {
            throw new RuntimeException("Hotel code " + req.getHotelCode() + " already exists");
        }
        Hotel hotel = new Hotel();
        mapRequestToEntity(req, hotel);
        return HotelResponse.from(hotelRepository.save(hotel));
    }

    @Transactional
    public HotelResponse update(Long id, HotelRequest req) {
        Hotel hotel = findEntityById(id);
        if (!hotel.getHotelCode().equals(req.getHotelCode()) && 
            hotelRepository.findByHotelCode(req.getHotelCode()).isPresent()) {
            throw new RuntimeException("Hotel code " + req.getHotelCode() + " already exists");
        }
        mapRequestToEntity(req, hotel);
        return HotelResponse.from(hotelRepository.save(hotel));
    }

    @Transactional
    public void delete(Long id) {
        Hotel hotel = findEntityById(id);
        hotel.setIsActive(false); // Soft delete
        hotelRepository.save(hotel);
    }

    public Hotel findEntityById(Long id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
    }

    private void mapRequestToEntity(HotelRequest req, Hotel hotel) {
        hotel.setHotelCode(req.getHotelCode());
        hotel.setHotelName(req.getHotelName());
        hotel.setProvince(req.getProvince());
        hotel.setProvinceCode(req.getProvinceCode());
        hotel.setDistrict(req.getDistrict());
        hotel.setAddress(req.getAddress());
        hotel.setStarRating(req.getStarRating());
        hotel.setDescription(req.getDescription());
        hotel.setThumbnailUrl(req.getThumbnailUrl());
        hotel.setImageUrls(req.getImageUrls());
        hotel.setPhone(req.getPhone());
        hotel.setEmail(req.getEmail());
    }
}
