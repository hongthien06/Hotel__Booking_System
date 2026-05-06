package com.hotel.modules.payment.service;

import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingStatus;
import com.hotel.modules.booking.service.BookingService;
import com.hotel.modules.invoice.dto.request.InvoiceCreateRequest;
import com.hotel.modules.invoice.dto.request.InvoiceItemRequest;
import com.hotel.modules.invoice.service.IInvoiceService;
import com.hotel.modules.payment.dto.request.MoMoRequest;
import com.hotel.modules.payment.dto.request.PaymentRequest;
import com.hotel.modules.payment.dto.request.VNPayRequest;
import com.hotel.modules.payment.dto.response.MomoResponse;
import com.hotel.modules.payment.dto.response.PaymentCreateResponse;
import com.hotel.modules.payment.dto.response.PaymentResponse;
import com.hotel.modules.payment.dto.response.VNPayResponse;
import com.hotel.modules.payment.entity.Payment;
import com.hotel.modules.payment.entity.PaymentGateway;
import com.hotel.modules.payment.entity.PaymentStatus;
import com.hotel.modules.payment.repository.PaymentRepository;
import com.hotel.modules.rooms.entity.Room;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import static com.hotel.modules.booking.entity.CancelActor.SYSTEM;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {

    private final PaymentRepository paymentRepository;
    private final IInvoiceService invoiceService;
    private final BookingService bookingService;

    private final IVNPayService vnPayService;
    private final IMomoService momoService;

    @Override
    @Transactional
    public PaymentCreateResponse createInitialPayment(PaymentRequest request, String ipAddress) {
        log.info("createInitialPayment ip={}, bookingCode={}", ipAddress, request.getBookingCode());
        Booking booking = bookingService.findByBookingCode(request.getBookingCode());
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Booking #" + booking.getBookingId()
                    + " đã không còn ở trạng thái PENDING (hiện tại: " + booking.getStatus()
                    + "). Vui lòng tạo booking mới để thanh toán.");
        }

        // Xử lý retry: nếu đã có payment cho booking này thì tái sử dụng record cũ
        // (DB có unique constraint booking_id trên bảng Payments)
        Payment payment = paymentRepository.findByBookingId(booking.getBookingId()).orElse(null);
        if (payment != null) {
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                throw new IllegalStateException("Booking này đã được thanh toán thành công");
            }
            // PENDING hết hạn hoặc FAILED → tạo transactionId mới để gateway chấp nhận
            payment.setTransactionId(generateTransactionId());
            payment.setGateway(request.getGateway());
            payment.setAmount(request.getAmount());
            payment.setStatus(PaymentStatus.PENDING);
            payment.setIpAddress(ipAddress);
            log.info("Retry payment: bookingId={}, newTxnId={}", booking.getBookingId(), payment.getTransactionId());
        } else {
            payment = Payment.builder()
                    .booking(booking)
                    .amount(request.getAmount())
                    .transactionId(generateTransactionId())
                    .gateway(request.getGateway())
                    .status(PaymentStatus.PENDING)
                    .ipAddress(ipAddress)
                    .currency("VND")
                    .build();
        }
        payment = paymentRepository.save(payment);

        // txnRef phải duy nhất mỗi lần gửi sang gateway → dùng transactionId (không dùng bookingId/bookingCode)
        String txnRef = payment.getTransactionId();
        PaymentGateway gateway = request.getGateway();
        String paymentUrl = "";
        if (gateway == PaymentGateway.VNPAY) {
            VNPayRequest vnpRequest = VNPayRequest.builder()
                    .amount(payment.getAmount().toPlainString())
                    .txnRef(txnRef)
                    .requestId(txnRef)
                    .ipAddress(ipAddress)
                    .build();
            VNPayResponse vnPayResponse = vnPayService.init(vnpRequest);
            paymentUrl = vnPayResponse.getVnpUrl();
        } else if (gateway == PaymentGateway.MOMO) {
            MoMoRequest moMoRequest = MoMoRequest.builder()
                    .amount(payment.getAmount().longValue())
                    .orderId(txnRef)
                    .requestId(txnRef)
                    .build();
            MomoResponse momoResponse = momoService.createQR(moMoRequest);
            paymentUrl = momoResponse.getPayUrl();
        } else {
            throw new IllegalArgumentException("Unsupported payment gateway");
        }
        return PaymentCreateResponse.builder()
                .bookingCode(payment.getBooking().getBookingCode())
                .paymnent_url(paymentUrl)
                .payment(mapToResponse(payment))
                .build();
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .gateway(payment.getGateway())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private static String generateTransactionId() {
        String time = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return "TXN_" + time + "_" + uuid;
    }

    @Override
    @Transactional
    public Payment findByBookingCode(String bookingCode) {
        return paymentRepository.findByBookingCode(bookingCode).orElse(null);
    }

    @Override
    @Transactional
    public Payment findByPaymentId(Long paymentId) {
        return paymentRepository.findById(paymentId).orElse(null);
    }

    @Override
    @Transactional
    public Payment findByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId).orElse(null);
    }

    @Override
    @Transactional
    public Payment findByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId).orElse(null);
    }

    // Cập nhật kết quả thanh toán sau khi IPN
    @Override
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
                bookingService.cancelBooking(booking.getBookingId(), booking.getUser().getUserId(), SYSTEM);
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
            Room room = booking.getRoom();
            roomItem.setItemType("ROOM");
            roomItem.setDescription("Phòng " + room.getRoomNumber()
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

}
