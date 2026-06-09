package com.hotel.modules.email.service;

import com.hotel.common.utils.TaxUtil;
import com.hotel.modules.auth.entity.User;
import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingRoom;
import com.hotel.modules.email.dto.EmailRequest;
import com.hotel.modules.rooms.entity.Room;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    private final TemplateEngine templateEngine;

    public void sendMail(String toEmail, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }

    public void sendMailWithThymeleaf(String toEmail, String subject, EmailRequest request) {
        Context context = new Context();
        context.setVariable("booking", request);
        String templateName = "en".equals(request.getLanguage()) ? "success-email-en" : "success-email";
        String htmlContent = templateEngine.process(templateName, context);
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(message, "utf-8");
        try {
            messageHelper.setTo(toEmail);
            messageHelper.setSubject(subject);
            messageHelper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    public void sendConfirmationEmail(Booking booking, String language) {
        try {
            User user = booking.getUser();
            Room room = booking.getRoom();
            if (user == null || user.getEmail() == null) {
                log.error("Không tìm thấy thông tin User hoặc Email cho Booking ID: {}", booking.getBookingId());
                return;
            }
            long priceBooking = booking.getRoomPriceSnapshot().longValue() * booking.getTotalNights();
            String roomNumbers = booking.getBookingRooms() != null && !booking.getBookingRooms().isEmpty()
                    ? booking.getBookingRooms().stream()
                            .map(BookingRoom::getRoom)
                            .map(Room::getRoomNumber)
                            .reduce((a, b) -> a + ", " + b)
                            .orElse(room.getRoomNumber())
                    : room.getRoomNumber();
            long feeService = booking.getBookingServices() != null
                    ? booking.getBookingServices().stream()
                            .map(bs -> bs.getSubtotal() != null
                                    ? bs.getSubtotal()
                                    : (bs.getUnitPriceSnap() != null && bs.getQuantity() != null
                                            ? bs.getUnitPriceSnap().multiply(BigDecimal.valueOf(bs.getQuantity()))
                                            : BigDecimal.ZERO))
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .longValue()
                    : 0L;
            long discount = booking.getDiscountAmount() != null ? booking.getDiscountAmount().longValue() : 0L;
            // Hiển thị thông tin hạng thành viên thay vì voucher code
            String membershipInfo = null;
            if (booking.getIsFirstBookingDiscount() != null && booking.getIsFirstBookingDiscount()) {
                membershipInfo = "Ưu đãi thành viên mới (-" + booking.getMembershipDiscountPct() + "%)";
            } else if (booking.getMembershipDiscountPct() != null
                    && booking.getMembershipDiscountPct().compareTo(java.math.BigDecimal.ZERO) > 0) {
                membershipInfo = "Ưu đãi thành viên (-" + booking.getMembershipDiscountPct() + "%)";
            }
            long tax = TaxUtil.calculateVat(BigDecimal.valueOf(priceBooking + feeService)).longValue();
            long totalPrice = priceBooking + feeService + tax - discount;

            EmailRequest request = EmailRequest.builder()
                    .toEmail(user.getEmail())
                    .buildingName(room.getHotel().getHotelName())
                    .buildingAdress(room.getHotel().getAddress())
                    .customerName(user.getFullName())
                    .customerPhone(user.getPhone())
                    .codeBooking(booking.getBookingCode())
                    .roomCode(roomNumbers)
                    .dateBooking(booking.getCreatedAt().toLocalDate().toString())
                    .dateCheckin(booking.getCheckInDate().toString())
                    .timeCheckin("14:00")
                    .dateCheckout(booking.getCheckOutDate().toString())
                    .timeCheckout("12:00")
                    .night(Integer.valueOf(booking.getTotalNights()))
                    .people(booking.getNumAdults() + booking.getNumChildren())
                    .priceBooking(priceBooking)
                    .priceBreakfast(0L)
                    .feeService(feeService)
                    .discount(discount)
                    .voucherCode(membershipInfo)
                    .tax(tax)
                    .totalPrice(totalPrice)
                    .language(language != null ? language : "vi")
                    .build();
            String subject = "en".equals(language)
                    ? "Booking Confirmation - " + booking.getBookingCode()
                    : "Xác nhận đặt phòng thành công - " + booking.getBookingCode();
            sendMailWithThymeleaf(request.getToEmail(), subject, request);
        } catch (Exception e) {
            log.error("Lỗi gửi email xác nhận cho booking {}: {}", booking.getBookingId(), e.getMessage());
        }
    }

    /**
     * Gửi email chứa mã OTP cho đăng ký
     */
    public void sendOtpEmail(String toEmail, String otpCode, String fullName, String language) {
        try {
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("otpCode", otpCode);

            boolean isEn = "en".equalsIgnoreCase(language);
            String templateName = isEn ? "otp-email-en" : "otp-email";
            String subject = isEn ? "Email Verification Code - Hotel Booking System" : "Mã xác thực đăng ký - Hotel Booking System";

            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(message, "utf-8");
            messageHelper.setTo(toEmail);
            messageHelper.setSubject(subject);
            messageHelper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Lỗi gửi email OTP đến {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email OTP. Vui lòng thử lại!");
        }
    }

    /**
     * Gửi email chúc mừng đăng ký thành công
     */
    public void sendRegistrationSuccessEmail(String toEmail, String fullName, String language) {
        try {
            Context context = new Context();
            context.setVariable("fullName", fullName);

            boolean isEn = "en".equalsIgnoreCase(language);
            String templateName = isEn ? "registration-success-en" : "registration-success";
            String subject = isEn ? "Welcome to Hotel Booking System!" : "Chào mừng bạn đến với Hotel Booking System!";

            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(message, "utf-8");
            messageHelper.setTo(toEmail);
            messageHelper.setSubject(subject);
            messageHelper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Lỗi gửi email chúc mừng đến {}: {}", toEmail, e.getMessage());
        }
    }
}
