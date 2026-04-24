package com.hotel.modules.invoice.service;

import com.hotel.modules.invoice.dto.request.InvoiceCreateRequest;
import com.hotel.modules.invoice.dto.request.InvoiceItemRequest;
import com.hotel.modules.invoice.dto.response.InvoiceItemResponse;
import com.hotel.modules.invoice.dto.response.InvoiceResponse;
import com.hotel.modules.invoice.entity.Invoice;
import com.hotel.modules.invoice.entity.InvoiceItem;
import com.hotel.modules.invoice.repository.InvoiceItemRepository;
import com.hotel.modules.invoice.repository.InvoiceRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService implements IInvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;

    // CREATE INVOICE
    @Override
    @Transactional
    public InvoiceResponse createInvoice(InvoiceCreateRequest request) {
        log.info("Creating invoice for bookingId={}, paymentId={}",
                request.getBookingId(), request.getPaymentId());
        // check xem có tồn tại cái đơn booking không
        if (invoiceRepository.existsByBookingId(request.getBookingId())) {
            throw new IllegalStateException(
                    "Hóa đơn cho booking #" + request.getBookingId() + " đã tồn tại");
        }
        // tính tổng tiền của các hóa đơn items
        BigDecimal subtotal = request.getItems().stream()
                .map(item -> item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // thuế 10%
        BigDecimal taxRate = new BigDecimal("10.00");
        // check xem có discount k ? lấy amount : 0
        BigDecimal discountAmount = request.getDiscountAmount() != null
                ? request.getDiscountAmount()
                : BigDecimal.ZERO;
        // Tính thuế
        BigDecimal taxAmount = subtotal.multiply(taxRate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        // total = subtotal + tax - discount
        BigDecimal totalAmount = subtotal.add(taxAmount).subtract(discountAmount);
        // generate code for invoice
        String invoiceNumber = "INV-"
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + request.getBookingId();
        // build invoice entity
        Invoice invoice = Invoice.builder()
                .bookingId(request.getBookingId())
                .paymentId(request.getPaymentId())
                .invoiceNumber(invoiceNumber)
                .subtotal(subtotal)
                .taxRate(taxRate)
                .taxAmount(taxAmount)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .notes(request.getNotes())
                .build();
        // save invoice
        invoice = invoiceRepository.save(invoice);
        // save items
        final Long invoiceId = invoice.getId();
        List<InvoiceItem> items = request.getItems().stream()
                .map(itemReq -> buildInvoiceItem(itemReq, invoiceId))// build từng cái item invoice
                .collect(Collectors.toList());
        // save tất cả item
        invoiceItemRepository.saveAll(items);

        log.info("Invoice created: id={}, number={}", invoice.getId(), invoiceNumber);
        return toResponse(invoice, items);
    }

    @Override
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = findInvoiceOrThrow(id);
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(id);
        return toResponse(invoice, items);
    }

    @Override
    public InvoiceResponse getInvoiceByBookingId(Long bookingId) {
        Invoice invoice = invoiceRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy hóa đơn cho booking #" + bookingId));
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoice.getId());
        return toResponse(invoice, items);
    }

    @Override
    public InvoiceResponse getInvoiceByPaymentId(Long paymentId) {
        Invoice invoice = invoiceRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy hóa đơn cho payment #" + paymentId));
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoice.getId());
        return toResponse(invoice, items);
    }

    @Override
    public Page<InvoiceResponse> getInvoices(LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {
        return invoiceRepository
                .findAllWithFilters(startDate, endDate, pageable)
                .map(invoice -> {
                    List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoice.getId());
                    return toResponse(invoice, items);
                });
    }

    // UPDATE
    @Override
    @Transactional
    public InvoiceResponse updateInvoice(Long id, String notes, String pdfUrl) {
        Invoice invoice = findInvoiceOrThrow(id);

        if (notes != null)
            invoice.setNotes(notes);
        if (pdfUrl != null)
            invoice.setPdfUrl(pdfUrl);

        invoice = invoiceRepository.save(invoice);
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(id);

        log.info("Invoice updated: id={}", id);
        return toResponse(invoice, items);
    }

    // DELETE
    @Override
    @Transactional
    public void deleteInvoice(Long id) {
        findInvoiceOrThrow(id);
        invoiceItemRepository.deleteByInvoiceId(id);
        invoiceRepository.deleteById(id);
        log.info("Invoice deleted: id={}", id);
    }

    @Override
    public boolean existsByBookingId(Long bookingId) {
        return invoiceRepository.existsByBookingId(bookingId);
    }

    private Invoice findInvoiceOrThrow(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy hóa đơn với id=" + id));
    }

    // build item invoice
    private InvoiceItem buildInvoiceItem(InvoiceItemRequest req, Long invoiceId) {
        BigDecimal lineTotal = req.getUnitPrice()
                .multiply(BigDecimal.valueOf(req.getQuantity()));
        return InvoiceItem.builder()
                .invoiceId(invoiceId)
                .itemType(req.getItemType())
                .description(req.getDescription())
                .quantity(req.getQuantity())
                .unitPrice(req.getUnitPrice())
                .lineTotal(lineTotal)
                .build();
    }

    private InvoiceItemResponse toItemResponse(InvoiceItem item) {
        return InvoiceItemResponse.builder()
                .id(item.getId())
                .invoiceId(item.getInvoiceId())
                .itemType(item.getItemType())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getLineTotal())
                .build();
    }

    private InvoiceResponse toResponse(Invoice invoice, List<InvoiceItem> items) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .bookingId(invoice.getBookingId())
                .paymentId(invoice.getPaymentId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .subtotal(invoice.getSubtotal())
                .taxRate(invoice.getTaxRate())
                .taxAmount(invoice.getTaxAmount())
                .discountAmount(invoice.getDiscountAmount())
                .totalAmount(invoice.getTotalAmount())
                .pdfUrl(invoice.getPdfUrl())
                .issuedAt(invoice.getIssuedAt())
                .notes(invoice.getNotes())
                .items(items.stream().map(this::toItemResponse).collect(Collectors.toList()))
                .build();
    }
}
