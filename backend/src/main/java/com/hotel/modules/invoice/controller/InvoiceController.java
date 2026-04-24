package com.hotel.modules.invoice.controller;

import com.hotel.modules.invoice.dto.request.InvoiceCreateRequest;
import com.hotel.modules.invoice.dto.request.InvoiceUpdateRequest;
import com.hotel.modules.invoice.dto.response.InvoiceResponse;
import com.hotel.modules.invoice.service.IInvoiceService;
import com.hotel.modules.invoice.service.PdfService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final IInvoiceService invoiceService;
    private final PdfService pdfService;

    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(
            @Validated @RequestBody InvoiceCreateRequest request) {
        InvoiceResponse newInvoice = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newInvoice);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        InvoiceResponse foundInvoice = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(foundInvoice);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByBookingId(
            @PathVariable("bookingId") Long bookingId) {
        InvoiceResponse invoice = invoiceService.getInvoiceByBookingId(bookingId);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/payment/{paymentId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByPaymentId(
            @PathVariable Long paymentId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByPaymentId(paymentId));
    }

    @GetMapping
    public ResponseEntity<Page<InvoiceResponse>> getAllInvoices(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "startDate", required = false)
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false)
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime   = (endDate   != null) ? endDate.atTime(LocalTime.MAX) : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by("issuedAt").descending());
        Page<InvoiceResponse> invoices = invoiceService.getInvoices(startDateTime, endDateTime, pageable);
        return ResponseEntity.ok(invoices);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<InvoiceResponse> updateInvoice(
            @PathVariable Long id,
            @RequestBody InvoiceUpdateRequest request) {
        return ResponseEntity.ok(invoiceService.updateInvoice(id, request.getNotes(), request.getPdfUrl()));
    }

    // ── GET /invoices/{id}/pdf ──────────────────────────────────────
    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
        byte[] pdf = pdfService.generateInvoicePdf(id);

        InvoiceResponse invoice = invoiceService.getInvoiceById(id);
        String filename = "invoice-" + invoice.getInvoiceNumber() + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdf.length);

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
