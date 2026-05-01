package com.hotel.modules.email.service;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.booking.entity.Booking;
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
        String htmlContent = templateEngine.process("success-email", context);
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

    public void sendConfirmationEmail(Booking booking) {
        try {
            User user = booking.getUser();
            Room room = booking.getRoom();
            if (user == null || user.getEmail() == null) {
                log.error("Không tìm thấy thông tin User hoặc Email cho Booking ID: {}", booking.getBookingId());
                return;
            }
            Long priceBooking = booking.getRoomPriceSnapshot().longValue() * booking.getTotalNights();
            Long tax = (long) (priceBooking * 0.08);// tax o involve;
            long totalPrice = priceBooking + tax;

            EmailRequest request = EmailRequest.builder()
                    .toEmail(user.getEmail())
                    .buildingName(room.getHotel().getHotelName()) 
                    .buildingAdress(room.getHotel().getAddress())
                    .customerName(user.getFullName())
                    .customerPhone(user.getPhone())
                    .codeBooking(booking.getBookingCode())
                    .dateBooking(booking.getCreatedAt().toLocalDate().toString())
                    .dateCheckin(booking.getCheckInDate().toString())
                    .timeCheckin("14:00")
                    .dateCheckout(booking.getCheckOutDate().toString())
                    .timeCheckout("12:00")
                    .night(Integer.valueOf(booking.getTotalNights()))
                    .people(booking.getNumAdults() + booking.getNumChildren())
                    .priceBooking(priceBooking)
                    .priceBreakfast(0L)
                    .feeService(0L)
                    .tax(tax)
                    .totalPrice(totalPrice)
                    .build();
            String subject = "Xác nhận đặt phòng thành công - " + booking.getBookingCode();
            sendMailWithThymeleaf(request.getToEmail(), subject, request);
        } catch (Exception e) {
            log.error("Lỗi gửi email xác nhận cho booking {}: {}", booking.getBookingId(), e.getMessage());
        }
    }
}
