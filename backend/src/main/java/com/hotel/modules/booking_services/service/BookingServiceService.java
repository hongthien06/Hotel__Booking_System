package com.hotel.modules.booking_services.service;

import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.repository.bookingRepository;
import com.hotel.modules.booking_services.dto.BookingServiceRequest;
import com.hotel.modules.booking_services.dto.BookingServiceResponse;
import com.hotel.modules.booking_services.entity.BookingService;
import com.hotel.modules.booking_services.entity.BookingServiceId;
import com.hotel.modules.booking_services.entity.ExtraService;
import com.hotel.modules.booking_services.repository.BookingServiceRepository;
import com.hotel.modules.booking_services.repository.ExtraServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceService {

    private final BookingServiceRepository bookingServiceRepository;
    private final ExtraServiceRepository extraServiceRepository;
    private final bookingRepository bookingRepo;

    // láy list service từ booking
    public List<BookingServiceResponse> getServicesByBooking(Long bookingId) {
        return bookingServiceRepository.findByIdBookingId(bookingId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    // add khi user booking và chọn 1 service
    public BookingServiceResponse addServiceToBooking(Long bookingId, BookingServiceRequest request) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        ExtraService extraService = extraServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        BookingServiceId id = new BookingServiceId(bookingId, request.getServiceId());

        // kiểm tra Booking service có tồn tại chưa, nếu chưa thì tạo mới
        BookingService bookingService = bookingServiceRepository.findById(id).orElse(new BookingService());

        // nếu mới tạo mới thì set những giá trị cho nó
        if (bookingService.getId() == null || bookingService.getId().getBookingId() == null) {
            bookingService.setId(id);
            bookingService.setBooking(booking);
            bookingService.setExtraService(extraService);
            bookingService.setUnitPriceSnap(extraService.getUnitPrice());
            bookingService.setQuantity(request.getQuantity());
        } else {
            // có rôi thì set quantity cho nó
            bookingService.setQuantity((short) (bookingService.getQuantity() + request.getQuantity()));
        }

        BookingService saved = bookingServiceRepository.save(bookingService);
        return convertToResponse(saved);
    }

    // khi user có thêm 1 bookingservice
    @Transactional
    public BookingServiceResponse updateServiceQuantity(Long bookingId, Integer serviceId, Short quantity) {
        if (quantity < 1) {
            throw new RuntimeException("Quantity must be at least 1");
        }

        BookingServiceId id = new BookingServiceId(bookingId, serviceId);
        BookingService bookingService = bookingServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found in this booking"));

        bookingService.setQuantity(quantity);
        BookingService saved = bookingServiceRepository.save(bookingService);
        return convertToResponse(saved);
    }

    @Transactional
    public void removeServiceFromBooking(Long bookingId, Integer serviceId) {
        BookingServiceId id = new BookingServiceId(bookingId, serviceId);
        if (!bookingServiceRepository.existsById(id)) {
            throw new RuntimeException("Service not found in this booking");
        }
        bookingServiceRepository.deleteById(id);
    }

    private BookingServiceResponse convertToResponse(BookingService entity) {
        BookingServiceResponse response = new BookingServiceResponse();
        response.setServiceId(entity.getId().getServiceId());
        response.setServiceName(entity.getExtraService().getServiceName());
        response.setQuantity(entity.getQuantity());
        response.setUnitPriceSnap(entity.getUnitPriceSnap());
        response.setSubtotal(entity.getSubtotal());

        // Manual calculation if subtotal is null (before flush)
        if (response.getSubtotal() == null && entity.getUnitPriceSnap() != null && entity.getQuantity() != null) {
            response.setSubtotal(entity.getUnitPriceSnap().multiply(new java.math.BigDecimal(entity.getQuantity())));
        }

        return response;
    }
}
