package com.hotel.modules.payment.service;

import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingStatus;
import com.hotel.modules.booking.service.BookingService;
import com.hotel.modules.invoice.dto.request.InvoiceCreateRequest;
import com.hotel.modules.invoice.dto.request.InvoiceItemRequest;
import com.hotel.modules.invoice.service.IInvoiceService;
import com.hotel.modules.membership.service.IMembershipService;
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
import java.math.RoundingMode;
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
    private final IMembershipService membershipService;

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
        BigDecimal payableAmount = calculatePayableAmount(booking);

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
            payment.setAmount(payableAmount);
            payment.setStatus(PaymentStatus.PENDING);
            payment.setIpAddress(ipAddress);
            payment.setLanguage(request.getLanguage() != null ? request.getLanguage() : "vi");
            log.info("Retry payment: bookingId={}, newTxnId={}", booking.getBookingId(), payment.getTransactionId());
        } else {
            payment = Payment.builder()
                    .booking(booking)
                    .amount(payableAmount)
                    .transactionId(generateTransactionId())
                    .gateway(request.getGateway())
                    .status(PaymentStatus.PENDING)
                    .ipAddress(ipAddress)
                    .currency("VND")
                    .language(request.getLanguage() != null ? request.getLanguage() : "vi")
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

    private BigDecimal calculatePayableAmount(Booking booking) {
        BigDecimal roomTotal = bookingService.calculateRoomTotal(booking);
        BigDecimal serviceTotal = BigDecimal.ZERO;
        if (booking.getBookingServices() != null) {
            serviceTotal = booking.getBookingServices().stream()
                    .map(bs -> bs.getSubtotal() != null ? bs.getSubtotal()
                            : (bs.getUnitPriceSnap() != null && bs.getQuantity() != null
                                    ? bs.getUnitPriceSnap().multiply(BigDecimal.valueOf(bs.getQuantity()))
                                    : BigDecimal.ZERO))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        BigDecimal subtotal = roomTotal.add(serviceTotal);
        BigDecimal tax = subtotal.multiply(new BigDecimal("10.00"))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal discount = booking.getDiscountAmount() != null
                ? booking.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal payable = subtotal.add(tax).subtract(discount);
        return payable.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
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
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());

            Booking booking = payment.getBooking();
            if (booking != null) {
                booking.setStatus(BookingStatus.CONFIRMED);
                autoCreateInvoice(payment, booking);

                // Cập nhật hạng thành viên sau khi thanh toán thành công
                if (booking.getUser() != null) {
                    try {
                        BigDecimal paidAmount = payment.getAmount();
                        membershipService.recordCompletedBooking(
                                booking.getUser().getUserId(), paidAmount);
                    } catch (Exception e) {
                        log.error("Lỗi khi cập nhật membership cho userId={}: {}",
                                booking.getUser().getUserId(), e.getMessage());
                    }
                }
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

            // line items: phòng
            List<InvoiceItemRequest> items = new java.util.ArrayList<>();
            if (booking.getBookingRooms() != null && !booking.getBookingRooms().isEmpty()) {
                booking.getBookingRooms().forEach(br -> {
                    Room room = br.getRoom();
                    InvoiceItemRequest roomItem = new InvoiceItemRequest();
                    roomItem.setItemType("ROOM");
                    String roomType = room.getRoomType() != null ? room.getRoomType().getTypeName() : "Phòng";
                    String hotelName = room.getHotel() != null ? room.getHotel().getHotelName() : "";
                    String hotelAddress = room.getHotel() != null ? room.getHotel().getAddress() : "";
                    roomItem.setDescription(roomType + " - Phòng " + room.getRoomNumber()
                            + " - " + hotelName + " - " + hotelAddress
                            + " x " + booking.getTotalNights() + " đêm");
                    roomItem.setQuantity(booking.getTotalNights());
                    roomItem.setUnitPrice(br.getRoomPriceSnapshot());
                    items.add(roomItem);
                });
            } else {
                Room room = booking.getRoom();
                InvoiceItemRequest roomItem = new InvoiceItemRequest();
                roomItem.setItemType("ROOM");
                String hotelName = room.getHotel() != null ? room.getHotel().getHotelName() : "";
                String hotelAddress = room.getHotel() != null ? room.getHotel().getAddress() : "";
                roomItem.setDescription("Phòng " + room.getRoomNumber()
                        + " - " + hotelName + " - " + hotelAddress
                        + " x " + booking.getTotalNights() + " đêm");
                roomItem.setQuantity(booking.getTotalNights());
                roomItem.setUnitPrice(booking.getRoomPriceSnapshot());
                items.add(roomItem);
            }

            // line items: dịch vụ thêm
            for (com.hotel.modules.booking_services.entity.BookingService bs : booking.getBookingServices()) {
                InvoiceItemRequest svcItem = new InvoiceItemRequest();
                svcItem.setItemType("SERVICE");
                String svcName = (bs.getExtraService() != null) ? bs.getExtraService().getServiceName() : "Dịch vụ";
                svcItem.setDescription(svcName);
                svcItem.setQuantity(bs.getQuantity() != null ? bs.getQuantity() : (short) 1);
                svcItem.setUnitPrice(bs.getUnitPriceSnap() != null ? bs.getUnitPriceSnap() : BigDecimal.ZERO);
                items.add(svcItem);
            }

            // thông tin cần thiết cho req để tạo invoice
            InvoiceCreateRequest invoiceRequest = new InvoiceCreateRequest();
            invoiceRequest.setBookingId(booking.getBookingId());
            invoiceRequest.setPaymentId(payment.getPaymentId());
            // dùng discountAmount từ voucher đã áp dụng (ZERO nếu không có voucher)
            invoiceRequest.setDiscountAmount(booking.getDiscountAmount());
            invoiceRequest.setNotes("Tự động tạo sau khi thanh toán qua " + payment.getGateway());
            invoiceRequest.setItems(items);

            // tạo invoice
            invoiceService.createInvoice(invoiceRequest);
            log.info("Đã tự động tạo invoice cho bookingId={}, discount={}",
                    booking.getBookingId(), booking.getDiscountAmount());

        } catch (Exception e) {
            log.error("Lỗi khi tự động tạo invoice cho bookingId={}: {}",
                    booking.getBookingId(), e.getMessage());
        }
    }

}
