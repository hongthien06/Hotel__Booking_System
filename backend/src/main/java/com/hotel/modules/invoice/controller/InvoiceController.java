package com.hotel.modules.invoice.controller;

import com.hotel.modules.invoice.dto.request.InvoiceCreateRequest;
import com.hotel.modules.invoice.dto.request.InvoiceQueryRequest;
import com.hotel.modules.invoice.dto.request.InvoiceUpdateRequest;
import com.hotel.modules.invoice.dto.response.InvoiceResponse;
import com.hotel.modules.invoice.entity.Invoice;
import com.hotel.modules.invoice.service.IInvoiceService;
import com.hotel.modules.invoice.service.IPdfService;
import com.hotel.modules.invoice.service.InvoiceService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final IInvoiceService invoiceService;

    private final IPdfService pdfService;

    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(@Validated @RequestBody InvoiceCreateRequest request) {
        InvoiceResponse newInvoice = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatusCode.valueOf(201)).body(newInvoice);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        InvoiceResponse foundInvoice = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(foundInvoice);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByBookingId(@PathVariable("bookingId") Long bookingId) {
        InvoiceResponse invoice = invoiceService.getInvoiceByBookingId(bookingId);
        return ResponseEntity.ok(invoice);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<InvoiceResponse> updateInvoice(@PathVariable Long id,
            @RequestBody InvoiceUpdateRequest request) {
        InvoiceResponse updateInvoice = invoiceService.updateInvoice(id, request.getNotes(), request.getPdfUrl());
        return ResponseEntity.ok(updateInvoice);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<InvoiceResponse>> getAllInvoices(InvoiceQueryRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), Sort.by("issuedAt").descending());

        Page<InvoiceResponse> invoices = invoiceService.getInvoices(
                request.getStartDateTime(),
                request.getEndDateTime(),
                pageable);

        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/invoice/{id}/pdf")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        byte[] pdf = pdfService.generateInvoicePdf(id);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=invoice.pdf")
                .body(pdf);
    }
}
