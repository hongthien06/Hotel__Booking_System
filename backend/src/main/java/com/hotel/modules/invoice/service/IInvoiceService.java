package com.hotel.modules.invoice.service;

import com.hotel.modules.invoice.dto.request.InvoiceCreateRequest;
import com.hotel.modules.invoice.dto.response.InvoiceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface IInvoiceService {

    InvoiceResponse createInvoice(InvoiceCreateRequest request);
    InvoiceResponse getInvoiceById(Long id);
    InvoiceResponse getInvoiceByBookingId(Long bookingId);
    InvoiceResponse getInvoiceByPaymentId(Long paymentId);
    Page<InvoiceResponse> getInvoices(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    InvoiceResponse updateInvoice(Long id, String notes, String pdfUrl);
    void deleteInvoice(Long id);

    /**
     * Kiểm tra hóa đơn đã tồn tại cho booking chưa.
     */
    boolean existsByBookingId(Long bookingId);
}
