package com.hotel.modules.invoice.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.repository.BookingRepository;
import com.hotel.modules.invoice.dto.request.InvoiceCreateRequest;
import com.hotel.modules.invoice.dto.request.InvoiceItemRequest;
import com.hotel.modules.invoice.dto.response.InvoiceItemResponse;
import com.hotel.modules.invoice.dto.response.InvoiceResponse;
import com.hotel.modules.invoice.entity.Invoice;
import com.hotel.modules.invoice.entity.InvoiceItem;
import com.hotel.modules.invoice.repository.InvoiceItemRepository;
import com.hotel.modules.invoice.repository.InvoiceRepository;
import com.hotel.modules.payment.entity.Payment;
import com.hotel.modules.payment.repository.PaymentRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService implements IInvoiceService {

        private final InvoiceRepository invoiceRepository;
        private final InvoiceItemRepository invoiceItemRepository;
        private final BookingRepository bookingRepository;
        private final PaymentRepository paymentRepository;

        // CREATE INVOICE
        @Override
        @Transactional
        public InvoiceResponse createInvoice(InvoiceCreateRequest request) {
                log.info("Creating invoice for bookingId={}, paymentId={}",
                                request.getBookingId(), request.getPaymentId());

                if (invoiceRepository.existsByBooking_BookingId(request.getBookingId())) {
                        throw new IllegalStateException(
                                        "Hóa đơn cho booking #" + request.getBookingId() + " đã tồn tại");
                }

                Booking booking = bookingRepository.findById(request.getBookingId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy booking #" + request.getBookingId()));
                Payment payment = paymentRepository.findById(request.getPaymentId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy payment #" + request.getPaymentId()));

                BigDecimal subtotal = request.getItems().stream()
                                .map(item -> item.getUnitPrice()
                                                .multiply(BigDecimal.valueOf(item.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal taxRate = new BigDecimal("10.00");
                BigDecimal discountAmount = request.getDiscountAmount() != null
                                ? request.getDiscountAmount()
                                : BigDecimal.ZERO;

                BigDecimal taxAmount = subtotal.multiply(taxRate)
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                BigDecimal totalAmount = subtotal.add(taxAmount).subtract(discountAmount);

                String invoiceNumber = "INV-"
                                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                                + "-" + request.getBookingId();

                Invoice invoice = Invoice.builder()
                                .booking(booking)
                                .payment(payment)
                                .invoiceNumber(invoiceNumber)
                                .transactionId(java.util.UUID.randomUUID().toString().replace("-", "").toUpperCase())
                                .subtotal(subtotal)
                                .taxRate(taxRate)
                                .taxAmount(taxAmount)
                                .discountAmount(discountAmount)
                                .totalAmount(totalAmount)
                                .notes(request.getNotes())
                                .build();

                invoice = invoiceRepository.save(invoice);

                final Invoice savedInvoice = invoice;
                List<InvoiceItem> items = request.getItems().stream()
                                .map(itemReq -> buildInvoiceItem(itemReq, savedInvoice))
                                .collect(Collectors.toList());

                invoiceItemRepository.saveAll(items);

                log.info("Invoice created: id={}, number={}", savedInvoice.getId(), invoiceNumber);
                return toResponse(savedInvoice, items);
        }

        @Override
        @Transactional
        public InvoiceResponse getInvoiceById(Long id) {
                Invoice invoice = findInvoiceOrThrow(id);
                List<InvoiceItem> items = invoiceItemRepository.findByInvoice_Id(id);

                return toResponse(invoice, items);
        }

        @Override
        @Transactional
        public InvoiceResponse getInvoiceByBookingCode(String BookingCode) {
                Invoice invoice = invoiceRepository.findByBooking_BookingCode(BookingCode)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy hóa đơn cho booking #" + BookingCode));
                List<InvoiceItem> items = invoiceItemRepository.findByInvoice_Id(invoice.getId());

                return toResponse(invoice, items);
        }

        @Override
        @Transactional
        public InvoiceResponse getInvoiceByPaymentId(Long paymentId) {
                Invoice invoice = invoiceRepository.findByPayment_PaymentId(paymentId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy hóa đơn cho payment #" + paymentId));
                List<InvoiceItem> items = invoiceItemRepository.findByInvoice_Id(invoice.getId());

                return toResponse(invoice, items);
        }

        @Override
        @Transactional
        public Page<InvoiceResponse> getInvoices(LocalDateTime startDate,
                        LocalDateTime endDate,
                        Pageable pageable) {
                return invoiceRepository
                                .findAllWithFilters(startDate, endDate, pageable)
                                .map(invoice -> {
                                        List<InvoiceItem> items = invoiceItemRepository
                                                        .findByInvoice_Id(invoice.getId());

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
                List<InvoiceItem> items = invoiceItemRepository.findByInvoice_Id(id);

                log.info("Invoice updated: id={}", id);
                return toResponse(invoice, items);
        }

        // DELETE
        @Override
        @Transactional
        public void deleteInvoice(Long id) {
                findInvoiceOrThrow(id);
                invoiceItemRepository.deleteByInvoice_Id(id);

                invoiceRepository.deleteById(id);
                log.info("Invoice deleted: id={}", id);
        }

        @Override
        public boolean existsByBookingId(Long bookingId) {
                return invoiceRepository.existsByBooking_BookingId(bookingId);
        }

        private Invoice findInvoiceOrThrow(Long id) {
                return invoiceRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Không tìm thấy hóa đơn với id=" + id));
        }

        private InvoiceItem buildInvoiceItem(InvoiceItemRequest req, Invoice invoice) {
                BigDecimal lineTotal = req.getUnitPrice()
                                .multiply(BigDecimal.valueOf(req.getQuantity()));
                return InvoiceItem.builder()
                                .invoice(invoice)
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
                                .invoiceId(item.getInvoice().getId())
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
                                .bookingId(invoice.getBooking().getBookingId())
                                .paymentId(invoice.getPayment().getPaymentId())
                                .invoiceNumber(invoice.getInvoiceNumber())
                                .transactionId(invoice.getTransactionId())
                                .bookingCode(invoice.getBooking().getBookingCode())
                                .checkInDate(invoice.getBooking().getCheckInDate())
                                .checkOutDate(invoice.getBooking().getCheckOutDate())
                                .totalNight(invoice.getBooking().getTotalNights())
                                .numGuests((byte) (invoice.getBooking().getNumAdults() + invoice.getBooking().getNumChildren()))
                                .address(invoice.getBooking().getRoom().getHotel().getAddress())
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
