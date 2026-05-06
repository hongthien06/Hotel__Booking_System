package com.hotel.modules.invoice.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hotel.modules.invoice.dto.request.InvoiceCreateRequest;
import com.hotel.modules.invoice.dto.request.InvoiceQueryRequest;
import com.hotel.modules.invoice.dto.request.InvoiceUpdateRequest;
import com.hotel.modules.invoice.dto.response.InvoiceResponse;
import com.hotel.modules.invoice.service.IInvoiceService;
import com.hotel.modules.invoice.service.IPdfService;
import com.hotel.modules.payment.entity.Payment;
import com.hotel.modules.payment.service.IPaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final IInvoiceService invoiceService;
    private final IPdfService pdfService;
    private final IPaymentService paymentService;

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

    // Tra cuu invoice qua transactionId cua Payment (dung sau khi VNPay/Momo redirect ve)
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByTransactionId(@PathVariable String transactionId) {
        Payment payment = paymentService.findByTransactionId(transactionId);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }
        InvoiceResponse invoice = invoiceService.getInvoiceByPaymentId(payment.getPaymentId());
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

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        byte[] pdf = pdfService.generateInvoicePdf(id);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=invoice.pdf")
                .body(pdf);
    }
}
