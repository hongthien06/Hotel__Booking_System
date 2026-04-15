package com.hotel.modules.email.service;

import com.hotel.modules.email.dto.EmailRequest;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    private final TemplateEngine templateEngine;

    public void sendMail(String toEmail, String subject, String content){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }

    public void sendMailWithThymeleaf(String toEmail, String subject, EmailRequest request){
        Context context = new Context();
        context.setVariable("booking", request);
        String htmlContent = templateEngine.process("success-email", context);
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(message, "utf-8");
        try{
            messageHelper.setTo(toEmail);
            messageHelper.setSubject(subject);
            messageHelper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}
