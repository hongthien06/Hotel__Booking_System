package com.hotel.modules.payment.service;

import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingStatus;
import com.hotel.modules.booking.service.BookingService;
import com.hotel.modules.invoice.dto.request.InvoiceCreateRequest;
import com.hotel.modules.invoice.dto.request.InvoiceItemRequest;
import com.hotel.modules.invoice.service.IInvoiceService;
import com.hotel.modules.payment.entity.Payment;
import com.hotel.modules.payment.entity.PaymentGateway;
import com.hotel.modules.payment.entity.PaymentStatus;
import com.hotel.modules.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import static com.hotel.modules.booking.entity.CancelActor.SYSTEM;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final IInvoiceService invoiceService;
    private final BookingService bookingService;

    // khởi tạo payment khi khách nhấn thanh toán
    @Transactional
    public Payment createInitialPayment(Booking booking, BigDecimal amount, PaymentGateway gateway) {
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(amount)
                .gateway(gateway)
                .status(PaymentStatus.PENDING)
                .transactionId(UUID.randomUUID().toString().replace("-", "").toUpperCase())
                .currency("VND")
                .build();
        return paymentRepository.save(payment);

    }

    // Tìm payment theo transactionId
    public Payment findByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId).orElse(null);
    }

    // Cập nhật kết quả thanh toán sau khi IPN
    @Transactional
    public void updatePaymentResult(Payment payment,
            String gatewayTransactionNo,
            String rawResponse,
            boolean isSuccess) {
        if (isSuccess) {
            // nếu thành công thì set status
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());

            // Cập nhật trạng thái booking là đã confirm
            Booking booking = payment.getBooking();
            if (booking != null) {
                booking.setStatus(BookingStatus.CONFIRMED);
                // tạo hóa đơn khi thanh toán thành công
                autoCreateInvoice(payment, booking);
            }

        } else {
            payment.setStatus(PaymentStatus.FAILED);
            // nếu thanh toán thất bại thì set status của booking là cancel
            Booking booking = payment.getBooking();
            if (booking != null) {
                bookingService.cancelBooking(booking.getBookingId(), null, SYSTEM);
            }
        }

        payment.setRawResponse(rawResponse);
        paymentRepository.save(payment);
    }

    // tạo hóa đơn
    private void autoCreateInvoice(Payment payment, Booking booking) {
        try {
            // check invoice exists
            if (invoiceService.existsByBookingId(booking.getBookingId())) {
                log.warn("Invoice đã tồn tại cho bookingId={}, bỏ qua tạo mới", booking.getBookingId());
                return;
            }

            // lấy thông tin cần thiết cho req
            InvoiceItemRequest roomItem = new InvoiceItemRequest();
            roomItem.setItemType("ROOM");
            roomItem.setDescription("Phòng " + booking.getRoom().getRoomNumber()
                    + " x " + booking.getTotalNights() + " đêm");
            roomItem.setQuantity(booking.getTotalNights());
            roomItem.setUnitPrice(booking.getRoomPriceSnapshot());

            // thông tin cần thiết cho req để tạo invoice
            InvoiceCreateRequest invoiceRequest = new InvoiceCreateRequest();
            invoiceRequest.setBookingId(booking.getBookingId());
            invoiceRequest.setPaymentId(payment.getPaymentId());
            invoiceRequest.setDiscountAmount(BigDecimal.ZERO);
            invoiceRequest.setNotes("Tự động tạo sau khi thanh toán qua " + payment.getGateway());
            invoiceRequest.setItems(List.of(roomItem));
            // tạo invoice
            invoiceService.createInvoice(invoiceRequest);
            log.info("Đã tự động tạo invoice cho bookingId={}", booking.getBookingId());

        } catch (Exception e) {
            log.error("Lỗi khi tự động tạo invoice cho bookingId={}: {}",
                    booking.getBookingId(), e.getMessage());
        }
    }

    /**
     * Cập nhật trạng thái thanh toán thủ công (Yêu cầu xác thực userId)
     */
    @Transactional
    public void updatePaymentStatusWithUser(Long paymentId, PaymentStatus status, Long userId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán"));

        // Kiểm tra quyền sở hữu
        if (!payment.getBooking().getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền cập nhật thanh toán này");
        }

        payment.setStatus(status);
        paymentRepository.save(payment);
        log.info("User {} updated payment {} status to {}", userId, paymentId, status);
    }
}
