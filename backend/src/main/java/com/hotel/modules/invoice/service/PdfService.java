package com.hotel.modules.invoice.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.Normalizer;

import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.hotel.modules.booking.dto.BookingDTO;
import com.hotel.modules.booking.repository.BookingRepository;
import com.hotel.modules.invoice.dto.response.InvoiceResponse;
import com.itextpdf.html2pdf.HtmlConverter;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfService implements IPdfService {

    private final IInvoiceService invoiceService;
    private final BookingRepository bookingRepo;
    private final TemplateEngine templateEngine;

    @Transactional
    public byte[] generateInvoicePdf(Long invoiceId) {
        InvoiceResponse invoice = invoiceService.getInvoiceById(invoiceId);

        var booking = bookingRepo.findById(invoice.getBookingId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Booking not found #" + invoice.getBookingId()));

        BookingDTO dto = new BookingDTO();
        dto.setBookingId(booking.getBookingId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setTotalNights(booking.getTotalNights());
        if (booking.getUser() != null) {
            dto.setUserName(vn(booking.getUser().getFullName()));
            dto.setUserEmail(booking.getUser().getEmail());
            dto.setUserPhone(booking.getUser().getPhone());
        }
        if (booking.getRoom() != null) {
            dto.setRoomNumber(booking.getRoom().getRoomNumber());
            dto.setHotelName(vn(booking.getRoom().getHotel().getHotelName()));
            dto.setHotelAddress(vn(booking.getRoom().getHotel().getAddress()));
            if (booking.getRoom().getRoomType() != null) {
                dto.setRoomTypeName(vn(booking.getRoom().getRoomType().getTypeName()));
            }
        }

        // Strip Vietnamese diacritics from dynamic item descriptions
        if (invoice.getItems() != null) {
            invoice.getItems().forEach(item -> item.setDescription(vn(item.getDescription())));
        }

        Context ctx = new Context();
        ctx.setVariable("invoice", invoice);
        ctx.setVariable("booking", dto);
        String html = templateEngine.process("invoice-pdf", ctx);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            HtmlConverter.convertToPdf(html, baos);
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Loi tao PDF: {}", e.getMessage());
            throw new RuntimeException("Khong the tao PDF: " + e.getMessage(), e);
        }
    }

    /** Strips Vietnamese diacritics so text renders with standard PDF fonts. */
    private String vn(String text) {
        if (text == null) return "";
        text = text.replace("đ", "d").replace("Đ", "D");
        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}", "");
    }
}
